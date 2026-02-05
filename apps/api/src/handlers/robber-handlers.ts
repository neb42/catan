import { WebSocket } from 'ws';

import {
  DiscardSubmittedMessage,
  MoveRobberMessage,
  StealTargetMessage,
} from '@catan/shared';

import { RoomManager } from '../managers/RoomManager';
import { logMessage } from '../utils/message-logger';
import { sendError } from './handler-utils';

/**
 * Handle discard_submitted message.
 * Player submits resources to discard after rolling 7.
 */
export function handleDiscardSubmitted(
  ws: WebSocket,
  message: DiscardSubmittedMessage,
  roomManager: RoomManager,
  context: { currentRoomId: string | null; playerId: string | null },
): void {
  if (!context.currentRoomId || !context.playerId) {
    sendError(ws, 'Not in a room');
    return;
  }

  const gameManager = roomManager.getGameManager(context.currentRoomId);
  if (!gameManager) {
    sendError(ws, 'Game not started');
    return;
  }

  const result = gameManager.submitDiscard(context.playerId, message.resources);

  if (!result.success) {
    sendError(ws, result.error || 'Invalid discard');
    return;
  }

  // Broadcast discard completion to all players
  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'discard_completed',
    playerId: context.playerId,
    discarded: result.discarded,
  });

  // If all discards done, notify and trigger robber move
  if (result.allDiscardsDone) {
    roomManager.broadcastToRoom(context.currentRoomId, {
      type: 'all_discards_complete',
    });

    // Send robber_move_required to the player who rolled 7
    const robberMover = gameManager.getRobberMover();
    if (robberMover) {
      const moverWs = roomManager.getPlayerWebSocket(
        context.currentRoomId,
        robberMover,
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

/**
 * Handle move_robber message.
 * Player moves the robber to a new hex and potentially steals from adjacent players.
 */
export function handleMoveRobber(
  ws: WebSocket,
  message: MoveRobberMessage,
  roomManager: RoomManager,
  context: { currentRoomId: string | null; playerId: string | null },
): void {
  if (!context.currentRoomId || !context.playerId) {
    sendError(ws, 'Not in a room');
    return;
  }

  const gameManager = roomManager.getGameManager(context.currentRoomId);
  if (!gameManager) {
    sendError(ws, 'Game not started');
    return;
  }

  const result = gameManager.moveRobber(context.playerId, message.hexId);

  if (!result.success) {
    sendError(ws, result.error || 'Invalid robber placement');
    return;
  }

  // Broadcast robber moved to all
  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'robber_moved',
    hexId: message.hexId,
    playerId: context.playerId,
  });

  // Handle steal phase
  if (result.noStealPossible) {
    // Broadcast no steal possible
    roomManager.broadcastToRoom(context.currentRoomId, {
      type: 'no_steal_possible',
    });
  } else if (result.autoStolen) {
    // Single victim - auto-steal already executed
    roomManager.broadcastToRoom(context.currentRoomId, {
      type: 'stolen',
      thiefId: context.playerId,
      victimId: result.autoStolen.victimId,
      resourceType: result.autoStolen.resourceType,
    });
  } else if (result.stealCandidates && result.stealCandidates.length > 1) {
    // Multiple candidates - send steal_required to thief
    // Get nicknames for candidates
    const room = roomManager.getRoom(context.currentRoomId);
    const candidatesWithNicknames = result.stealCandidates.map((c) => ({
      playerId: c.playerId,
      nickname: room?.players.get(c.playerId)?.nickname || 'Unknown',
      cardCount: c.cardCount,
    }));

    const stealMessage = {
      type: 'steal_required',
      candidates: candidatesWithNicknames,
    };
    ws.send(JSON.stringify(stealMessage));
    logMessage(context.currentRoomId, 'send', stealMessage);
  }
}

/**
 * Handle steal_target message.
 * Player selects which player to steal from after moving the robber.
 */
export function handleStealTarget(
  ws: WebSocket,
  message: StealTargetMessage,
  roomManager: RoomManager,
  context: { currentRoomId: string | null; playerId: string | null },
): void {
  if (!context.currentRoomId || !context.playerId) {
    sendError(ws, 'Not in a room');
    return;
  }

  const gameManager = roomManager.getGameManager(context.currentRoomId);
  if (!gameManager) {
    sendError(ws, 'Game not started');
    return;
  }

  const result = gameManager.stealFrom(context.playerId, message.victimId);

  if (!result.success) {
    sendError(ws, result.error || 'Invalid steal target');
    return;
  }

  // Broadcast theft result
  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'stolen',
    thiefId: context.playerId,
    victimId: message.victimId,
    resourceType: result.resourceType,
  });
}
