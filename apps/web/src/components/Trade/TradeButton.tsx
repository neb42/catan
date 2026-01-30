import { Button } from '@mantine/core';
import { useTradeActions } from '../../hooks/useTradeState';
import { useIsMyTurnInMainGame, useGameStore } from '../../stores/gameStore';

export function TradeButton() {
  const { setTradeModalOpen } = useTradeActions();
  const isMyTurn = useIsMyTurnInMainGame();
  const turnPhase = useGameStore((state) => state.turnPhase);
  const waitingForDiscards = useGameStore((state) => state.waitingForDiscards);
  const robberPlacementMode = useGameStore(
    (state) => state.robberPlacementMode,
  );
  const stealRequired = useGameStore((state) => state.stealRequired);

  // Only show trade button during main phase of own turn
  if (turnPhase !== 'main' || !isMyTurn) {
    return null;
  }

  // Block trading during robber phase
  const isBlocked = waitingForDiscards || robberPlacementMode || stealRequired;

  return (
    <Button
      variant="light"
      color="blue"
      disabled={isBlocked}
      onClick={() => setTradeModalOpen(true)}
    >
      Trade
    </Button>
  );
}
