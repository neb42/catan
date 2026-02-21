import { motion } from 'motion/react';
import type { Edge } from '@catan/shared';

interface EdgeMarkerProps {
  edge: Edge;
  isValid: boolean;
  isSelected: boolean;
  playerColor: string;
  invalidReason?: string;
  onClick: (e: React.MouseEvent) => void;
}

export function EdgeMarker({
  edge,
  isValid,
  isSelected,
  playerColor,
  invalidReason,
  onClick,
}: EdgeMarkerProps) {
  // Roads should go from corner to corner (full edge length)
  let start = edge.start;
  let end = edge.end; // Full edge: corner to corner
  let midpoint = edge.midpoint;

  // For boundary edges (only 1 adjacent hex), offset the road preview outward
  const size = { x: 10, y: 10 };
  const isBoundaryEdge = edge.adjacentHexes.length === 1;

  if (isBoundaryEdge) {
    // Calculate offset direction (perpendicular to edge, away from hex center)
    const hexId = edge.adjacentHexes[0];
    const [qStr, rStr] = hexId.split(',');
    const hexQ = parseInt(qStr, 10);
    const hexR = parseInt(rStr, 10);

    // Get hex center in pixel coordinates
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
    const toEdgeX = midpoint.x - hexCenterX;
    const toEdgeY = midpoint.y - hexCenterY;

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

    // Recalculate midpoint with offset applied
    midpoint = {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
    };
  }

  // Calculate angle for road orientation
  const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);

  return (
    <g>
      {/* Large transparent hitbox along the edge */}
      {!isValid && invalidReason && (
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke="transparent"
          strokeWidth={2}
        >
          <title>{invalidReason}</title>
        </line>
      )}

      {/* Visual indicator for valid edge */}
      {isValid && (
        <motion.circle
          cx={midpoint.x}
          cy={midpoint.y}
          r={1.5}
          fill={playerColor}
          stroke="white"
          strokeWidth={0.2}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: isSelected ? 1.3 : 0.8,
            opacity: isSelected ? 1 : 0.6,
          }}
          whileHover={{ scale: 1.2, opacity: 0.85 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{
            filter: `drop-shadow(0 0 ${isSelected ? 3 : 1.5}px ${playerColor})`,
            cursor: 'pointer',
          }}
          onClick={onClick}
        />
      )}

      {/* Selection preview - road segment */}
      {isSelected && (
        <motion.line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke={playerColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.85 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 2px ${playerColor})`,
          }}
        />
      )}
    </g>
  );
}
