import { WebSocket } from 'ws';

import {
  BoardState,
  GRACE_PERIOD_MS,
  MAX_PLAYERS,
  Player,
  Room,
} from '@catan/shared';

import { GameManager } from '../game/GameManager';
import { logMessage } from '../utils/message-logger';

export type ManagedPlayer = Player & { ws: WebSocket };

export type ManagedRoom = {
  id: Room['id'];
  createdAt: Room['createdAt'];
  players: Map<string, ManagedPlayer>;
  disconnectTimer: NodeJS.Timeout | null;
  board: BoardState | null;
  gameManager: GameManager | null;
  countdownTimer: NodeJS.Timeout | null;
  isPaused: boolean;
  disconnectedPlayers: Map<string, ManagedPlayer>; // Keyed by nickname
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
      countdownTimer: null,
      isPaused: false,
      disconnectedPlayers: new Map(),
    };

    this.rooms.set(roomId, room);
    return room;
  }

  addPlayer(roomId: string, player: ManagedPlayer): boolean {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    // Check if this is a reconnection (nickname exists in disconnectedPlayers)
    const disconnectedPlayer = room.disconnectedPlayers.get(player.nickname);
    if (disconnectedPlayer) {
      // Reconnection - restore player with same ID, new WebSocket
      disconnectedPlayer.ws = player.ws;
      room.players.set(disconnectedPlayer.id, disconnectedPlayer);
      room.disconnectedPlayers.delete(player.nickname);

      // Resume game if this was the only disconnected player
      if (room.disconnectedPlayers.size === 0) {
        this.resumeGame(roomId, disconnectedPlayer.id);
      }

      // Update context with restored player ID
      Object.assign(player, disconnectedPlayer);
      return true; // Indicates reconnection
    }

    // New player (not reconnection)
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
    return false; // Indicates new player
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

    // Log the broadcast message once (all players receive the same message)
    logMessage(roomId, 'send', message);

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

    // Check active players
    for (const player of room.players.values()) {
      if (player.nickname === nickname) {
        return true;
      }
    }

    // Don't check disconnectedPlayers - allow reconnection with same nickname

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

  /**
   * Get the WebSocket connection for a specific player in a room.
   * Used for sending targeted messages (e.g., robber discard_required).
   */
  getPlayerWebSocket(roomId: string, playerId: string): WebSocket | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    const player = room.players.get(playerId);
    return player?.ws;
  }

  startCountdown(
    roomId: string,
    callback: (secondsRemaining: number) => void,
    onComplete: () => void,
  ): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Cancel existing countdown if any
    this.cancelCountdown(roomId);

    let secondsRemaining = 5;

    // Broadcast initial countdown
    callback(secondsRemaining);

    room.countdownTimer = setInterval(() => {
      secondsRemaining--;

      if (secondsRemaining <= 0) {
        this.cancelCountdown(roomId);
        onComplete();
      } else {
        callback(secondsRemaining);
      }
    }, 1000);
  }

  cancelCountdown(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    if (room.countdownTimer) {
      clearInterval(room.countdownTimer);
      room.countdownTimer = null;
    }
  }

  /**
   * Pause the game when a player disconnects.
   * Moves the player from active players to disconnectedPlayers.
   */
  pauseGame(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    // Move player to disconnectedPlayers (keyed by nickname)
    room.disconnectedPlayers.set(player.nickname, player);
    room.players.delete(playerId);
    room.isPaused = true;

    console.log(
      `[RoomManager] Game paused in room ${roomId} - player ${player.nickname} disconnected`,
    );

    // Broadcast pause message
    this.broadcastToRoom(roomId, {
      type: 'game_paused',
      disconnectedPlayerId: playerId,
      disconnectedPlayerNickname: player.nickname,
    });
  }

  /**
   * Resume the game when a player reconnects.
   * Called after player is moved from disconnectedPlayers back to players.
   */
  resumeGame(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    room.isPaused = false;

    console.log(
      `[RoomManager] Game resumed in room ${roomId} - player ${player.nickname} reconnected`,
    );

    // Broadcast resume message
    this.broadcastToRoom(roomId, {
      type: 'game_resumed',
      reconnectedPlayerId: playerId,
      reconnectedPlayerNickname: player.nickname,
    });
  }
}
