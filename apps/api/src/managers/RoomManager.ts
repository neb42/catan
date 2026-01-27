import { WebSocket } from 'ws';

import {
  BoardState,
  GRACE_PERIOD_MS,
  MAX_PLAYERS,
  Player,
  Room,
} from '@catan/shared';

import { GameManager } from '../game/GameManager';

export type ManagedPlayer = Player & { ws: WebSocket };

export type ManagedRoom = {
  id: Room['id'];
  createdAt: Room['createdAt'];
  players: Map<string, ManagedPlayer>;
  disconnectTimer: NodeJS.Timeout | null;
  board: BoardState | null;
  gameManager: GameManager | null;
};

export class RoomManager {
  private rooms = new Map<string, ManagedRoom>();

  createRoom(roomId: string): ManagedRoom {
    const room: ManagedRoom = {
      id: roomId,
      players: new Map(),
      disconnectTimer: null,
      createdAt: new Date(),
      board: null,
      gameManager: null,
    };

    this.rooms.set(roomId, room);
    return room;
  }

  addPlayer(roomId: string, player: ManagedPlayer): void {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.players.size >= MAX_PLAYERS) {
      throw new Error('Room is full');
    }

    if (this.isNicknameTaken(roomId, player.nickname)) {
      throw new Error('Nickname taken');
    }

    if (room.disconnectTimer) {
      clearTimeout(room.disconnectTimer);
      room.disconnectTimer = null;
    }

    room.players.set(player.id, player);
  }

  removePlayer(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.players.delete(playerId);

    if (room.players.size === 0 && !room.disconnectTimer) {
      room.disconnectTimer = setTimeout(() => {
        this.rooms.delete(roomId);
      }, GRACE_PERIOD_MS);
    }
  }

  getRoom(roomId: string): ManagedRoom | undefined {
    return this.rooms.get(roomId);
  }

  broadcastToRoom(roomId: string, message: unknown, excludeId?: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const payload = JSON.stringify(message);

    room.players.forEach((player) => {
      if (excludeId && player.id === excludeId) return;
      if (player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(payload);
      }
    });
  }

  isNicknameTaken(roomId: string, nickname: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    for (const player of room.players.values()) {
      if (player.nickname === nickname) {
        return true;
      }
    }

    return false;
  }

  setBoard(roomId: string, board: BoardState): void {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    room.board = board;
  }

  setGameManager(roomId: string, gameManager: GameManager): void {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    room.gameManager = gameManager;
  }

  getGameManager(roomId: string): GameManager | null {
    const room = this.rooms.get(roomId);
    return room?.gameManager ?? null;
  }

  getBoard(roomId: string): BoardState | null {
    const room = this.rooms.get(roomId);
    return room?.board ?? null;
  }
}
