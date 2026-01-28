import { Hexagon } from 'react-hexgrid';
import { Hex } from '@catan/shared';
import { NumberToken } from './NumberToken';

interface TerrainHexProps {
  hex: Hex;
}

const getBackgroundFill = (terrain: Hex['terrain']): string => {
  switch (terrain) {
    case 'forest':
      return '#66BB6A';
    case 'hills':
      return '#FF7043';
    case 'mountains':
      return '#90A4AE';
    case 'fields':
      return '#DAA520';
    case 'pasture':
      return '#AED581';
    case 'desert':
      return '#D7CCC8';
    default:
      return '#FFFFFF';
  }
}

const getIconOffset = (terrain: Hex['terrain']): number => {
  switch (terrain) {
    case 'forest':
      return -1.1;
    case 'hills':
      return -1.8;
    case 'mountains':
      return -1.4;
    case 'fields':
      return -1.1;
    case 'pasture':
      return -1.4;
    case 'desert':
      return -1.4;
    default:
      return 0;
  }
}

export function TerrainHex({ hex }: TerrainHexProps) {
  return (
    <>
      <Hexagon 
        q={hex.q} 
        r={hex.r} 
        s={-hex.q - hex.r}
        style={{
          stroke: '#8B7355',
          strokeWidth: 0.5,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
          fill: getBackgroundFill(hex.terrain),
        }}
      />
      <Hexagon 
        q={hex.q} 
        r={hex.r} 
        s={-hex.q - hex.r}
        fill={`${hex.terrain}`}
        cellStyle={{ transform: `translateX(${getIconOffset(hex.terrain)}px)` }}
      />
      {hex.number && <NumberToken hex={hex} />}
    </>
  );
}
