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
    <Text
      x={pixel.x}
      y={pixel.y}
      style={{
        fontSize: '5px',
        fontWeight: isHighProbability ? 'bold' : 'normal',
        fill: isHighProbability ? '#C73E1D' : '#4A4A4A',
        textAnchor: 'middle',
        dominantBaseline: 'central',
      }}
    >
      {hex.number}
    </Text>
  );
}
