import { randomUUID } from 'node:crypto';
import { WebSocket } from 'ws';

import {
  ChangeColorMessage,
  CreateRoomMessage,
  JoinRoomMessage,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PLAYER_COLORS,
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
  const color = getAvailableColor(room) ?? PLAYER_COLORS[0];
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
        const roomChecking = roomManager.getRoom(context.currentRoomId!);
        if (!roomChecking || roomChecking.board) return;

        const board = generateBoard();
        roomManager.setBoard(context.currentRoomId!, board);

        const playerIds = Array.from(roomChecking.players.keys());
        const gameManager = new GameManager(board, playerIds);
        roomManager.setGameManager(context.currentRoomId!, gameManager);

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
