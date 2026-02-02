interface LargestArmyState {
  holderId: string | null;
  knights: number;
}

export interface LargestArmyResult {
  newState: LargestArmyState;
  knightCounts: Record<string, number>;
  transferred: boolean;
  fromPlayerId?: string;
  toPlayerId?: string;
}

/**
 * Recalculate largest army for all players and determine award holder.
 *
 * Rules:
 * - Minimum 3 knights to qualify
 * - New player must EXCEED current holder's count (not match)
 * - Ties favor current holder
 * - If current holder drops below all others, award can transfer
 */
export function recalculateLargestArmy(
  knightCounts: Record<string, number>,
  currentState: LargestArmyState,
): LargestArmyResult {
  // Find maximum knight count
  const counts = Object.values(knightCounts);
  const maxKnights = counts.length > 0 ? Math.max(...counts) : 0;

  // No one qualifies (< 3 knights)
  if (maxKnights < 3) {
    if (currentState.holderId) {
      return {
        newState: { holderId: null, knights: 0 },
        knightCounts,
        transferred: true,
        fromPlayerId: currentState.holderId,
      };
    }
    return {
      newState: { holderId: null, knights: 0 },
      knightCounts,
      transferred: false,
    };
  }

  // Find all players at max knight count
  const playersAtMax = Object.entries(knightCounts)
    .filter(([_, count]) => count === maxKnights)
    .map(([id]) => id);

  // Multiple players tied at max
  if (playersAtMax.length > 1) {
    // Current holder keeps if still at max
    if (currentState.holderId && playersAtMax.includes(currentState.holderId)) {
      return {
        newState: { holderId: currentState.holderId, knights: maxKnights },
        knightCounts,
        transferred: false,
      };
    }
    // Tie with no current holder at max - no one gets it
    if (currentState.holderId) {
      return {
        newState: { holderId: null, knights: 0 },
        knightCounts,
        transferred: true,
        fromPlayerId: currentState.holderId,
      };
    }
    return {
      newState: { holderId: null, knights: 0 },
      knightCounts,
      transferred: false,
    };
  }

  // Single player has max
  const winnerId = playersAtMax[0];

  // New player must exceed (not match) current holder
  if (currentState.holderId && currentState.holderId !== winnerId) {
    if (maxKnights <= currentState.knights) {
      // Current holder retains
      return {
        newState: currentState,
        knightCounts,
        transferred: false,
      };
    }
  }

  // Award to winner
  if (winnerId !== currentState.holderId) {
    return {
      newState: { holderId: winnerId, knights: maxKnights },
      knightCounts,
      transferred: true,
      fromPlayerId: currentState.holderId ?? undefined,
      toPlayerId: winnerId,
    };
  }

  // Current holder still has it (possibly with updated count)
  return {
    newState: { holderId: winnerId, knights: maxKnights },
    knightCounts,
    transferred: false,
  };
}
