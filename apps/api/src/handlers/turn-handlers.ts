import { WebSocket } from 'ws';

import { EndTurnMessage, RollDiceMessage } from '@catan/shared';

import { RoomManager } from '../managers/RoomManager';
import { logMessage } from '../utils/message-logger';
import { sendError } from './handler-utils';

export function handleRollDice(
  ws: WebSocket,
  message: RollDiceMessage,
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

  const result = gameManager.rollDice(context.playerId);

  if (!result.success) {
    sendError(ws, result.error || 'Cannot roll dice');
    return;
  }

  // Broadcast dice roll result to all players
  roomManager.broadcastToRoom(context.currentRoomId, {
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
        context.currentRoomId,
        discardPlayerId,
      );
      if (playerWs && playerWs.readyState === WebSocket.OPEN) {
        const playerResources = gameManager.getPlayerResources(discardPlayerId);
        const discardMessage = {
          type: 'discard_required',
          playerId: discardPlayerId,
          targetCount,
          currentResources: playerResources,
        };
        playerWs.send(JSON.stringify(discardMessage));
        logMessage(context.currentRoomId, 'send', discardMessage);
      }
    }

    // Also broadcast robber_triggered so all clients know robber flow is active
    roomManager.broadcastToRoom(context.currentRoomId, {
      type: 'robber_triggered',
      mustDiscardPlayers: result.mustDiscardPlayers || [],
    });

    // If no discards needed, immediately send robber_move_required
    if (result.proceedToRobberMove) {
      const moverWs = roomManager.getPlayerWebSocket(
        context.currentRoomId,
        context.playerId,
      );
      if (moverWs && moverWs.readyState === WebSocket.OPEN) {
        const robberMoveMessage = {
          type: 'robber_move_required',
          currentHexId: gameManager.getGameState().robberHexId,
        };
        moverWs.send(JSON.stringify(robberMoveMessage));
        logMessage(context.currentRoomId, 'send', robberMoveMessage);
      }
    }
  }
}

export function handleEndTurn(
  ws: WebSocket,
  message: EndTurnMessage,
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

  const result = gameManager.endTurn(context.playerId);

  if (!result.success) {
    sendError(ws, result.error || 'Cannot end turn');
    return;
  }

  // Broadcast turn change to all players
  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'turn_changed',
    currentPlayerId: result.nextPlayerId!,
    turnNumber: result.turnNumber!,
    phase: 'roll',
  });
}
