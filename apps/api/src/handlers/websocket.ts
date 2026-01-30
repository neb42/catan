import type { IncomingMessage } from 'http';
import { randomUUID } from 'node:crypto';
import { WebSocket } from 'ws';

import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  PLAYER_COLORS,
  Player,
  Room,
  WebSocketMessageSchema,
} from '@catan/shared';

import { generateBoard } from '../game/board-generator';
import { GameManager } from '../game/GameManager';
import {
  ManagedPlayer,
  ManagedRoom,
  RoomManager,
} from '../managers/RoomManager';
import { generateRoomId } from '../utils/room-id';

const GAME_START_COUNTDOWN = 5;

function sendMessage(socket: WebSocket, message: unknown): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

function serializePlayer(player: ManagedPlayer): Player {
  return {
    id: player.id,
    nickname: player.nickname,
    color: player.color,
    ready: player.ready,
  };
}

function serializeRoom(room: ManagedRoom): Room {
  return {
    id: room.id,
    createdAt: room.createdAt,
    players: Array.from(room.players.values()).map(serializePlayer),
  };
}

function getAvailableColor(room: ManagedRoom): Player['color'] | null {
  const used = new Set(Array.from(room.players.values()).map((p) => p.color));
  const color = PLAYER_COLORS.find((candidate) => !used.has(candidate));
  return color ?? null;
}

type ErrorMessage =
  | 'Room not found'
  | 'Room is full'
  | 'Nickname taken'
  | 'Invalid room ID'
  | 'Color already taken';

function sendError(socket: WebSocket, message: ErrorMessage | string): void {
  sendMessage(socket, { type: 'error', message });
}

