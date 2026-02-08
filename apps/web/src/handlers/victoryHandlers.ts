import { useGameStore } from '@web/stores/gameStore';

import { HandlerContext, MessageHandler } from './types';

export const handleVictory: MessageHandler = (message, ctx) => {
  if (message.type !== 'victory') return;

  const gameStore = useGameStore.getState();
  gameStore.setVictoryState({
    winnerId: message.winnerId,
    winnerNickname: message.winnerNickname,
    winnerVP: message.winnerVP,
    allPlayerVP: message.allPlayerVP,
    revealedVPCards: message.revealedVPCards,
  });

  // Set game stats if present
  if (message.stats) {
    gameStore.setGameStats(message.stats);
  }

  // Log victory
  const winnerVPTotal = message.winnerVP.total || message.winnerVP;
  gameStore.addLogEntry(
    `${message.winnerNickname} won with ${winnerVPTotal} points!`,
  );
};
