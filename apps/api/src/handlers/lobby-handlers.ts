import { randomUUID } from 'node:crypto';
import { WebSocket } from 'ws';

import {
  ChangeColorMessage,
  ChangeNicknameMessage,
  CreateRoomMessage,
  JoinRoomMessage,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PLAYER_COLORS,
  RequestRematchMessage,
  ToggleReadyMessage,
} from '@catan/shared';

import { generateBoard } from '../game/board-generator';
import { GameManager } from '../game/GameManager';
import { ManagedPlayer, RoomManager } from '../managers/RoomManager';
import { generateRoomId } from '../utils/room-id';
import {
  getAvailableColor,
  sendError,
  sendMessage,
  serializePlayer,
  serializeRoom,
} from './handler-utils';

const GAME_START_COUNTDOWN = 5;

export function handleCreateRoom(
  ws: WebSocket,
  message: CreateRoomMessage,
  roomManager: RoomManager,
  context: { currentRoomId: string | null; playerId: string | null },
): void {
  let roomId = generateRoomId();
  while (roomManager.getRoom(roomId)) {
    roomId = generateRoomId();
  }

  const room = roomManager.createRoom(roomId);

  // Check if preferred color is available
  let color = message.preferredColor;
  if (color) {
    const colorTaken = Array.from(room.players.values()).some(
      (p) => p.color === color,
    );
    if (colorTaken) {
      color = getAvailableColor(room) ?? PLAYER_COLORS[0];
    }
  } else {
    color = getAvailableColor(room) ?? PLAYER_COLORS[0];
  }

  const player: ManagedPlayer = {
    id: randomUUID(),
    nickname: message.nickname,
    color,
    ready: false,
    ws,
  };

  roomManager.addPlayer(roomId, player);
  context.currentRoomId = roomId;
  context.playerId = player.id;

  sendMessage(
    ws,
    {
      type: 'room_created',
      roomId,
      player: serializePlayer(player),
    },
    roomId,
  );

  roomManager.broadcastToRoom(roomId, {
    type: 'room_state',
    room: serializeRoom(room),
  });
}

