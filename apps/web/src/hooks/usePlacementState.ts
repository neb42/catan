import {
  useGameStore,
  useIsMyTurn,
  usePlacementPhase,
  useCurrentPlayer,
} from '../stores/gameStore';

export interface PlacementState {
  isMyTurn: boolean;
  phase: 'settlement' | 'road' | null;
  currentPlayerIndex: number | null;
  currentPlayerId: string | null;
  draftRound: 1 | 2 | null;
  turnNumber: number;
  canPlace: boolean;
}

export function usePlacementState(): PlacementState {
  const isMyTurn = useIsMyTurn();
  const phase = usePlacementPhase();
  const { index, id } = useCurrentPlayer();
  const draftRound = useGameStore((state) => state.draftRound);
  const turnNumber = useGameStore((state) => state.turnNumber);

  return {
    isMyTurn,
    phase,
    currentPlayerIndex: index,
    currentPlayerId: id,
    draftRound,
    turnNumber,
    canPlace: isMyTurn && phase !== null,
  };
}

export function useDraftOrder(playerCount: number): Array<{
  turnNumber: number;
  playerIndex: number;
  phase: 'settlement' | 'road';
  round: 1 | 2;
  isCurrent: boolean;
}> {
  const currentTurn = useGameStore((state) => state.turnNumber);

  // Calculate full snake draft order for display
  const totalTurns = playerCount * 4; // 2 settlements + 2 roads per player
  const order: Array<{
    turnNumber: number;
    playerIndex: number;
    phase: 'settlement' | 'road';
    round: 1 | 2;
    isCurrent: boolean;
  }> = [];

  for (let t = 0; t < totalTurns; t++) {
    const positionsPerRound = playerCount * 2;

    if (t < positionsPerRound) {
      // Round 1: forward
      order.push({
        turnNumber: t,
        playerIndex: Math.floor(t / 2),
        phase: t % 2 === 0 ? 'settlement' : 'road',
        round: 1,
        isCurrent: t === currentTurn,
      });
    } else {
      // Round 2: reverse
      const roundTwoTurn = t - positionsPerRound;
      order.push({
        turnNumber: t,
        playerIndex: playerCount - 1 - Math.floor(roundTwoTurn / 2),
        phase: roundTwoTurn % 2 === 0 ? 'settlement' : 'road',
        round: 2,
        isCurrent: t === currentTurn,
      });
    }
  }

  return order;
}
