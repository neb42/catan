import { WebSocket } from 'ws';

import { Player } from '@catan/shared';

import { LargestArmyResult } from '../game/largest-army-logic';
import { LongestRoadResult } from '../game/longest-road-logic';
import { VictoryResult } from '../game/victory-logic';
import {
  ManagedPlayer,
  ManagedRoom,
  RoomManager,
} from '../managers/RoomManager';
import { logMessage } from '../utils/message-logger';

/**
 * Error message types for WebSocket communication.
 */
export type ErrorMessage =
  | 'Room not found'
  | 'Room is full'
  | 'Nickname taken'
  | 'Invalid room ID'
  | 'Color already taken';

/**
 * Send a JSON message to a WebSocket client.
 * @param socket - The WebSocket client to send to
 * @param message - The message payload (will be JSON stringified)
 * @param roomId - Optional room ID for logging
 */
export function sendMessage(
  socket: WebSocket,
  message: unknown,
  roomId?: string,
): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
    if (roomId) {
      logMessage(roomId, 'send', message);
    }
  }
}

/**
 * Send an error message to a WebSocket client.
 * @param socket - The WebSocket client to send to
 * @param message - The error message
 * @param roomId - Optional room ID for logging
 */
export function sendError(
  socket: WebSocket,
  message: ErrorMessage | string,
  roomId?: string,
): void {
  sendMessage(socket, { type: 'error', message }, roomId);
}

/**
 * Convert a ManagedPlayer to a Player for client serialization.
 * @param player - The internal player object with WebSocket
 * @returns The serialized player object without WebSocket
 */
export function serializePlayer(player: ManagedPlayer): Player {
  return {
    id: player.id,
    nickname: player.nickname,
    color: player.color,
    ready: player.ready,
  };
}

/**
 * Convert a ManagedRoom to a Room for client serialization.
 * @param room - The internal room object
 * @returns The serialized room object
 */
export function serializeRoom(room: ManagedRoom) {
  return {
    id: room.id,
    createdAt: room.createdAt,
    players: Array.from(room.players.values()).map(serializePlayer),
  };
}

/**
 * Find an available player color in the room.
 * @param room - The room to check
 * @returns An available color or null if all are taken
 */
export function getAvailableColor(room: ManagedRoom): Player['color'] | null {
  const used = new Set(Array.from(room.players.values()).map((p) => p.color));
  const colors: Player['color'][] = ['red', 'blue', 'green', 'yellow'];
  const color = colors.find((candidate) => !used.has(candidate));
  return color ?? null;
}

/**
 * Broadcast longest_road_updated message if a transfer occurred.
 * @param roomManager - The room manager instance
 * @param roomId - The room ID to broadcast to
 * @param result - The longest road result from game logic
 */
export function broadcastLongestRoadIfTransferred(
  roomManager: RoomManager,
  roomId: string,
  result: LongestRoadResult | undefined,
): void {
  if (!result?.transferred) return;

  roomManager.broadcastToRoom(roomId, {
    type: 'longest_road_updated',
    holderId: result.newState.holderId,
    holderLength: result.newState.length,
    playerLengths: result.playerLengths,
    transferredFrom: result.fromPlayerId ?? null,
  });
}

/**
 * Broadcast largest_army_updated message if a transfer occurred.
 * @param roomManager - The room manager instance
 * @param roomId - The room ID to broadcast to
 * @param result - The largest army result from game logic
 */
export function broadcastLargestArmyIfTransferred(
  roomManager: RoomManager,
  roomId: string,
  result: LargestArmyResult | undefined,
): void {
  if (!result?.transferred) return;

  roomManager.broadcastToRoom(roomId, {
    type: 'largest_army_updated',
    holderId: result.newState.holderId,
    holderKnights: result.newState.knights,
    playerKnightCounts: result.knightCounts,
    transferredFrom: result.fromPlayerId ?? null,
  });
}

/**
 * Broadcast victory message when game ends.
 * All players receive complete VP breakdowns and revealed VP cards.
 * @param roomManager - The room manager instance
 * @param roomId - The room ID to broadcast to
 * @param result - The victory result from game logic
 */
export function broadcastVictory(
  roomManager: RoomManager,
  roomId: string,
  result: VictoryResult,
): void {
  const room = roomManager.getRoom(roomId);
  const winner = room
    ? Array.from(room.players.values()).find((p) => p.id === result.winnerId)
    : null;

  // Stats should always be present when game ends (from GameManager.checkVictory)
  // If not present (shouldn't happen), use empty stats as fallback
  const stats = result.stats || {
    diceRolls: {},
    resourceStats: {},
    devCardStats: {},
  };

  roomManager.broadcastToRoom(roomId, {
    type: 'victory',
    winnerId: result.winnerId!,
    winnerNickname: winner?.nickname || 'Unknown',
    winnerVP: result.winnerVP!,
    allPlayerVP: result.allPlayerVP,
    revealedVPCards: result.revealedVPCards,
    stats,
  });
}
