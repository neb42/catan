import { WebSocket } from 'ws';

import { PlaceRoadMessage, PlaceSettlementMessage } from '@catan/shared';

import { RoomManager } from '../managers/RoomManager';
import {
  broadcastLongestRoadIfTransferred,
  broadcastVictory,
  sendError,
} from './handler-utils';

export function handlePlaceSettlement(
  ws: WebSocket,
  message: PlaceSettlementMessage,
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

  const result = gameManager.placeSettlement(
    message.vertexId,
    context.playerId,
  );

  if (!result.success) {
    sendError(ws, result.error || 'Invalid placement');
    return;
  }

  // Broadcast successful placement
  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'settlement_placed',
    vertexId: message.vertexId,
    playerId: context.playerId,
    isSecondSettlement: result.isSecondSettlement,
    resourcesGranted: result.resourcesGranted,
  });

  // Check for victory (setup phase settlements give VP)
  if (result.victoryResult) {
    broadcastVictory(roomManager, context.currentRoomId, result.victoryResult);
    return; // Game is over
  }

  // Broadcast next turn info
  const nextPlayerId = gameManager.getCurrentPlayerId();
  const nextPhase = gameManager.getPlacementPhase();
  const placement = gameManager.getState().placement;

  if (nextPlayerId && nextPhase && placement) {
    roomManager.broadcastToRoom(context.currentRoomId, {
      type: 'placement_turn',
      currentPlayerIndex: placement.currentPlayerIndex,
      currentPlayerId: nextPlayerId,
      phase: nextPhase,
      round: placement.draftRound,
      turnNumber: placement.turnNumber,
    });
  }
}

export function handlePlaceRoad(
  ws: WebSocket,
  message: PlaceRoadMessage,
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

  const result = gameManager.placeRoad(message.edgeId, context.playerId);

  if (!result.success) {
    sendError(ws, result.error || 'Invalid placement');
    return;
  }

  // Broadcast successful placement
  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'road_placed',
    edgeId: message.edgeId,
    playerId: context.playerId,
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
    return; // Game is over
  }

  if (result.setupComplete) {
    // Setup phase complete
    const turnState = gameManager.getState().turnState;
    roomManager.broadcastToRoom(context.currentRoomId, {
      type: 'setup_complete',
      nextPlayerId: turnState?.currentPlayerId || context.playerId,
    });

    // Also broadcast initial turn state for main game
    if (turnState) {
      const gameState = gameManager.getState();
      roomManager.broadcastToRoom(context.currentRoomId, {
        type: 'turn_changed',
        currentPlayerId: turnState.currentPlayerId,
        turnNumber: turnState.turnNumber,
        phase: turnState.phase,
        robberHexId: gameState.robberHexId, // Include initial robber position
      });
    }
  } else {
    // Broadcast next turn info
    const nextPlayerId = gameManager.getCurrentPlayerId();
    const nextPhase = gameManager.getPlacementPhase();
    const placement = gameManager.getState().placement;

    if (nextPlayerId && nextPhase && placement) {
      roomManager.broadcastToRoom(context.currentRoomId, {
        type: 'placement_turn',
        currentPlayerIndex: placement.currentPlayerIndex,
        currentPlayerId: nextPlayerId,
        phase: nextPhase,
        round: placement.draftRound,
        turnNumber: placement.turnNumber,
      });
    }
  }
}
