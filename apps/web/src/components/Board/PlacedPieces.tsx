import { motion } from 'motion/react';
import type { Road, Settlement, BoardState } from '@catan/shared';
import { getUniqueEdges, getUniqueVertices } from '@catan/shared';
import { useSettlements, useRoads } from '../../stores/gameStore';

// Player color map - matches PLAYER_COLORS from shared
const PLAYER_COLOR_HEX: Record<string, string> = {
  red: '#E53935',
  blue: '#1E88E5',
  white: '#F5F5F5',
  orange: '#FB8C00',
  green: '#43A047',
  yellow: '#FDD835',
  purple: '#8E24AA',
  brown: '#6D4C41',
};

interface PlacedPiecesProps {
  board: BoardState;
  playerIdToColor: Map<string, string>; // Map playerId to color name
}

export function PlacedPieces({ board, playerIdToColor }: PlacedPiecesProps) {
  const settlements = useSettlements();
  const roads = useRoads();

  // Generate edge and vertex maps from board
  const size = { x: 10, y: 10 };
  const edges = getUniqueEdges(board.hexes, size);
  const vertices = getUniqueVertices(board.hexes, size);

  const edgeMap = new Map(edges.map((e) => [e.id, e]));
  const vertexMap = new Map(vertices.map((v) => [v.id, v]));

  return (
    <g className="placed-pieces">
      {/* Render placed roads */}
      {roads.map((road) => {
        const edge = edgeMap.get(road.edgeId);
        if (!edge) return null;

        const colorName = playerIdToColor.get(road.playerId) || 'white';
        const colorHex = PLAYER_COLOR_HEX[colorName] || colorName;

        // Roads should go from corner to corner (full edge length)
        // For boundary edges (only 1 adjacent hex), offset the road outward
        const isBoundaryEdge = edge.adjacentHexes.length === 1;
        let start = edge.start;
        let end = edge.end; // Full edge: corner to corner

        if (isBoundaryEdge) {
          // Calculate offset direction (perpendicular to edge, away from hex center)
          const hexId = edge.adjacentHexes[0];
          const [qStr, rStr] = hexId.split(',');
          const hexQ = parseInt(qStr, 10);
          const hexR = parseInt(rStr, 10);

          // Get hex center in pixel coordinates (using same logic as hexToPixel)
          // For pointy-top: x = size.x * (√3 * q + √3/2 * r), y = size.y * (3/2 * r)
          const hexCenterX =
            size.x * (Math.sqrt(3) * hexQ + (Math.sqrt(3) / 2) * hexR);
          const hexCenterY = size.y * (3 / 2) * hexR;

          // Calculate edge direction vector
          const edgeVectorX = end.x - start.x;
          const edgeVectorY = end.y - start.y;

          // Calculate perpendicular vector (rotate 90 degrees)
          const perpX = -edgeVectorY;
          const perpY = edgeVectorX;

          // Normalize perpendicular vector
          const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
          const perpNormX = perpX / perpLength;
          const perpNormY = perpY / perpLength;

          // Calculate vector from hex center to edge midpoint
          const toEdgeX = edge.midpoint.x - hexCenterX;
          const toEdgeY = edge.midpoint.y - hexCenterY;

          // Determine which direction of perpendicular points away from hex center
          const dotProduct = perpNormX * toEdgeX + perpNormY * toEdgeY;
          const directionMultiplier = dotProduct > 0 ? 1 : -1;

          // Offset amount (in SVG units)
          const offsetAmount = 1.0;

          // Apply offset to start and end points
          start = {
            x: start.x + perpNormX * offsetAmount * directionMultiplier,
            y: start.y + perpNormY * offsetAmount * directionMultiplier,
          };
          end = {
            x: end.x + perpNormX * offsetAmount * directionMultiplier,
            y: end.y + perpNormY * offsetAmount * directionMultiplier,
          };
        }

        return (
          <motion.line
            key={road.edgeId}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke={colorHex}
            strokeWidth={1.5}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 2px ${colorHex})`,
            }}
          />
        );
      })}

      {/* Render placed settlements */}
      {settlements.map((settlement) => {
        const vertex = vertexMap.get(settlement.vertexId);
        if (!vertex) return null;

        const colorName = playerIdToColor.get(settlement.playerId) || 'white';
        const colorHex = PLAYER_COLOR_HEX[colorName] || colorName;

        return (
          <motion.g
            key={settlement.vertexId}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* House shape for settlement */}
            <path
              d={`M ${vertex.x} ${vertex.y - 3}
                  L ${vertex.x + 2} ${vertex.y - 1}
                  L ${vertex.x + 2} ${vertex.y + 2}
                  L ${vertex.x - 2} ${vertex.y + 2}
                  L ${vertex.x - 2} ${vertex.y - 1} Z`}
              fill={colorHex}
              stroke="white"
              strokeWidth={0.4}
              style={{
                filter: `drop-shadow(0 0 2px ${colorHex})`,
              }}
            />
          </motion.g>
        );
      })}
    </g>
  );
}
