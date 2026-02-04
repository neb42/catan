import { ResourceType } from '@catan/shared';

import { showGameNotification } from '@web/components/Feedback';
import { useGameStore } from '@web/stores/gameStore';

import { HandlerContext, MessageHandler } from './types';

export const handleTradeProposed: MessageHandler = (message, ctx) => {
  if (message.type !== 'trade_proposed') return;

  const gameStore = useGameStore.getState();
  const { proposerId, offering, requesting } = message;
  // Initialize all non-proposer players with 'pending' response
  const responses: Record<string, 'pending' | 'accepted' | 'declined'> = {};
  ctx.room?.players.forEach((p) => {
    if (p.id !== proposerId) {
      responses[p.id] = 'pending';
    }
  });
  gameStore.setActiveTrade({
    proposerId,
    offering,
    requesting,
    responses,
  });
};

export const handleTradeResponse: MessageHandler = (message, ctx) => {
  if (message.type !== 'trade_response') return;

  const gameStore = useGameStore.getState();
  const { playerId, response } = message;
  gameStore.updateTradeResponse(playerId, response);
};

export const handleTradeExecuted: MessageHandler = (message, ctx) => {
  if (message.type !== 'trade_executed') return;

  const gameStore = useGameStore.getState();
  const { proposerId, partnerId, proposerGave, partnerGave } = message;

  // Subtract resources from proposer (what they gave)
  const proposerDeductions = Object.entries(proposerGave)
    .filter(([_, count]) => (count as number) > 0)
    .map(([type, count]) => ({
      type: type as ResourceType,
      count: -(count as number),
    }));
  // Add resources to proposer (what they received)
  const proposerAdditions = Object.entries(partnerGave)
    .filter(([_, count]) => (count as number) > 0)
    .map(([type, count]) => ({
      type: type as ResourceType,
      count: count as number,
    }));
  gameStore.updatePlayerResources(proposerId, [
    ...proposerDeductions,
    ...proposerAdditions,
  ]);

  // Subtract resources from partner (what they gave)
  const partnerDeductions = Object.entries(partnerGave)
    .filter(([_, count]) => (count as number) > 0)
    .map(([type, count]) => ({
      type: type as ResourceType,
      count: -(count as number),
    }));
  // Add resources to partner (what they received)
  const partnerAdditions = Object.entries(proposerGave)
    .filter(([_, count]) => (count as number) > 0)
    .map(([type, count]) => ({
      type: type as ResourceType,
      count: count as number,
    }));
  gameStore.updatePlayerResources(partnerId, [
    ...partnerDeductions,
    ...partnerAdditions,
  ]);

  gameStore.clearTrade();
  gameStore.setTradeModalOpen(false);
  // Show trade notification
  const proposer = ctx.room?.players.find((p) => p.id === proposerId);
  const partner = ctx.room?.players.find((p) => p.id === partnerId);
  showGameNotification(
    `Trade completed: ${proposer?.nickname || 'Player'} ↔ ${partner?.nickname || 'Player'}`,
    'success',
  );
};

export const handleTradeCancelled: MessageHandler = (message, ctx) => {
  if (message.type !== 'trade_cancelled') return;

  const gameStore = useGameStore.getState();
  gameStore.clearTrade();
  gameStore.setTradeModalOpen(false);
};

export const handleBankTradeExecuted: MessageHandler = (message, ctx) => {
  if (message.type !== 'bank_trade_executed') return;

  const gameStore = useGameStore.getState();
  const { playerId, gave, received } = message;

  // Subtract what player gave to bank
  const deductions = Object.entries(gave)
    .filter(([_, count]) => (count as number) > 0)
    .map(([type, count]) => ({
      type: type as ResourceType,
      count: -(count as number),
    }));
  // Add what player received from bank
  const additions = Object.entries(received)
    .filter(([_, count]) => (count as number) > 0)
    .map(([type, count]) => ({
      type: type as ResourceType,
      count: count as number,
    }));
  gameStore.updatePlayerResources(playerId, [...deductions, ...additions]);

  // Show bank trade notification
  const trader = ctx.room?.players.find((p) => p.id === playerId);
  showGameNotification(
    `${trader?.nickname || 'A player'} traded with the bank`,
    'info',
  );
};
