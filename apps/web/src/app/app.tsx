import { useParams } from 'react-router-dom';
import { Game } from '../components/Game';
import Lobby from '../components/Lobby';
import { useGameStore } from '../stores/gameStore';

export function App() {
  const { roomId } = useParams<{ roomId?: string }>();
  const gameStarted = useGameStore((state) => state.gameStarted);

  return (
    <>
      <div className="bg-pattern" />
      {/* <div className="hex-decoration hex-1" /> */}
      {/* <div className="hex-decoration hex-2" /> */}

      <div style={{ display: gameStarted ? 'none' : 'block' }}>
        <Lobby roomIdFromUrl={roomId} />
      </div>

      {gameStarted && <Game />}
    </>
  );
}

export default App;
