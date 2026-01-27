import { Hexagon } from 'react-hexgrid';
import { Hex } from '@catan/shared';
import { NumberToken } from './NumberToken';

interface TerrainHexProps {
  hex: Hex;
}

const getBackgroundFill = (terrain: Hex['terrain']): string => {
  switch (terrain) {
    case 'forest':
      return '#228B22';
    case 'hills':
      return '#D2691E';
    case 'mountains':
      return '#A9A9A9';
    case 'fields':
      return '#FFFF99';
    case 'pasture':
      return '#7CFC00';
    case 'desert':
      return '#EDC9AF';
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
