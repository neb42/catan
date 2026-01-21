import { HexGrid as ReactHexGrid, Layout, Hexagon } from 'react-hexgrid';
import { motion } from 'motion/react';

import { useGameStore } from '../../stores/gameStore';
import { HexTile } from './HexTile';

export function HexGrid() {
  const gameState = useGameStore((state) => state.gameState);

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <ReactHexGrid width={900} height={700} viewBox="-55 -55 110 110">
        <Layout size={{ x: 10, y: 10 }} flat={false} spacing={1.05}>
          {gameState.board.hexes.map((hex) => (
            <Hexagon
              key={`${hex.coord.q},${hex.coord.r}`}
              q={hex.coord.q}
              r={hex.coord.r}
              s={-hex.coord.q - hex.coord.r}
            >
              <HexTile hex={hex} />
            </Hexagon>
          ))}

        </Layout>
      </ReactHexGrid>
    </motion.div>
  );
}
