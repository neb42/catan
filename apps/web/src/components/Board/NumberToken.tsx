import { HexUtils, Text } from 'react-hexgrid';
import { useLayoutContext } from 'react-hexgrid/lib/Layout';
import { Hex } from '@catan/shared';

const PROBABILITY_DOTS: Record<number, number> = {
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  8: 5,
  9: 4,
  10: 3,
  11: 2,
  12: 1,
};

interface NumberTokenProps {
  hex: Hex;
}

export function NumberToken({ hex }: NumberTokenProps) {
  if (!hex.number) return null;

  const { layout } = useLayoutContext();
  const cube = { q: hex.q, r: hex.r, s: -hex.q - hex.r };
  const pixel = HexUtils.hexToPixel(cube, layout);
  const isHighProbability = hex.number === 6 || hex.number === 8;
  const dotCount = PROBABILITY_DOTS[hex.number] ?? 0;
  const dotColor = isHighProbability ? '#C73E1D' : '#4A4A4A';
  const dotRadius = 0.3;
  const dotSpacing = 1;
  const centerY = pixel.y + 5;
  const textY = centerY - 0.6;
  const dotsY = centerY + 1.6;

  return (
    <g>
      <circle
        cx={pixel.x}
        cy={centerY}
        r={3.2}
        fill={isHighProbability ? '#F5D6D0' : '#E0E0E0'}
      >
      </circle>
      <Text
        x={pixel.x}
        y={textY}
        style={{
          fontSize: '3px',
          fontWeight: 'bold' ,
          fill: isHighProbability ? '#C73E1D' : '#4A4A4A',
          textAnchor: 'middle',
          dominantBaseline: 'central',
        }}
      >
        {hex.number}
      </Text>
      {Array.from({ length: dotCount }, (_, i) => {
        const offsetX = (i - (dotCount - 1) / 2) * dotSpacing;
        return (
          <circle
            key={i}
            cx={pixel.x + offsetX}
            cy={dotsY}
            r={dotRadius}
            fill={dotColor}
          />
        );
      })}
    </g>
  );
}
