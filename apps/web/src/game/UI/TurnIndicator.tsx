import { useGameStore } from '../../stores/gameStore';

export function TurnIndicator() {
  const gameState = useGameStore((state) => state.gameState);
  const myPlayerId = useGameStore((state) => state.myPlayerId);

  if (!gameState) return null;

  const currentPlayer = gameState.players.find((player) => player.id === gameState.currentPlayer);
  const isMyTurn = gameState.currentPlayer === myPlayerId;

  const phaseDisplay: Record<string, string> = {
    initial_placement: `Initial Placement - Round ${
      gameState.placementRound ?? 1
    }/${gameState.players.length * 2}`,
    gameplay:
      gameState.turnPhase === 'roll'
        ? 'Roll Dice'
        : gameState.turnPhase === 'main'
        ? 'Main Phase (Trade/Build)'
        : 'End Phase — Finishing turn...',
    game_over: 'Game Over',
  };

  return (
    <div
      style={{
        padding: '1rem',
        backgroundColor: isMyTurn ? '#4CAF50' : '#f0f0f0',
        color: isMyTurn ? 'white' : '#1f1f1f',
        fontWeight: 700,
        fontSize: 18,
        textAlign: 'center',
        borderRadius: 8,
      }}
    >
      {isMyTurn ? '🎲 Your Turn' : `Waiting for ${currentPlayer?.nickname ?? 'player'}`}
      <div style={{ fontSize: 14, marginTop: '0.25rem', fontWeight: 600 }}>
        {phaseDisplay[gameState.phase]}
      </div>
    </div>
  );
}