export function handleJoinRoom(
  ws: WebSocket,
  message: JoinRoomMessage,
  roomManager: RoomManager,
  context: { currentRoomId: string | null; playerId: string | null },
): void {
  const room = roomManager.getRoom(message.roomId);
  if (!room) {
    sendError(ws, 'Room not found');
    return;
  }

  // Check if this is a reconnection attempt
  const isReconnection = room.disconnectedPlayers.has(message.nickname);

  if (!isReconnection) {
    // New player validation
    if (room.players.size >= MAX_PLAYERS) {
      sendError(ws, 'Room is full');
      return;
    }

    // Auto-generate unique nickname if duplicate detected
    let uniqueNickname = message.nickname;
    if (roomManager.isNicknameTaken(message.roomId, uniqueNickname)) {
      let counter = 2;
      let attempt = `${uniqueNickname} ${counter}`;
      while (roomManager.isNicknameTaken(message.roomId, attempt)) {
        counter++;
        attempt = `${uniqueNickname} ${counter}`;
      }
      uniqueNickname = attempt;
    }

    // Check if preferred color is available
    let color = message.preferredColor;
    if (color) {
      const colorTaken = Array.from(room.players.values()).some(
        (p) => p.color === color,
      );
      if (colorTaken) {
        color = getAvailableColor(room) ?? undefined;
      }
    } else {
      color = getAvailableColor(room) ?? undefined;
    }

    if (!color) {
      sendError(ws, 'Room is full');
      return;
    }

    const player: ManagedPlayer = {
      id: randomUUID(),
      nickname: uniqueNickname,
      color,
      ready: false,
      ws,
    };

    roomManager.addPlayer(message.roomId, player);
    context.currentRoomId = message.roomId;
    context.playerId = player.id;

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
  } else {
    // Reconnection flow - get the disconnected player info
    const disconnectedPlayer = room.disconnectedPlayers.get(message.nickname);
    if (!disconnectedPlayer) {
      sendError(ws, 'Reconnection failed');
      return;
    }

    const player: ManagedPlayer = {
      id: disconnectedPlayer.id,
      nickname: disconnectedPlayer.nickname,
      color: disconnectedPlayer.color,
      ready: disconnectedPlayer.ready,
      ws,
    };

    const wasReconnection = roomManager.addPlayer(message.roomId, player);
    if (!wasReconnection) {
      sendError(ws, 'Reconnection failed');
      return;
    }

    context.currentRoomId = message.roomId;
    context.playerId = player.id;

    // Send full game state to reconnecting player
    sendMessage(
      ws,
      {
        type: 'room_state',
        room: serializeRoom(room),
      },
      message.roomId,
    );

    // If game has started, send board state and full game state
    if (room.board) {
      sendMessage(
        ws,
        {
          type: 'game_started',
          board: room.board,
        },
        message.roomId,
      );

      // Send full game state for reconnection
      if (room.gameManager) {
        const gameState = room.gameManager.getGameState();
        const myDevCards = room.gameManager.getPlayerDevCards(player.id);

        // Calculate opponent dev card counts
        const opponentDevCardCounts: Record<string, number> = {};
        for (const p of room.players.values()) {
          if (p.id !== player.id) {
            opponentDevCardCounts[p.id] = room.gameManager.getPlayerDevCards(
              p.id,
            ).length;
          }
        }

        sendMessage(
          ws,
          {
            type: 'game_state_sync',
            gameState: {
              playerResources: gameState.playerResources,
              settlements: gameState.settlements,
              roads: gameState.roads,
              placement: gameState.placement,
              turnState: gameState.turnState,
              robberHexId: gameState.robberHexId,
              longestRoadHolderId: gameState.longestRoadHolderId,
              longestRoadLength: gameState.longestRoadLength,
              playerRoadLengths: gameState.playerRoadLengths,
              largestArmyHolderId: gameState.largestArmyHolderId,
              largestArmyKnights: gameState.largestArmyKnights,
              playerKnightCounts: gameState.playerKnightCounts,
              gamePhase: gameState.gamePhase,
              winnerId: gameState.winnerId,
            },
            myDevCards,
            opponentDevCardCounts,
            deckRemaining: room.gameManager.getDeckRemaining(),
            lastPlacedSettlementId:
              room.gameManager.getLastPlacedSettlementId(),
          },
          message.roomId,
        );
      }
    }

    // resumeGame message already broadcast by RoomManager.addPlayer
  }
}

export function handleToggleReady(
  ws: WebSocket,
  message: ToggleReadyMessage,
  roomManager: RoomManager,
  context: { currentRoomId: string | null; playerId: string | null },
): void {
  if (
    !context.currentRoomId ||
    !context.playerId ||
    message.playerId !== context.playerId
  ) {
    sendError(ws, 'Room not found');
    return;
  }

  const room = roomManager.getRoom(context.currentRoomId);
  if (!room) {
    sendError(ws, 'Room not found');
    return;
  }

  const player = room.players.get(context.playerId);
  if (!player) {
    sendError(ws, 'Room not found');
    return;
  }

  player.ready = !player.ready;

  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'player_ready',
    playerId: player.id,
    ready: player.ready,
  });

  // Check if all players are ready
  const playersArray = Array.from(room.players.values());
  const allReady =
    room.players.size >= MIN_PLAYERS &&
    room.players.size <= MAX_PLAYERS &&
    playersArray.every((p) => p.ready);

  if (!player.ready) {
    // Someone unreadied - cancel countdown
    roomManager.cancelCountdown(context.currentRoomId);
    roomManager.broadcastToRoom(context.currentRoomId, {
      type: 'countdown_tick',
      secondsRemaining: -1,
    });
  } else if (allReady && !room.board) {
    // All players ready and game not started - start countdown
    roomManager.startCountdown(
      context.currentRoomId,
      (secondsRemaining) => {
        roomManager.broadcastToRoom(context.currentRoomId!, {
          type: 'countdown_tick',
          secondsRemaining,
        });
      },
      () => {
        // Countdown complete - start game
        roomManager.shufflePlayerOrder(context.currentRoomId!);
        const roomChecking = roomManager.getRoom(context.currentRoomId!);
        if (!roomChecking || roomChecking.board) return;

        const board = generateBoard();
        roomManager.setBoard(context.currentRoomId!, board);

        const playerIds = Array.from(roomChecking.playerOrder);
        const gameManager = new GameManager(board, playerIds);
        roomManager.setGameManager(context.currentRoomId!, gameManager);

        roomManager.broadcastToRoom(context.currentRoomId!, {
          type: 'room_state',
          room: serializeRoom(roomChecking),
        });

        roomManager.broadcastToRoom(context.currentRoomId!, {
          type: 'game_started',
          board,
        });

        // Broadcast first turn info
        const playerId = gameManager.getCurrentPlayerId();
        const phase = gameManager.getPlacementPhase();
        const placement = gameManager.getState().placement;

        if (playerId && phase && placement) {
          roomManager.broadcastToRoom(context.currentRoomId!, {
            type: 'placement_turn',
            currentPlayerIndex: placement.currentPlayerIndex,
            currentPlayerId: playerId,
            phase,
            round: placement.draftRound,
            turnNumber: placement.turnNumber,
          });
        }
      },
    );
  }

  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'room_state',
    room: serializeRoom(room),
  });
}

