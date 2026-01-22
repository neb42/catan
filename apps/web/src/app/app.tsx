import Lobby from '../components/Lobby';
import { useGameStore } from '../stores/gameStore';

export function App() {
  return (
    <>
      <div className="bg-pattern" />
      <div className="hex-decoration hex-1" />
      <div className="hex-decoration hex-2" />

      <div style={{ display: 'block' }}>
        <Lobby />
      </div>
    </>
  );
}

export default App;
