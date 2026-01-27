export interface DraftPosition {
  round: 1 | 2;
  playerIndex: number;
  phase: 'settlement' | 'road';
}

export function calculateDraftPosition(
  turnNumber: number,
  playerCount: number,
): DraftPosition {
  const positionsPerRound = playerCount * 2;

  if (turnNumber < positionsPerRound) {
    // Round 1: Forward (0 -> n-1)
    // Each player places settlement then road
    const playerIndex = Math.floor(turnNumber / 2);
    const phase = turnNumber % 2 === 0 ? 'settlement' : 'road';
    return { round: 1, playerIndex, phase };
  } else {
    // Round 2: Reverse (n-1 -> 0)
    // Each player places settlement then road
    const roundTwoTurn = turnNumber - positionsPerRound;
    const playerIndex = playerCount - 1 - Math.floor(roundTwoTurn / 2);
    const phase = roundTwoTurn % 2 === 0 ? 'settlement' : 'road';
    return { round: 2, playerIndex, phase };
  }
}

export function getNextDraftPosition(
  current: DraftPosition,
  playerCount: number,
): DraftPosition | null {
  if (current.phase === 'settlement') {
    return { ...current, phase: 'road' };
  }

  // current phase is 'road', so move to next player
  if (current.round === 1) {
    if (current.playerIndex < playerCount - 1) {
      // Next player in forward order
      return {
        round: 1,
        playerIndex: current.playerIndex + 1,
        phase: 'settlement',
      };
    } else {
      // End of round 1, start round 2 with same player (last player)
      return { round: 2, playerIndex: playerCount - 1, phase: 'settlement' };
    }
  } else {
    // Round 2
    if (current.playerIndex > 0) {
      // Previous player in reverse order
      return {
        round: 2,
        playerIndex: current.playerIndex - 1,
        phase: 'settlement',
      };
    } else {
      // End of setup
      return null;
    }
  }
}

export function isSetupComplete(
  turnNumber: number,
  playerCount: number,
): boolean {
  return turnNumber >= playerCount * 4;
}

export function getTotalSetupTurns(playerCount: number): number {
  return playerCount * 4;
}
