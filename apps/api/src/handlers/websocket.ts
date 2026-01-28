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
          roomManager.broadcastToRoom(currentRoomId, {
            type: 'setup_complete',
            // In a real game, this would be the first player of the main phase
            nextPlayerId: gameManager.getCurrentPlayerId() || playerId,
          });
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
