import type { Port as SharedPort } from '@catan/shared';

import { axialToPixel, getEdgeCornerIndices, getHexCornerPositions } from './geometry';

type PortProps = {
  position: SharedPort['position'];
  type: SharedPort['type'];
};

type ResourceType = 'wood' | 'brick' | 'sheep' | 'wheat' | 'ore';

const RESOURCE_COLORS: Record<ResourceType, string> = {
  wood: '#3a7f3a',
  brick: '#c0392b',
  sheep: '#7bc96f',
  wheat: '#f2c94c',
  ore: '#7f8c8d',
};

const parsePortPosition = (
  position: string
): { coord: { q: number; r: number }; edgeIndex: number } | null => {
  const [coordPart, edgePart] = position.split(':');
  if (!coordPart || edgePart === undefined) return null;
  const [qStr, rStr] = coordPart.split(',');
  const q = Number(qStr);
  const r = Number(rStr);
  const edgeIndex = Number(edgePart);
  if ([q, r, edgeIndex].some((value) => Number.isNaN(value))) return null;
  return { coord: { q, r }, edgeIndex };
};

const parsePortType = (type: SharedPort['type']): {
  ratio: '3:1' | '2:1';
  resource: ResourceType | null;
} => {
  if (type === '3:1') {
    return { ratio: '3:1', resource: null };
  }

  const resource = type.replace('2:1-', '') as ResourceType;
  return { ratio: '2:1', resource };
};

export function Port({ position, type }: PortProps) {
  const parsed = parsePortPosition(position);
  if (!parsed) return null;

  const { coord, edgeIndex } = parsed;
  const { ratio, resource } = parsePortType(type);
  const corners = getHexCornerPositions(coord);
  const [startIndex, endIndex] = getEdgeCornerIndices(edgeIndex);
  const start = corners[startIndex];
  const end = corners[endIndex];
  const center = axialToPixel(coord);
  const edgeCenter = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };
  const vector = {
    x: edgeCenter.x - center.x,
    y: edgeCenter.y - center.y,
  };
  const length = Math.hypot(vector.x, vector.y) || 1;
  const offset = 2.1;
  const portPosition = {
    x: edgeCenter.x + (vector.x / length) * offset,
    y: edgeCenter.y + (vector.y / length) * offset,
  };

  const size = 3.6;
  const fillColor = resource ? RESOURCE_COLORS[resource] : '#f4f4f4';
  const labelColor = resource ? '#0b0b0b' : '#1f1f1f';

  return (
    <g transform={`translate(${portPosition.x} ${portPosition.y})`}>
      <rect
        x={-size / 2}
        y={-size / 2}
        width={size}
        height={size}
        rx={0.6}
        fill={fillColor}
        stroke="#1f1f1f"
        strokeWidth={0.2}
      />
      <text
        x={0}
        y={resource ? -0.1 : 0.45}
        textAnchor="middle"
        fontSize={1.2}
        fontWeight={600}
        fill={labelColor}
        dominantBaseline="middle"
      >
        {ratio}
      </text>
      {resource && (
        <text
          x={0}
          y={1.25}
          textAnchor="middle"
          fontSize={1.05}
          fontWeight={700}
          fill={labelColor}
          dominantBaseline="middle"
        >
          {resource.toUpperCase()}
        </text>
      )}
    </g>
  );
}