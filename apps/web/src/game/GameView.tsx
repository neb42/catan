import { HexGrid } from './Board/HexGrid';
import { DiceRoller } from './UI/DiceRoller';
import { ResourceCards } from './UI/ResourceCards';
import { TurnIndicator } from './UI/TurnIndicator';
import { PlayerList } from './UI/PlayerList';
import { useGameStore } from '../stores/gameStore';

export function GameView() {
  const myPlayerId = useGameStore((state) => state.myPlayerId);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        gridTemplateColumns: '260px 1fr',
        height: '100vh',
        gap: '1rem',
        padding: '1rem',
        background: '#e8f1fb',
      }}
    >
      <div style={{ gridColumn: '1 / -1' }}>
        <TurnIndicator />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <PlayerList />
        <DiceRoller />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#d9ecff',
          borderRadius: 12,
          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.6)',
        }}
      >
        <HexGrid />
      </div>

      <div style={{ gridColumn: '1 / -1' }}>
        <ResourceCards playerId={myPlayerId} />
      </div>
    </div>
  );
}
