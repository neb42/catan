import { useGameStore } from '@web/stores/gameStore';
import { showGameNotification } from '@web/components/Feedback';

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

export const handleRematchUpdate: MessageHandler = (message, ctx) => {
  if (message.type !== 'rematch_update') return;

  const gameStore = useGameStore.getState();
  gameStore.setRematchState(
    message.readyPlayers,
    message.readyCount,
    message.totalPlayers,
  );
};

export const handleGameReset: MessageHandler = (message, ctx) => {
  if (message.type !== 'game_reset') return;

  const gameStore = useGameStore.getState();

  // Clear victory and rematch state
  gameStore.setVictoryPhase('none');
  gameStore.clearRematchState();
  gameStore.setGameStats(null);

  // Reset to placement state with new board
  // The game_reset message includes new board
  gameStore.setBoard(message.board);
  gameStore.setGameStarted(true);

  // Toast notification
  showGameNotification('New game starting!', 'success');
};
