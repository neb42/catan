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

export const handleCountdownTick: MessageHandler = (message, ctx) => {
  if (message.type !== 'countdown_tick') return;

  if (message.secondsRemaining < 0) {
    // Countdown cancelled
    ctx.setCountdown(null);
  } else {
    ctx.setCountdown(message.secondsRemaining);
  }
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

export const handleGameStateSync: MessageHandler = (message, ctx) => {
  if (message.type !== 'game_state_sync') return;

  const gameStore = useGameStore.getState();
  const { gameState, myDevCards, opponentDevCardCounts, deckRemaining } =
    message;

  // Sync player resources for all players
  for (const [playerId, resources] of Object.entries(
    gameState.playerResources,
  )) {
    // Set the entire resource object directly
    gameStore.playerResources[playerId] = resources;
  }

  // Sync settlements and roads
  gameStore.settlements = gameState.settlements;
  gameStore.roads = gameState.roads;

  // Sync placement state (setup phase)
  if (gameState.placement) {
    // Map GameState phase to frontend phase format
    const phase = gameState.placement.phase.includes('settlement')
      ? 'settlement'
      : 'road';

    // Get player ID from player index
    const room = gameStore.room;
    if (room && room.players[gameState.placement.currentPlayerIndex]) {
      const currentPlayerId =
        room.players[gameState.placement.currentPlayerIndex].id;

      gameStore.setPlacementTurn({
        currentPlayerIndex: gameState.placement.currentPlayerIndex,
        currentPlayerId: currentPlayerId,
        phase: phase as 'settlement' | 'road',
        round: gameState.placement.draftRound,
        turnNumber: gameState.placement.turnNumber,
      });
    }
  }

  // Sync turn state (main game phase)
  if (gameState.turnState) {
    gameStore.setTurnState({
      phase: gameState.turnState.phase,
      currentPlayerId: gameState.turnState.currentPlayerId,
      turnNumber: gameState.turnState.turnNumber,
    });
    if (gameState.turnState.lastDiceRoll) {
      gameStore.setDiceRoll(gameState.turnState.lastDiceRoll);
    }
  }

  // Sync robber position
  gameStore.setRobberHexId(gameState.robberHexId);

  // Sync longest road
  gameStore.setLongestRoadState({
    holderId: gameState.longestRoadHolderId,
    holderLength: gameState.longestRoadLength,
    playerLengths: gameState.playerRoadLengths,
  });

  // Sync largest army
  gameStore.setLargestArmyState({
    holderId: gameState.largestArmyHolderId,
    holderKnights: gameState.largestArmyKnights,
    playerKnightCounts: gameState.playerKnightCounts,
  });

  // Sync development cards
  gameStore.setMyDevCards(myDevCards);
  for (const [playerId, count] of Object.entries(opponentDevCardCounts)) {
    gameStore.setOpponentDevCardCount(playerId, count);
  }
  gameStore.setDeckRemaining(deckRemaining);

  // Ensure game is marked as started
  gameStore.setGameStarted(true);
};
