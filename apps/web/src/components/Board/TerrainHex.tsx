import { Hexagon } from 'react-hexgrid';
import { Hex } from '@catan/shared';
import { NumberToken } from './NumberToken';

interface TerrainHexProps {
  hex: Hex;
}

export function TerrainHex({ hex }: TerrainHexProps) {
  return (
    <>
      <Hexagon 
        q={hex.q} 
        r={hex.r} 
        s={-hex.q - hex.r}
        fill={`url(#${hex.terrain})`}
        style={{
          stroke: '#8B7355',
          strokeWidth: 0.5,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
        }}
      />
      {hex.number && <NumberToken hex={hex} />}
    </>
  );
}
