import { showGameNotification } from '@web/components/Feedback';
import { soundService } from '@web/services/sound';
import { useGameStore } from '@web/stores/gameStore';

import { HandlerContext, MessageHandler } from './types';

export const handleDiceRolled: MessageHandler = (message, ctx) => {
  if (message.type !== 'dice_rolled') return;

  const gameStore = useGameStore.getState();

  // Get player nickname for log
  const currentPlayer = gameStore.room?.players.find(
    (p) => p.id === gameStore.turnCurrentPlayerId,
  );
  const playerName = currentPlayer?.nickname || 'Someone';

  // Log dice roll
  gameStore.addLogEntry(
    `${playerName} rolled ${message.total} (${message.dice1} + ${message.dice2})`,
  );

  // Log resource distributions
  for (const grant of message.resourcesDistributed) {
    const player = gameStore.room?.players.find((p) => p.id === grant.playerId);
    if (player) {
      const resourceNames = grant.resources
        .filter((r) => r.count > 0)
        .map((r) => `${r.count} ${r.type}`)
        .join(', ');
      if (resourceNames) {
        gameStore.addLogEntry(`${player.nickname} received ${resourceNames}`);
      }
    }
  }

  // Update phase to 'main' FIRST (dice has been rolled)
  // This must happen before setDiceRoll because setTurnState clears lastDiceRoll
  gameStore.setTurnState({
    phase: 'main',
    currentPlayerId: gameStore.turnCurrentPlayerId || '',
    turnNumber: gameStore.turnNumber,
  });
  // Store dice result AFTER setTurnState (which clears lastDiceRoll)
  gameStore.setDiceRoll({
    dice1: message.dice1,
    dice2: message.dice2,
    total: message.total,
  });
  // Store resource distribution for notification display
  gameStore.setLastResourcesDistributed(message.resourcesDistributed);
  // Update resources for all affected players
  for (const grant of message.resourcesDistributed) {
    gameStore.updatePlayerResources(grant.playerId, grant.resources);
  }
  // Play dice roll sound
  soundService.play('diceRoll');

  // Play resource gain sound if any resources were distributed
  const hasDistribution = message.resourcesDistributed.some((grant) =>
    grant.resources.some((r) => r.count > 0),
  );
  if (hasDistribution) {
    soundService.play('resourceGain');
  }

  // Show notification for dice roll
  showGameNotification(`Rolled ${message.total}`, 'info');
  if (message.total === 7) {
    showGameNotification('Robber activated!', 'warning');
  }
};

export const handleTurnChanged: MessageHandler = (message, ctx) => {
  if (message.type !== 'turn_changed') return;

  const gameStore = useGameStore.getState();
  gameStore.setTurnState({
    phase: message.phase,
    currentPlayerId: message.currentPlayerId,
    turnNumber: message.turnNumber,
  });

  // Play sound when it becomes this player's turn
  const { myPlayerId } = useGameStore.getState();
  if (message.currentPlayerId === myPlayerId) {
    soundService.play('yourTurn');
  }

  // Clear any active trade when turn changes
  gameStore.clearTrade();
  gameStore.setTradeModalOpen(false);
  // Reset dev card play state for new turn
  gameStore.setHasPlayedDevCardThisTurn(false);
  // Set initial robber position if provided (first turn after setup)
  if (message.robberHexId !== undefined) {
    gameStore.setRobberHexId(message.robberHexId);
  }
};
