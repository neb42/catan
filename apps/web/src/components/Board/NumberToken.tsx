import { Text } from 'react-hexgrid';
import { Hex } from '@catan/shared';

interface NumberTokenProps {
  hex: Hex;
}

export function NumberToken({ hex }: NumberTokenProps) {
  if (!hex.number) return null;
  
  const isHighProbability = hex.number === 6 || hex.number === 8;
  
  return (
    <Text 
      x={hex.q} 
      y={hex.r}
      style={{
        fontSize: '5px',
        fontWeight: isHighProbability ? 'bold' : 'normal',
        fill: isHighProbability ? '#C73E1D' : '#4A4A4A',
        textAnchor: 'middle',
        dominantBaseline: 'central'
      }}
    >
      {hex.number}
    </Text>
  );
}
