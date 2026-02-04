import { useGameStore } from '@web/stores/gameStore';

import { HandlerContext, MessageHandler } from './types';

export const handleGameStarting: MessageHandler = (message, ctx) => {
  if (message.type !== 'game_starting') return;

  ctx.setCountdown(message.countdown);
  setInterval(() => {
    ctx.setCountdown((prev) => {
      if (prev === null) return null;
      if (prev <= 1) return null;
      return prev - 1;
    });
  }, 1000);
};

export const handleGameStarted: MessageHandler = (message, ctx) => {
  if (message.type !== 'game_started') return;

  const gameStore = useGameStore.getState();
  gameStore.setBoard(message.board);
  gameStore.setGameStarted(true);
};

export const handleSetupComplete: MessageHandler = (message, ctx) => {
  if (message.type !== 'setup_complete') return;

  // Clear placement-specific state
  useGameStore.getState().clearPlacementState();
};
