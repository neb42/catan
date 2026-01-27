import { HexUtils, Text } from 'react-hexgrid';
import { useLayoutContext } from 'react-hexgrid/lib/Layout';
import { Hex } from '@catan/shared';

interface NumberTokenProps {
  hex: Hex;
}

export function NumberToken({ hex }: NumberTokenProps) {
  if (!hex.number) return null;

  const { layout } = useLayoutContext();
  const cube = { q: hex.q, r: hex.r, s: -hex.q - hex.r };
  const pixel = HexUtils.hexToPixel(cube, layout);
  const isHighProbability = hex.number === 6 || hex.number === 8;

  return (
    <g>
      <circle
        cx={pixel.x}
        cy={pixel.y + 5}
        r={2}
        fill={isHighProbability ? '#F5D6D0' : '#E0E0E0'}
      >
      </circle>
      <Text
        x={pixel.x}
        y={pixel.y + 5}
        style={{
          fontSize: '3px',
          fontWeight: isHighProbability ? 'bold' : 'normal',
          fill: isHighProbability ? '#C73E1D' : '#4A4A4A',
          textAnchor: 'middle',
          dominantBaseline: 'central',
        }}
      >
        {hex.number}
      </Text>
    </g>
  );
}