export function handleWebSocketConnection(
  ws: WebSocket,
  roomManager: RoomManager,
  _request?: IncomingMessage,
): void {
  let currentRoomId: string | null = null;
  let playerId: string | null = null;

  ws.on('message', (data) => {
    let parsed: unknown;

    try {
      parsed = JSON.parse(data.toString());
    } catch (error) {
      console.error('Invalid JSON message', error);
      sendError(ws, 'Invalid room ID');
      return;
    }

    const result = WebSocketMessageSchema.safeParse(parsed);
    if (!result.success) {
      sendError(ws, 'Invalid room ID');
      return;
    }

    const message = result.data;

    switch (message.type) {
      case 'create_room': {
        let roomId = generateRoomId();
        while (roomManager.getRoom(roomId)) {
          roomId = generateRoomId();
        }

        const room = roomManager.createRoom(roomId);
        const color = getAvailableColor(room) ?? PLAYER_COLORS[0];
        const player: ManagedPlayer = {
          id: randomUUID(),
          nickname: message.nickname,
          color,
          ready: false,
          ws,
        };

        roomManager.addPlayer(roomId, player);
        currentRoomId = roomId;
        playerId = player.id;

        sendMessage(ws, {
          type: 'room_created',
          roomId,
          player: serializePlayer(player),
        });

        roomManager.broadcastToRoom(roomId, {
          type: 'room_state',
          room: serializeRoom(room),
        });
        break;
      }

      case 'join_room': {
        const room = roomManager.getRoom(message.roomId);
        if (!room) {
          sendError(ws, 'Room not found');
          return;
        }

        if (room.players.size >= MAX_PLAYERS) {
          sendError(ws, 'Room is full');
          return;
        }

        if (roomManager.isNicknameTaken(message.roomId, message.nickname)) {
          sendError(ws, 'Nickname taken');
          return;
        }

        const color = getAvailableColor(room);
        if (!color) {
          sendError(ws, 'Room is full');
          return;
        }

        const player: ManagedPlayer = {
          id: randomUUID(),
          nickname: message.nickname,
          color,
          ready: false,
          ws,
        };

        roomManager.addPlayer(message.roomId, player);
        currentRoomId = message.roomId;
        playerId = player.id;

        roomManager.broadcastToRoom(
          message.roomId,
          {
            type: 'player_joined',
            player: serializePlayer(player),
          },
          player.id,
        );

        roomManager.broadcastToRoom(message.roomId, {
          type: 'room_state',
          room: serializeRoom(room),
        });
        break;
      }

      case 'toggle_ready': {
        if (!currentRoomId || !playerId || message.playerId !== playerId) {
          sendError(ws, 'Room not found');
          return;
        }

        const room = roomManager.getRoom(currentRoomId);
        if (!room) {
          sendError(ws, 'Room not found');
          return;
        }

        const player = room.players.get(playerId);
        if (!player) {
          sendError(ws, 'Room not found');
          return;
        }

        player.ready = !player.ready;

        roomManager.broadcastToRoom(currentRoomId, {
          type: 'player_ready',
          playerId: player.id,
          ready: player.ready,
        });

        const readyToStart =
          room.players.size >= MIN_PLAYERS &&
          room.players.size <= MAX_PLAYERS &&
          Array.from(room.players.values()).every((p) => p.ready);

        if (readyToStart) {
          roomManager.broadcastToRoom(currentRoomId, {
            type: 'game_starting',
            countdown: GAME_START_COUNTDOWN,
          });

          setTimeout(() => {
            const roomChecking = roomManager.getRoom(currentRoomId!);
            if (!roomChecking || roomChecking.board) return;

            const board = generateBoard();
            roomManager.setBoard(currentRoomId!, board);

            const playerIds = Array.from(roomChecking.players.keys());
            const gameManager = new GameManager(board, playerIds);
            roomManager.setGameManager(currentRoomId!, gameManager);

            roomManager.broadcastToRoom(currentRoomId!, {
              type: 'game_started',
              board,
            });

            // Broadcast first turn info
            const playerId = gameManager.getCurrentPlayerId();
            const phase = gameManager.getPlacementPhase();
            const placement = gameManager.getState().placement;

            if (playerId && phase && placement) {
              roomManager.broadcastToRoom(currentRoomId!, {
                type: 'placement_turn',
                currentPlayerIndex: placement.currentPlayerIndex,
                currentPlayerId: playerId,
                phase,
                round: placement.draftRound,
                turnNumber: placement.turnNumber,
              });
            }
          }, GAME_START_COUNTDOWN * 1000);
        }

        roomManager.broadcastToRoom(currentRoomId, {
          type: 'room_state',
          room: serializeRoom(room),
        });
        break;
      }

      case 'change_color': {
        if (!currentRoomId || !playerId || message.playerId !== playerId) {
          sendError(ws, 'Room not found');
          return;
        }

        const room = roomManager.getRoom(currentRoomId);
        if (!room) {
          sendError(ws, 'Room not found');
          return;
        }

        const colorTaken = Array.from(room.players.values()).some(
          (p) => p.color === message.color && p.id !== playerId,
        );

        if (colorTaken) {
          sendError(ws, 'Color already taken');
          return;
        }

        const player = room.players.get(playerId);
        if (!player) {
          sendError(ws, 'Room not found');
          return;
        }

        player.color = message.color;

        roomManager.broadcastToRoom(currentRoomId, {
          type: 'color_changed',
          playerId: player.id,
          color: player.color,
        });

        roomManager.broadcastToRoom(currentRoomId, {
          type: 'room_state',
          room: serializeRoom(room),
        });
        break;
      }

      case 'place_settlement': {
        if (!currentRoomId || !playerId) {
          sendError(ws, 'Room not found');
          return;
        }

        const gameManager = roomManager.getGameManager(currentRoomId);
        if (!gameManager) {
          sendError(ws, 'Game not started');
          return;
        }

        const result = gameManager.placeSettlement(message.vertexId, playerId);

        if (!result.success) {
          sendError(ws, result.error || 'Invalid placement');
          return;
        }

        // Broadcast successful placement
        roomManager.broadcastToRoom(currentRoomId, {
          type: 'settlement_placed',
          vertexId: message.vertexId,
          playerId,
          isSecondSettlement: result.isSecondSettlement,
          resourcesGranted: result.resourcesGranted,
        });

        // Broadcast next turn info
        const nextPlayerId = gameManager.getCurrentPlayerId();
        const nextPhase = gameManager.getPlacementPhase();
        const placement = gameManager.getState().placement;

        if (nextPlayerId && nextPhase && placement) {
          roomManager.broadcastToRoom(currentRoomId, {
            type: 'placement_turn',
            currentPlayerIndex: placement.currentPlayerIndex,
            currentPlayerId: nextPlayerId,
            phase: nextPhase,
            round: placement.draftRound,
            turnNumber: placement.turnNumber,
          });
        }
        break;
      }

      case 'place_road': {
        if (!currentRoomId || !playerId) {
          sendError(ws, 'Room not found');
          return;
        }

        const gameManager = roomManager.getGameManager(currentRoomId);
        if (!gameManager) {
          sendError(ws, 'Game not started');
          return;
        }

        const result = gameManager.placeRoad(message.edgeId, playerId);

        if (!result.success) {
          sendError(ws, result.error || 'Invalid placement');
          return;
        }

        // Broadcast successful placement
        roomManager.broadcastToRoom(currentRoomId, {
          type: 'road_placed',
          edgeId: message.edgeId,
          playerId,
        });

        if (result.setupComplete) {
          // Setup phase complete
          const turnState = gameManager.getState().turnState;
          roomManager.broadcastToRoom(currentRoomId, {
            type: 'setup_complete',
            nextPlayerId: turnState?.currentPlayerId || playerId,
          });

          // Also broadcast initial turn state for main game
          if (turnState) {
            roomManager.broadcastToRoom(currentRoomId, {
              type: 'turn_changed',
              currentPlayerId: turnState.currentPlayerId,
              turnNumber: turnState.turnNumber,
              phase: turnState.phase,
            });
          }
        } else {
          // Broadcast next turn info
          const nextPlayerId = gameManager.getCurrentPlayerId();
          const nextPhase = gameManager.getPlacementPhase();
          const placement = gameManager.getState().placement;

          if (nextPlayerId && nextPhase && placement) {
            roomManager.broadcastToRoom(currentRoomId, {
              type: 'placement_turn',
              currentPlayerIndex: placement.currentPlayerIndex,
              currentPlayerId: nextPlayerId,
              phase: nextPhase,
              round: placement.draftRound,
              turnNumber: placement.turnNumber,
            });
          }
        }
        break;
      }

      case 'roll_dice': {
        if (!currentRoomId || !playerId) {
          sendError(ws, 'Room not found');
          return;
        }

        const gameManager = roomManager.getGameManager(currentRoomId);
        if (!gameManager) {
          sendError(ws, 'Game not started');
          return;
        }

        const result = gameManager.rollDice(playerId);

        if (!result.success) {
          sendError(ws, result.error || 'Cannot roll dice');
          return;
        }

        // Broadcast dice roll result to all players
        roomManager.broadcastToRoom(currentRoomId, {
          type: 'dice_rolled',
          dice1: result.dice1!,
          dice2: result.dice2!,
          total: result.total!,
          resourcesDistributed: result.resourcesDistributed || [],
        });

        // Handle robber triggered (rolled 7)
        if (result.robberTriggered) {
          // Send discard_required to each player who must discard
          for (const {
            playerId: discardPlayerId,
            targetCount,
          } of result.mustDiscardPlayers || []) {
            const playerWs = roomManager.getPlayerWebSocket(
              currentRoomId,
              discardPlayerId,
            );
            if (playerWs && playerWs.readyState === WebSocket.OPEN) {
              const playerResources =
                gameManager.getPlayerResources(discardPlayerId);
              playerWs.send(
                JSON.stringify({
                  type: 'discard_required',
                  playerId: discardPlayerId,
                  targetCount,
                  currentResources: playerResources,
                }),
              );
            }
          }

          // Also broadcast robber_triggered so all clients know robber flow is active
          roomManager.broadcastToRoom(currentRoomId, {
            type: 'robber_triggered',
            mustDiscardPlayers: result.mustDiscardPlayers || [],
          });

          // If no discards needed, immediately send robber_move_required
          if (result.proceedToRobberMove) {
            const moverWs = roomManager.getPlayerWebSocket(
              currentRoomId,
              playerId,
            );
            if (moverWs && moverWs.readyState === WebSocket.OPEN) {
              moverWs.send(
                JSON.stringify({
                  type: 'robber_move_required',
                  currentHexId: gameManager.getGameState().robberHexId,
                }),
              );
            }
          }
        }
        break;
      }

      case 'end_turn': {
        if (!currentRoomId || !playerId) {
          sendError(ws, 'Room not found');
          return;
        }

        const gameManager = roomManager.getGameManager(currentRoomId);
        if (!gameManager) {
          sendError(ws, 'Game not started');
          return;
        }

        const result = gameManager.endTurn(playerId);

        if (!result.success) {
          sendError(ws, result.error || 'Cannot end turn');
          return;
        }

        // Broadcast turn change to all players
        roomManager.broadcastToRoom(currentRoomId, {
          type: 'turn_changed',
          currentPlayerId: result.nextPlayerId!,
          turnNumber: result.turnNumber!,
          phase: 'roll',
        });
        break;
      }

      case 'build_road': {
        if (!currentRoomId || !playerId) {
          sendError(ws, 'Room not found');
          return;
        }

        const gameManager = roomManager.getGameManager(currentRoomId);
        if (!gameManager) {
          sendError(ws, 'Game not started');
          return;
        }

        const result = gameManager.buildRoad(message.edgeId, playerId);

        if (!result.success) {
          sendMessage(ws, {
            type: 'build_failed',
            reason: result.error || 'Build failed',
          });
          return;
        }

        // Broadcast successful road build to all players
        roomManager.broadcastToRoom(currentRoomId, {
          type: 'road_built',
          edgeId: message.edgeId,
          playerId,
          resourcesSpent: result.resourcesSpent || {},
        });
        break;
      }

      case 'build_settlement': {
        if (!currentRoomId || !playerId) {
          sendError(ws, 'Room not found');
          return;
        }

        const gameManager = roomManager.getGameManager(currentRoomId);
        if (!gameManager) {
          sendError(ws, 'Game not started');
          return;
        }

        const result = gameManager.buildSettlement(message.vertexId, playerId);

        if (!result.success) {
          sendMessage(ws, {
            type: 'build_failed',
            reason: result.error || 'Build failed',
          });
          return;
        }

        // Broadcast successful settlement build to all players
        roomManager.broadcastToRoom(currentRoomId, {
          type: 'settlement_built',
          vertexId: message.vertexId,
          playerId,
          resourcesSpent: result.resourcesSpent || {},
        });
        break;
      }

      case 'build_city': {
        if (!currentRoomId || !playerId) {
          sendError(ws, 'Room not found');
          return;
        }

        const gameManager = roomManager.getGameManager(currentRoomId);
        if (!gameManager) {
          sendError(ws, 'Game not started');
          return;
        }

        const result = gameManager.buildCity(message.vertexId, playerId);

        if (!result.success) {
          sendMessage(ws, {
            type: 'build_failed',
            reason: result.error || 'Build failed',
          });
          return;
        }

        // Broadcast successful city build to all players
        roomManager.broadcastToRoom(currentRoomId, {
          type: 'city_built',
          vertexId: message.vertexId,
          playerId,
          resourcesSpent: result.resourcesSpent || {},
        });
        break;
      }

      // ============================================================================
      // TRADING PHASE HANDLERS
      // ============================================================================

      case 'propose_trade': {
        if (!currentRoomId || !playerId) {
          sendError(ws, 'Room not found');
          return;
        }
        const gameManager = roomManager.getGameManager(currentRoomId);
        if (!gameManager) {
          sendError(ws, 'Game not started');
          return;
        }

        const result = gameManager.proposeTrade(
          playerId,
          message.offering,
          message.requesting,
        );
        if (!result.success) {
          sendError(ws, result.error || 'Invalid trade proposal');
          return;
        }

        roomManager.broadcastToRoom(currentRoomId, {
          type: 'trade_proposed',
          proposerId: playerId,
          offering: message.offering,
          requesting: message.requesting,
        });
        break;
      }

      case 'respond_trade': {
        if (!currentRoomId || !playerId) {
          sendError(ws, 'Room not found');
          return;
        }
        const gameManager = roomManager.getGameManager(currentRoomId);
        if (!gameManager) {
          sendError(ws, 'Game not started');
          return;
        }

        const result = gameManager.respondToTrade(playerId, message.response);
        if (!result.success) {
          sendError(ws, result.error || 'Invalid trade response');
          return;
        }

        roomManager.broadcastToRoom(currentRoomId, {
          type: 'trade_response',
          playerId,
          response: message.response === 'accept' ? 'accepted' : 'declined',
        });
        break;
      }

      case 'select_trade_partner': {
        if (!currentRoomId || !playerId) {
          sendError(ws, 'Room not found');
          return;
        }
        const gameManager = roomManager.getGameManager(currentRoomId);
        if (!gameManager) {
          sendError(ws, 'Game not started');
          return;
        }

        const result = gameManager.selectTradePartner(message.partnerId);
        if (!result.success) {
          sendError(ws, result.error || 'Invalid trade partner');
          return;
        }

        roomManager.broadcastToRoom(currentRoomId, {
          type: 'trade_executed',
          proposerId: result.proposerId!,
          partnerId: message.partnerId,
          proposerGave: result.proposerGave!,
          partnerGave: result.partnerGave!,
        });
        break;
      }

      case 'cancel_trade': {
        if (!currentRoomId || !playerId) {
          sendError(ws, 'Room not found');
          return;
        }
        const gameManager = roomManager.getGameManager(currentRoomId);
        if (!gameManager) {
          sendError(ws, 'Game not started');
          return;
        }

        const result = gameManager.cancelTrade();
        if (!result.success) {
          sendError(ws, result.error || 'Cannot cancel trade');
          return;
        }

        roomManager.broadcastToRoom(currentRoomId, {
          type: 'trade_cancelled',
        });
        break;
      }

      case 'execute_bank_trade': {
        if (!currentRoomId || !playerId) {
          sendError(ws, 'Room not found');
          return;
        }
        const gameManager = roomManager.getGameManager(currentRoomId);
        if (!gameManager) {
          sendError(ws, 'Game not started');
          return;
        }

        const result = gameManager.executeBankTrade(
          playerId,
          message.giving,
          message.receiving,
        );
        if (!result.success) {
          sendError(ws, result.error || 'Invalid bank trade');
          return;
        }

        roomManager.broadcastToRoom(currentRoomId, {
          type: 'bank_trade_executed',
          playerId,
          gave: result.gave!,
          received: result.received!,
        });
        break;
      }

      // ============================================================================
      // ROBBER PHASE HANDLERS
      // ============================================================================

      case 'discard_submitted': {
        if (!currentRoomId || !playerId) {
          sendError(ws, 'Not in a room');
          return;
        }

        const gameManager = roomManager.getGameManager(currentRoomId);
        if (!gameManager) {
          sendError(ws, 'Game not started');
          return;
        }

        const result = gameManager.submitDiscard(playerId, message.resources);

        if (!result.success) {
          sendError(ws, result.error || 'Invalid discard');
          return;
        }

        // Broadcast discard completion to all players
        roomManager.broadcastToRoom(currentRoomId, {
          type: 'discard_completed',
          playerId,
          discarded: result.discarded,
        });

        // If all discards done, notify and trigger robber move
        if (result.allDiscardsDone) {
          roomManager.broadcastToRoom(currentRoomId, {
            type: 'all_discards_complete',
          });

          // Send robber_move_required to the player who rolled 7
          const robberMover = gameManager.getRobberMover();
          if (robberMover) {
            const moverWs = roomManager.getPlayerWebSocket(
              currentRoomId,
              robberMover,
            );
            if (moverWs && moverWs.readyState === WebSocket.OPEN) {
              moverWs.send(
                JSON.stringify({
                  type: 'robber_move_required',
                  currentHexId: gameManager.getGameState().robberHexId,
                }),
              );
            }
          }
        }
        break;
      }

      case 'move_robber': {
        if (!currentRoomId || !playerId) {
          sendError(ws, 'Not in a room');
          return;
        }

        const gameManager = roomManager.getGameManager(currentRoomId);
        if (!gameManager) {
          sendError(ws, 'Game not started');
          return;
        }

        const result = gameManager.moveRobber(playerId, message.hexId);

        if (!result.success) {
          sendError(ws, result.error || 'Invalid robber placement');
          return;
        }

        // Broadcast robber moved to all
        roomManager.broadcastToRoom(currentRoomId, {
          type: 'robber_moved',
          hexId: message.hexId,
          playerId,
        });

        // Handle steal phase
        if (result.noStealPossible) {
          // Broadcast no steal possible
          roomManager.broadcastToRoom(currentRoomId, {
            type: 'no_steal_possible',
          });
        } else if (result.autoStolen) {
          // Single victim - auto-steal already executed
          roomManager.broadcastToRoom(currentRoomId, {
            type: 'stolen',
            thiefId: playerId,
            victimId: result.autoStolen.victimId,
            resourceType: result.autoStolen.resourceType,
          });
        } else if (
          result.stealCandidates &&
          result.stealCandidates.length > 1
        ) {
          // Multiple candidates - send steal_required to thief
          // Get nicknames for candidates
          const room = roomManager.getRoom(currentRoomId);
          const candidatesWithNicknames = result.stealCandidates.map((c) => ({
            playerId: c.playerId,
            nickname: room?.players.get(c.playerId)?.nickname || 'Unknown',
            cardCount: c.cardCount,
          }));

          ws.send(
            JSON.stringify({
              type: 'steal_required',
              candidates: candidatesWithNicknames,
            }),
          );
        }
        break;
      }

      case 'steal_target': {
        if (!currentRoomId || !playerId) {
          sendError(ws, 'Not in a room');
          return;
        }

        const gameManager = roomManager.getGameManager(currentRoomId);
        if (!gameManager) {
          sendError(ws, 'Game not started');
          return;
        }

        const result = gameManager.stealFrom(playerId, message.victimId);

        if (!result.success) {
          sendError(ws, result.error || 'Invalid steal target');
          return;
        }

        // Broadcast theft result
        roomManager.broadcastToRoom(currentRoomId, {
          type: 'stolen',
          thiefId: playerId,
          victimId: message.victimId,
          resourceType: result.resourceType,
        });
        break;
      }

      // ============================================================================
      // DEVELOPMENT CARD HANDLERS
      // ============================================================================

      case 'buy_dev_card': {
        if (!currentRoomId || !playerId) {
          sendError(ws, 'Not in a room');
          return;
        }

        const gameManager = roomManager.getGameManager(currentRoomId);
        if (!gameManager) {
          sendError(ws, 'Game not started');
          return;
        }

        const result = gameManager.buyDevCard(playerId);

        if (!result.success) {
          // Send error only to buyer
          sendMessage(ws, {
            type: 'dev_card_play_failed',
            reason: result.error || 'Purchase failed',
          });
          return;
        }

        // Send full card info to buyer only
        sendMessage(ws, {
          type: 'dev_card_purchased',
          playerId,
          card: result.card,
          deckRemaining: result.deckRemaining,
        });

        // Send hidden info to all other players in room
        const room = roomManager.getRoom(currentRoomId);
        if (room) {
          room.players.forEach((player) => {
            if (
              player.id !== playerId &&
              player.ws &&
              player.ws.readyState === WebSocket.OPEN
            ) {
              player.ws.send(
                JSON.stringify({
                  type: 'dev_card_purchased_public',
                  playerId,
                  deckRemaining: result.deckRemaining,
                }),
              );
            }
          });
        }
        break;
      }

      default: {
        sendError(ws, 'Invalid room ID');
      }
    }
  });

  ws.on('close', () => {
    if (!currentRoomId || !playerId) return;

    roomManager.removePlayer(currentRoomId, playerId);
    roomManager.broadcastToRoom(currentRoomId, {
      type: 'player_left',
      playerId,
    });

    const room = roomManager.getRoom(currentRoomId);
    if (room) {
      roomManager.broadcastToRoom(currentRoomId, {
        type: 'room_state',
        room: serializeRoom(room),
      });
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error', error);
  });
}
