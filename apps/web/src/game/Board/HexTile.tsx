import { useMemo, useState } from 'react';

import type { HexTile as HexTileType } from '@catan/shared';

import { getEdgeCornerIndices, getHexCornerPositions } from './geometry';

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

const AXIAL_DIRECTIONS = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

const normalizeEdgeId = (edgeId: string): string => {
  const [a, b] = edgeId.split('-');
  if (!a || !b) return edgeId;
  const [first, second] = [a, b].sort();
  return `${first}-${second}`;
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

export function HexTile({
  hex,
  onClick,
  showVertices,
  showEdges,
  selectedVertex,
  selectedEdge,
  onSelectVertex,
  onSelectEdge,
  playerColor,
  occupiedVertices,
  occupiedEdges,
  boardHexKeys,
}: {
  hex: HexTileType;
  onClick?: () => void;
  showVertices?: boolean;
  showEdges?: boolean;
  selectedVertex?: string | null;
  selectedEdge?: string | null;
  onSelectVertex?: (vertexId: string) => void;
  onSelectEdge?: (edgeId: string) => void;
  playerColor?: string;
  occupiedVertices?: Set<string>;
  occupiedEdges?: Set<string>;
  boardHexKeys?: Set<string>;
}) {
  const pipCount = getPipCount(hex.number);
  const isHighProbability = hex.number === 6 || hex.number === 8;
  const [hoveredVertex, setHoveredVertex] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

  const cornerPositions = useMemo(
    () => getHexCornerPositions(hex.coord),
    [hex.coord.q, hex.coord.r],
  );
  const vertexIds = useMemo(
    () => cornerPositions.map((_, index) => `${hex.coord.q}:${hex.coord.r}:${index}`),
    [cornerPositions, hex.coord.q, hex.coord.r],
  );

  const edgeSegments = useMemo(() => {
    return cornerPositions.map((corner, index) => {
      const [startIndex, endIndex] = getEdgeCornerIndices(index);
      const direction = AXIAL_DIRECTIONS[index];
      const neighbor = {
        q: hex.coord.q + direction.q,
        r: hex.coord.r + direction.r,
      };
      const neighborKey = `${neighbor.q},${neighbor.r}`;
      const edgeId = `${hex.coord.q}:${hex.coord.r}-${neighbor.q}:${neighbor.r}`;
      const isValid = boardHexKeys ? boardHexKeys.has(neighborKey) : true;
      return {
        edgeId,
        start: cornerPositions[startIndex],
        end: cornerPositions[endIndex],
        isValid,
      };
    });
  }, [cornerPositions, hex.coord.q, hex.coord.r, boardHexKeys]);

  const highlightColor = playerColor ?? '#2f2f2f';

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

      {showVertices &&
        cornerPositions.map((corner, index) => {
          const vertexId = vertexIds[index];
          const isSelected = selectedVertex === vertexId;
          const isHovered = hoveredVertex === vertexId;
          const isOccupied = occupiedVertices?.has(vertexId);
          const isEnabled = !isOccupied && Boolean(onSelectVertex);

          return (
            <circle
              key={vertexId}
              cx={corner.x}
              cy={corner.y}
              r={1.1}
              fill={highlightColor}
              fillOpacity={isSelected ? 0.9 : isHovered ? 0.6 : isEnabled ? 0.25 : 0.1}
              stroke={highlightColor}
              strokeWidth={0.25}
              strokeOpacity={isEnabled ? 0.7 : 0.2}
              style={{ cursor: isEnabled ? 'pointer' : 'default' }}
              pointerEvents={isEnabled ? 'auto' : 'none'}
              onClick={(event) => {
                event.stopPropagation();
                if (!isEnabled || !onSelectVertex) return;
                onSelectVertex(vertexId);
              }}
              onMouseEnter={() => setHoveredVertex(vertexId)}
              onMouseLeave={() => setHoveredVertex(null)}
            />
          );
        })}

      {showEdges &&
        edgeSegments.map((segment) => {
          if (!segment.isValid) return null;
          const normalizedId = normalizeEdgeId(segment.edgeId);
          const isSelected = selectedEdge === normalizedId || selectedEdge === segment.edgeId;
          const isHovered = hoveredEdge === normalizedId || hoveredEdge === segment.edgeId;
          const isOccupied = occupiedEdges?.has(normalizedId);
          const isEnabled = !isOccupied && Boolean(onSelectEdge);

          return (
            <line
              key={segment.edgeId}
              x1={segment.start.x}
              y1={segment.start.y}
              x2={segment.end.x}
              y2={segment.end.y}
              stroke={highlightColor}
              strokeWidth={0.9}
              strokeLinecap="round"
              strokeOpacity={isSelected ? 0.9 : isHovered ? 0.6 : isEnabled ? 0.25 : 0.1}
              style={{ cursor: isEnabled ? 'pointer' : 'default' }}
              pointerEvents={isEnabled ? 'auto' : 'none'}
              onClick={(event) => {
                event.stopPropagation();
                if (!isEnabled || !onSelectEdge) return;
                onSelectEdge(segment.edgeId);
              }}
              onMouseEnter={() => setHoveredEdge(normalizeEdgeId(segment.edgeId))}
              onMouseLeave={() => setHoveredEdge(null)}
            />
          );
        })}
    </g>
  );
}
