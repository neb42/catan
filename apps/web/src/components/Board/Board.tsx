import { HexGrid, Layout, Pattern } from 'react-hexgrid';
import { BoardState } from '@catan/shared';
import { TerrainHex } from './TerrainHex';
import { Port } from './Port';

interface BoardProps {
  board: BoardState;
}

export function Board({ board }: BoardProps) {
  return (
    <HexGrid width="100%" height="100%" viewBox="-50 -50 100 100">
      {/* Define SVG patterns for terrain textures */}
      <Pattern id="forest" link="/assets/tiles/forest.svg" />
      <Pattern id="hills" link="/assets/tiles/hills.svg" />
      <Pattern id="fields" link="/assets/tiles/fields.svg" />
      <Pattern id="pasture" link="/assets/tiles/pasture.svg" />
      <Pattern id="mountains" link="/assets/tiles/mountains.svg" />
      <Pattern id="desert" link="/assets/tiles/desert.svg" />
      
      {/* Pointy-top layout (flat=false) with moderate spacing */}
      <Layout size={{ x: 10, y: 10 }} flat={false} spacing={1.05} origin={{ x: 0, y: 0 }}>
        {board.hexes.map(hex => (
          <TerrainHex key={`${hex.q}-${hex.r}`} hex={hex} />
        ))}
      </Layout>
      
      {/* Render ports */}
      {board.ports.map((port, i) => (
        <Port key={i} port={port} />
      ))}
    </HexGrid>
  );
}