export function handleChangeColor(
  ws: WebSocket,
  message: ChangeColorMessage,
  roomManager: RoomManager,
  context: { currentRoomId: string | null; playerId: string | null },
): void {
  if (
    !context.currentRoomId ||
    !context.playerId ||
    message.playerId !== context.playerId
  ) {
    sendError(ws, 'Room not found');
    return;
  }

  const room = roomManager.getRoom(context.currentRoomId);
  if (!room) {
    sendError(ws, 'Room not found');
    return;
  }

  const colorTaken = Array.from(room.players.values()).some(
    (p) => p.color === message.color && p.id !== context.playerId,
  );

  if (colorTaken) {
    sendError(ws, 'Color already taken');
    return;
  }

  const player = room.players.get(context.playerId);
  if (!player) {
    sendError(ws, 'Room not found');
    return;
  }

  player.color = message.color;

  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'color_changed',
    playerId: player.id,
    color: player.color,
  });

  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'room_state',
    room: serializeRoom(room),
  });
}

export function handleChangeNickname(
  ws: WebSocket,
  message: ChangeNicknameMessage,
  roomManager: RoomManager,
  context: { currentRoomId: string | null; playerId: string | null },
): void {
  if (
    !context.currentRoomId ||
    !context.playerId ||
    message.playerId !== context.playerId
  ) {
    sendError(ws, 'Room not found');
    return;
  }

  const room = roomManager.getRoom(context.currentRoomId);
  if (!room) {
    sendError(ws, 'Room not found');
    return;
  }

  // Check if nickname is already taken by another player
  const nicknameTaken = Array.from(room.players.values()).some(
    (p) => p.nickname === message.nickname && p.id !== context.playerId,
  );

  if (nicknameTaken) {
    sendError(ws, 'Nickname already taken');
    return;
  }

  const player = room.players.get(context.playerId);
  if (!player) {
    sendError(ws, 'Room not found');
    return;
  }

  player.nickname = message.nickname;

  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'nickname_changed',
    playerId: player.id,
    nickname: player.nickname,
  });

  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'room_state',
    room: serializeRoom(room),
  });
}

export function handleRequestRematch(
  ws: WebSocket,
  message: RequestRematchMessage,
  roomManager: RoomManager,
  context: { currentRoomId: string | null; playerId: string | null },
): void {
  if (
    !context.currentRoomId ||
    !context.playerId ||
    message.playerId !== context.playerId
  ) {
    sendError(ws, 'Invalid request');
    return;
  }

  const room = roomManager.getRoom(context.currentRoomId);
  if (!room || !room.players.has(context.playerId)) {
    sendError(ws, 'Room not found');
    return;
  }

  // Handle rematch vote
  roomManager.handleRematchVote(context.currentRoomId, message.playerId);
}
