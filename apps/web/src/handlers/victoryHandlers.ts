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

  // Clear all game state from previous game
  gameStore.clearPlacementState();
  gameStore.clearTurnState();
  gameStore.clearRobberState();
  gameStore.clearDevCardState();
  gameStore.clearGameLog();

  // Reset settlements, roads, and resources
  useGameStore.setState({
    settlements: [],
    roads: [],
    playerResources: {},
    gameEnded: false,
    winnerId: null,
    winnerNickname: null,
    winnerVP: null,
    allPlayerVP: {},
    revealedVPCards: [],
    longestRoadHolderId: null,
    longestRoadLength: 0,
    playerRoadLengths: {},
    largestArmyHolderId: null,
    largestArmyKnights: 0,
    buildMode: null,
    isBuildPending: false,
    activeTrade: null,
    tradeModalOpen: false,
  });

  // Set new board and keep game started (stay on game page)
  gameStore.setBoard(message.board);
  gameStore.setGameStarted(true);

  // Backend will send placement_turn to start initial placement phase
  // No navigation needed - stay on game page

  // Toast notification
  showGameNotification('New game starting!', 'success');
};
