import { HexGrid, Layout, Pattern } from 'react-hexgrid';
import { BoardState } from '@catan/shared';
import { TerrainHex } from './TerrainHex';
import { Port } from './Port';
import { PlacementOverlay } from './PlacementOverlay';
import { PlacementControls } from './PlacementControls';
import { useGameStore } from '../../stores/gameStore';

interface BoardProps {
  board: BoardState;
}

export function Board({ board }: BoardProps) {
  const currentPlayerColor = useGameStore((state) => {
    // Determine color from store - fallback to white if not found (shouldn't happen in game)
    // We assume the gameStore has player info, or we derive it from socket/room state
    // For now, let's try to get it from the store if available, or pass it in via props in future refactor
    // The current store implementation might not have 'players' directly on root if using new simplified store
    // Let's check how store is defined in context or use a placeholder
    const myNickname = state.nickname;
    // Assuming players array exists in store or we need to access it differently
    // Based on typical store shape:
    const players = (state as any).players || [];
    const me = players.find((p: any) => p.nickname === myNickname);
    return me?.color || 'white';
  });

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <HexGrid width="100%" height="100%" viewBox="-50 -50 100 100">
        {/* Define SVG patterns for terrain textures */}
        <Pattern id="forest" link="/assets/tiles/forest.svg" />
        <Pattern id="hills" link="/assets/tiles/hills.svg" />
        <Pattern id="fields" link="/assets/tiles/fields.svg" />
        <Pattern id="pasture" link="/assets/tiles/pasture.svg" />
        <Pattern id="mountains" link="/assets/tiles/mountains.svg" />
        <Pattern id="desert" link="/assets/tiles/desert.svg" />

        {/* Pointy-top layout (flat=false) with moderate spacing */}
        <Layout
          size={{ x: 10, y: 10 }}
          flat={false}
          spacing={1.05}
          origin={{ x: 0, y: 0 }}
        >
          {board.hexes.map((hex) => (
            <TerrainHex key={`${hex.q}-${hex.r}`} hex={hex} />
          ))}

          {/* Overlay renders INSIDE Layout to share coordinate system */}
          <PlacementOverlay currentPlayerColor={currentPlayerColor} />
        </Layout>

        {/* Render ports */}
        {board.ports.map((port, i) => (
          <Port key={i} port={port} />
        ))}
      </HexGrid>

      {/* Controls render OUTSIDE SVG for standard DOM interaction */}
      <PlacementControls />
    </div>
  );
}
