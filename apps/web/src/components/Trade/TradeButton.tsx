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
  const devCardPlayPhase = useGameStore((state) => state.devCardPlayPhase);

  // Only show trade button during main phase of own turn
  const inActive = turnPhase !== 'main' || !isMyTurn;

  // Block trading during robber phase or dev card play phase
  const isBlocked =
    waitingForDiscards ||
    robberPlacementMode ||
    stealRequired ||
    (devCardPlayPhase !== null && devCardPlayPhase !== 'none');

  return (
    <button
      disabled={isBlocked || inActive}
      onClick={() => setTradeModalOpen(true)}
      style={{
        background: '#fdf6e3',
        border: '3px solid #8d6e63',
        borderRadius: '8px',
        padding: '8px 16px',
        fontFamily: 'Fraunces, serif',
        fontWeight: 600,
        fontSize: '0.875rem',
        color: '#5d4037',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        cursor: isBlocked || inActive ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: isBlocked || inActive ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isBlocked && !inActive) {
          e.currentTarget.style.background = '#f5ecd7';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isBlocked && !inActive) {
          e.currentTarget.style.background = '#fdf6e3';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }
      }}
      onMouseDown={(e) => {
        if (!isBlocked && !inActive) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
        }
      }}
      onMouseUp={(e) => {
        if (!isBlocked && !inActive) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        }
      }}
    >
      Trade
    </button>
  );
}
