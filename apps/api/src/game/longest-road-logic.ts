import { Road, Settlement } from '@catan/shared';
import { calculatePlayerLongestRoad } from '@catan/shared';

interface LongestRoadState {
  holderId: string | null;
  length: number;
}

export interface LongestRoadResult {
  newState: LongestRoadState;
  playerLengths: Record<string, number>;
  transferred: boolean;
  fromPlayerId?: string;
  toPlayerId?: string;
}

/**
 * Recalculate longest road for all players and determine award holder.
 *
 * Rules:
 * - Minimum 5 roads to qualify
 * - New player must EXCEED current holder's length (not match)
 * - Ties favor current holder
 * - If current holder drops below all others, award can transfer
 */
export function recalculateLongestRoad(
  roads: Road[],
  settlements: Settlement[],
  playerIds: string[],
  currentState: LongestRoadState,
): LongestRoadResult {
  // Calculate for all players
  const playerLengths: Record<string, number> = {};
  for (const playerId of playerIds) {
    playerLengths[playerId] = calculatePlayerLongestRoad(
      roads,
      settlements,
      playerId,
    );
  }

  const maxLength = Math.max(...Object.values(playerLengths), 0);

  // No one qualifies (< 5)
  if (maxLength < 5) {
    if (currentState.holderId) {
      return {
        newState: { holderId: null, length: 0 },
        playerLengths,
        transferred: true,
        fromPlayerId: currentState.holderId,
      };
    }
    return {
      newState: { holderId: null, length: 0 },
      playerLengths,
      transferred: false,
    };
  }

  // Find all players at max length
  const playersAtMax = Object.entries(playerLengths)
    .filter(([_, len]) => len === maxLength)
    .map(([id]) => id);

  // Multiple players tied at max
  if (playersAtMax.length > 1) {
    // Current holder keeps if still at max
    if (currentState.holderId && playersAtMax.includes(currentState.holderId)) {
      return {
        newState: { holderId: currentState.holderId, length: maxLength },
        playerLengths,
        transferred: false,
      };
    }
    // Tie with no current holder at max - no one gets it
    if (currentState.holderId) {
      return {
        newState: { holderId: null, length: 0 },
        playerLengths,
        transferred: true,
        fromPlayerId: currentState.holderId,
      };
    }
    return {
      newState: { holderId: null, length: 0 },
      playerLengths,
      transferred: false,
    };
  }

  // Single player has max
  const winnerId = playersAtMax[0];

  // New player must exceed (not match) current holder
  if (currentState.holderId && currentState.holderId !== winnerId) {
    if (maxLength <= currentState.length) {
      // Current holder retains
      return {
        newState: currentState,
        playerLengths,
        transferred: false,
      };
    }
  }

  // Award to winner
  if (winnerId !== currentState.holderId) {
    return {
      newState: { holderId: winnerId, length: maxLength },
      playerLengths,
      transferred: true,
      fromPlayerId: currentState.holderId ?? undefined,
      toPlayerId: winnerId,
    };
  }

  // Current holder still has it (possibly with updated length)
  return {
    newState: { holderId: winnerId, length: maxLength },
    playerLengths,
    transferred: false,
  };
}
