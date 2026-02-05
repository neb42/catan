import { WebSocket } from 'ws';

import {
  BuildCityMessage,
  BuildRoadMessage,
  BuildSettlementMessage,
} from '@catan/shared';

import { RoomManager } from '../managers/RoomManager';
import {
  broadcastLongestRoadIfTransferred,
  broadcastVictory,
  sendError,
  sendMessage,
} from './handler-utils';

export function handleBuildRoad(
  ws: WebSocket,
  message: BuildRoadMessage,
  roomManager: RoomManager,
  context: { currentRoomId: string | null; playerId: string | null },
): void {
  if (!context.currentRoomId || !context.playerId) {
    sendError(ws, 'Room not found');
    return;
  }

  const gameManager = roomManager.getGameManager(context.currentRoomId);
  if (!gameManager) {
    sendError(ws, 'Game not started');
    return;
  }

  const result = gameManager.buildRoad(message.edgeId, context.playerId);

  if (!result.success) {
    sendMessage(
      ws,
      {
        type: 'build_failed',
        reason: result.error || 'Build failed',
      },
      context.currentRoomId,
    );
    return;
  }

  // Broadcast successful road build to all players
  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'road_built',
    edgeId: message.edgeId,
    playerId: context.playerId,
    resourcesSpent: result.resourcesSpent || {},
  });

  // Broadcast longest road if transferred
  broadcastLongestRoadIfTransferred(
    roomManager,
    context.currentRoomId,
    result.longestRoadResult,
  );

  // Check for victory (longest road may have transferred)
  if (result.victoryResult) {
    broadcastVictory(roomManager, context.currentRoomId, result.victoryResult);
  }
}

export function handleBuildSettlement(
  ws: WebSocket,
  message: BuildSettlementMessage,
  roomManager: RoomManager,
  context: { currentRoomId: string | null; playerId: string | null },
): void {
  if (!context.currentRoomId || !context.playerId) {
    sendError(ws, 'Room not found');
    return;
  }

  const gameManager = roomManager.getGameManager(context.currentRoomId);
  if (!gameManager) {
    sendError(ws, 'Game not started');
    return;
  }

  const result = gameManager.buildSettlement(
    message.vertexId,
    context.playerId,
  );

  if (!result.success) {
    sendMessage(
      ws,
      {
        type: 'build_failed',
        reason: result.error || 'Build failed',
      },
      context.currentRoomId,
    );
    return;
  }

  // Broadcast successful settlement build to all players
  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'settlement_built',
    vertexId: message.vertexId,
    playerId: context.playerId,
    resourcesSpent: result.resourcesSpent || {},
  });

  // Broadcast longest road if transferred (settlement can break opponent's road)
  broadcastLongestRoadIfTransferred(
    roomManager,
    context.currentRoomId,
    result.longestRoadResult,
  );

  // Check for victory (settlement gives 1 VP)
  if (result.victoryResult) {
    broadcastVictory(roomManager, context.currentRoomId, result.victoryResult);
  }
}

export function handleBuildCity(
  ws: WebSocket,
  message: BuildCityMessage,
  roomManager: RoomManager,
  context: { currentRoomId: string | null; playerId: string | null },
): void {
  if (!context.currentRoomId || !context.playerId) {
    sendError(ws, 'Room not found');
    return;
  }

  const gameManager = roomManager.getGameManager(context.currentRoomId);
  if (!gameManager) {
    sendError(ws, 'Game not started');
    return;
  }

  const result = gameManager.buildCity(message.vertexId, context.playerId);

  if (!result.success) {
    sendMessage(
      ws,
      {
        type: 'build_failed',
        reason: result.error || 'Build failed',
      },
      context.currentRoomId,
    );
    return;
  }

  // Broadcast successful city build to all players
  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'city_built',
    vertexId: message.vertexId,
    playerId: context.playerId,
    resourcesSpent: result.resourcesSpent || {},
  });

  // Check for victory (city gives +1 VP net)
  if (result.victoryResult) {
    broadcastVictory(roomManager, context.currentRoomId, result.victoryResult);
  }
}
