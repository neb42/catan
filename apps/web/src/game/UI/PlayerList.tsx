import { useGameStore } from '../../stores/gameStore';

export function PlayerList() {
  const gameState = useGameStore((state) => state.gameState);

  if (!gameState) return null;

  return (
    <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: 8 }}>
      <h3 style={{ marginTop: 0 }}>Players</h3>
      {gameState.players.map((player) => {
        const isCurrentPlayer = player.id === gameState.currentPlayer;
        const totalResources = Object.values(player.resources).reduce((a, b) => a + b, 0);

        return (
          <div
            key={player.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              backgroundColor: isCurrentPlayer ? '#e8f5e9' : 'white',
              borderRadius: 4,
              marginBottom: '0.5rem',
              border: isCurrentPlayer ? '2px solid #4CAF50' : '1px solid #ddd',
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                backgroundColor: player.color,
                border: '2px solid black',
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>{player.nickname}</div>
              <div style={{ fontSize: 12, color: '#666' }}>
                {totalResources} resources • {player.victoryPoints} VP
              </div>
            </div>
            {isCurrentPlayer && <span>⭐</span>}
          </div>
        );
      })}
    </div>
  );
}
