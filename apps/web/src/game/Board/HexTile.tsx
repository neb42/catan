import type { HexTile as HexTileType } from '@catan/shared';

import desert from '../../assets/tiles/desert.svg';
import fields from '../../assets/tiles/fields.svg';
import forest from '../../assets/tiles/forest.svg';
import hills from '../../assets/tiles/hills.svg';
import mountains from '../../assets/tiles/mountains.svg';
import pasture from '../../assets/tiles/pasture.svg';

const terrainMap: Record<HexTileType['terrain'], string> = {
  wood: forest,
  wheat: fields,
  sheep: pasture,
  brick: hills,
  ore: mountains,
  desert,
};

const getPipCount = (number: number | null): number => {
  if (!number) return 0;
  switch (number) {
    case 2:
    case 12:
      return 1;
    case 3:
    case 11:
      return 2;
    case 4:
    case 10:
      return 3;
    case 5:
    case 9:
      return 4;
    case 6:
    case 8:
      return 5;
    default:
      return 0;
  }
};

export function HexTile({ hex, onClick }: { hex: HexTileType; onClick?: () => void }) {
  const pipCount = getPipCount(hex.number);
  const isHighProbability = hex.number === 6 || hex.number === 8;

  return (
    <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <image href={terrainMap[hex.terrain]} x={-10} y={-10} width={20} height={20} />

      {hex.number && (
        <g>
          <circle cx={0} cy={0} r={4.2} fill="#fdfbf5" stroke="#2f2f2f" strokeWidth={0.35} />
          <text
            x={0}
            y={1.1}
            textAnchor="middle"
            fontSize={3.2}
            fontWeight={700}
            fill={isHighProbability ? '#c62828' : '#2f2f2f'}
          >
            {hex.number}
          </text>
          {pipCount > 0 && (
            <g transform="translate(0 2.8)">
              {Array.from({ length: pipCount }).map((_, index) => (
                <circle
                  key={index}
                  cx={(index - (pipCount - 1) / 2) * 1.2}
                  cy={0}
                  r={0.35}
                  fill={isHighProbability ? '#c62828' : '#2f2f2f'}
                />
              ))}
            </g>
          )}
        </g>
      )}

      {hex.hasRobber && (
        <text
          x={0}
          y={-3.6}
          textAnchor="middle"
          fontSize={3.2}
          fontWeight={700}
        >
          ⛔
        </text>
      )}
    </g>
  );
}
