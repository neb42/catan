import { Button } from '@mantine/core';
import { useTradeActions } from '../../hooks/useTradeState';
import { useIsMyTurnInMainGame, useGameStore } from '../../stores/gameStore';

export function TradeButton() {
  const { setTradeModalOpen } = useTradeActions();
  const isMyTurn = useIsMyTurnInMainGame();
  const turnPhase = useGameStore((state) => state.turnPhase);

  // Only show trade button during main phase of own turn
  if (turnPhase !== 'main' || !isMyTurn) {
    return null;
  }

  return (
    <Button
      variant="light"
      color="blue"
      onClick={() => setTradeModalOpen(true)}
    >
      Trade
    </Button>
  );
}
