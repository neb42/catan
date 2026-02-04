import { showGameNotification } from '@web/components/Feedback';
import { useGameStore } from '@web/stores/gameStore';

import { HandlerContext, MessageHandler } from './types';

export const handleLongestRoadUpdated: MessageHandler = (message, ctx) => {
  if (message.type !== 'longest_road_updated') return;

  const gameStore = useGameStore.getState();
  const { holderId, holderLength, playerLengths, transferredFrom } = message;

  // Update state
  gameStore.setLongestRoadState({
    holderId,
    holderLength,
    playerLengths,
  });

  // Show toast if transferred
  if (transferredFrom) {
    const fromPlayer = ctx.room?.players.find((p) => p.id === transferredFrom);
    const toPlayer = holderId
      ? ctx.room?.players.find((p) => p.id === holderId)
      : null;

    if (toPlayer) {
      showGameNotification(
        `${toPlayer.nickname} takes Longest Road from ${fromPlayer?.nickname || 'nobody'}!`,
        'success',
      );
    } else {
      // Award lost (went below 5 or tie broke it)
      showGameNotification(
        `${fromPlayer?.nickname} loses Longest Road!`,
        'warning',
      );
    }
  }
};

export const handleLargestArmyUpdated: MessageHandler = (message, ctx) => {
  if (message.type !== 'largest_army_updated') return;

  const gameStore = useGameStore.getState();
  const { holderId, holderKnights, playerKnightCounts, transferredFrom } =
    message;

  // Update state
  gameStore.setLargestArmyState({
    holderId,
    holderKnights,
    playerKnightCounts,
  });

  // Show toast if transferred
  if (transferredFrom) {
    const fromPlayer = ctx.room?.players.find((p) => p.id === transferredFrom);
    const toPlayer = holderId
      ? ctx.room?.players.find((p) => p.id === holderId)
      : null;

    if (toPlayer) {
      showGameNotification(
        `${toPlayer.nickname} takes Largest Army from ${fromPlayer?.nickname || 'nobody'}!`,
        'success',
      );
    } else {
      // Award lost (tie broke it or other edge case)
      showGameNotification(
        `${fromPlayer?.nickname} loses Largest Army!`,
        'warning',
      );
    }
  }
};
