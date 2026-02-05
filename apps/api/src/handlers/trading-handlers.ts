import { WebSocket } from 'ws';

import {
  CancelTradeMessage,
  ExecuteBankTradeMessage,
  ProposeTradeMessage,
  RespondTradeMessage,
  SelectTradePartnerMessage,
} from '@catan/shared';

import { RoomManager } from '../managers/RoomManager';
import { sendError } from './handler-utils';

/**
 * Handle propose_trade message.
 * Player proposes a trade to all other players.
 */
export function handleProposeTrade(
  ws: WebSocket,
  message: ProposeTradeMessage,
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

  const result = gameManager.proposeTrade(
    context.playerId,
    message.offering,
    message.requesting,
  );
  if (!result.success) {
    sendError(ws, result.error || 'Invalid trade proposal');
    return;
  }

  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'trade_proposed',
    proposerId: context.playerId,
    offering: message.offering,
    requesting: message.requesting,
  });
}

/**
 * Handle respond_trade message.
 * Player responds to a trade proposal (accept or decline).
 */
export function handleRespondTrade(
  ws: WebSocket,
  message: RespondTradeMessage,
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

  const result = gameManager.respondToTrade(context.playerId, message.response);
  if (!result.success) {
    sendError(ws, result.error || 'Invalid trade response');
    return;
  }

  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'trade_response',
    playerId: context.playerId,
    response: message.response === 'accept' ? 'accepted' : 'declined',
  });
}

/**
 * Handle select_trade_partner message.
 * Proposer selects which accepting player to trade with.
 */
export function handleSelectTradePartner(
  ws: WebSocket,
  message: SelectTradePartnerMessage,
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

  const result = gameManager.selectTradePartner(message.partnerId);
  if (!result.success) {
    sendError(ws, result.error || 'Invalid trade partner');
    return;
  }

  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'trade_executed',
    proposerId: result.proposerId!,
    partnerId: message.partnerId,
    proposerGave: result.proposerGave!,
    partnerGave: result.partnerGave!,
  });
}

/**
 * Handle cancel_trade message.
 * Proposer cancels an active trade proposal.
 */
export function handleCancelTrade(
  ws: WebSocket,
  message: CancelTradeMessage,
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

  const result = gameManager.cancelTrade();
  if (!result.success) {
    sendError(ws, result.error || 'Cannot cancel trade');
    return;
  }

  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'trade_cancelled',
  });
}

/**
 * Handle execute_bank_trade message.
 * Player trades resources with the bank at a fixed ratio.
 */
export function handleExecuteBankTrade(
  ws: WebSocket,
  message: ExecuteBankTradeMessage,
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

  const result = gameManager.executeBankTrade(
    context.playerId,
    message.giving,
    message.receiving,
  );
  if (!result.success) {
    sendError(ws, result.error || 'Invalid bank trade');
    return;
  }

  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'bank_trade_executed',
    playerId: context.playerId,
    gave: result.gave!,
    received: result.received!,
  });
}
