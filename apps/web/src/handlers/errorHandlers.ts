import { showGameNotification } from '@web/components/Feedback';
import { useGameStore } from '@web/stores/gameStore';

import { HandlerContext, MessageHandler } from './types';

export const handleError: MessageHandler = (message, ctx) => {
  if (message.type !== 'error') return;

  if (ctx.lastAction === 'create') {
    ctx.setCreateError(message.message);
  } else if (ctx.lastAction === 'join') {
    ctx.setJoinError(message.message);
  } else {
    ctx.setGeneralError(message.message);
    useGameStore.getState().setLastError(message.message);
    // Show error notification during gameplay
    showGameNotification(message.message, 'error');
  }
};
