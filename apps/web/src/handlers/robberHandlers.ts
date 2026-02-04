import { ResourceType } from '@catan/shared';

import { showGameNotification } from '@web/components/Feedback';
import { useGameStore } from '@web/stores/gameStore';

import { HandlerContext, MessageHandler } from './types';

export const handleDiscardRequired: MessageHandler = (message, ctx) => {
  if (message.type !== 'discard_required') return;

  // Only show discard modal if this is for current player
  const myId = useGameStore.getState().myPlayerId;
  if (message.playerId === myId) {
    useGameStore
      .getState()
      .setDiscardRequired(true, message.targetCount, message.currentResources);
  }
};

export const handleDiscardCompleted: MessageHandler = (message, ctx) => {
  if (message.type !== 'discard_completed') return;

  const gameStore = useGameStore.getState();
  // Update player resources (deduct discarded)
  const currentResources = gameStore.playerResources[message.playerId];
  if (currentResources && message.discarded) {
    const deductions = Object.entries(message.discarded)
      .filter(([_, count]) => (count as number) > 0)
      .map(([type, count]) => ({
        type: type as ResourceType,
        count: -(count as number),
      }));
    gameStore.updatePlayerResources(message.playerId, deductions);
  }
  // Remove this player from the list of players who must discard
  gameStore.removePlayerFromDiscard(message.playerId);
  // Clear own discard modal if it was us
  const myId = gameStore.myPlayerId;
  if (message.playerId === myId) {
    gameStore.setDiscardRequired(false, 0, null);
  }
  // Show notification for discard
  const discardingPlayer = ctx.room?.players.find(
    (p) => p.id === message.playerId,
  );
  const nickname = discardingPlayer?.nickname || 'A player';
  showGameNotification(`${nickname} discarded cards`, 'info');
};

export const handleAllDiscardsComplete: MessageHandler = (message, ctx) => {
  if (message.type !== 'all_discards_complete') return;

  // All discards done - clear the waiting state for all players
  useGameStore.getState().setWaitingForDiscards(false, []);
  // robber mover will receive robber_move_required separately
};

export const handleRobberTriggered: MessageHandler = (message, ctx) => {
  if (message.type !== 'robber_triggered') return;

  // Block ALL players until discards are complete
  const { mustDiscardPlayers } = message;
  if (mustDiscardPlayers && mustDiscardPlayers.length > 0) {
    // Extract just the player IDs from the objects
    const playerIds = mustDiscardPlayers.map((p) => p.playerId);
    useGameStore.getState().setWaitingForDiscards(true, playerIds);
  }
};

export const handleRobberMoveRequired: MessageHandler = (message, ctx) => {
  if (message.type !== 'robber_move_required') return;

  useGameStore.getState().setRobberPlacementMode(true);
};

export const handleRobberMoved: MessageHandler = (message, ctx) => {
  if (message.type !== 'robber_moved') return;

  const gameStore = useGameStore.getState();
  gameStore.setRobberHexId(message.hexId);
  gameStore.setRobberPlacementMode(false);
  // Show notification for robber moved
  const movingPlayer = ctx.room?.players.find((p) => p.id === message.playerId);
  const nickname = movingPlayer?.nickname || 'A player';
  showGameNotification(`${nickname} moved the robber`, 'info');
};

export const handleStealRequired: MessageHandler = (message, ctx) => {
  if (message.type !== 'steal_required') return;

  useGameStore.getState().setStealRequired(true, message.candidates);
};

export const handleStolen: MessageHandler = (message, ctx) => {
  if (message.type !== 'stolen') return;

  // Update resources for thief and victim
  const gameStore = useGameStore.getState();
  if (message.resourceType) {
    // Victim loses resource
    gameStore.updatePlayerResources(message.victimId, [
      { type: message.resourceType, count: -1 },
    ]);
    // Thief gains resource
    gameStore.updatePlayerResources(message.thiefId, [
      { type: message.resourceType, count: 1 },
    ]);
  }
  // Clear steal state
  gameStore.setStealRequired(false, []);
  // Show notification for steal
  const thief = ctx.room?.players.find((p) => p.id === message.thiefId);
  const victim = ctx.room?.players.find((p) => p.id === message.victimId);
  const thiefNickname = thief?.nickname || 'A player';
  const victimNickname = victim?.nickname || 'someone';
  if (message.resourceType) {
    showGameNotification(
      `${thiefNickname} stole from ${victimNickname}`,
      'info',
    );
  } else {
    showGameNotification(`${thiefNickname} stole nothing (no cards)`, 'info');
  }
};

export const handleNoStealPossible: MessageHandler = (message, ctx) => {
  if (message.type !== 'no_steal_possible') return;

  // No one to steal from - just continue
  useGameStore.getState().setStealRequired(false, []);
};
