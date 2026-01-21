import Lobby from '../components/Lobby';
import { GameView } from '../game/GameView';
import { useGameStore } from '../stores/gameStore';

export function App() {
  const gameState = useGameStore((state) => state.gameState);

  return (
    <>
      {!gameState && (
        <>
          <div className="bg-pattern" />
          <div className="hex-decoration hex-1" />
          <div className="hex-decoration hex-2" />
        </>
      )}

      <div style={{ display: gameState ? 'none' : 'block' }}>
        <Lobby />
      </div>

      {gameState && <GameView />}
    </>
  );
}

export default App;
