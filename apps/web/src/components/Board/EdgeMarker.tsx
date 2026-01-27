import { motion } from 'motion/react';
import type { Edge } from '@catan/shared';

interface EdgeMarkerProps {
  edge: Edge;
  isValid: boolean;
  isSelected: boolean;
  playerColor: string;
  invalidReason?: string;
  onClick: () => void;
}

export function EdgeMarker({
  edge,
  isValid,
  isSelected,
  playerColor,
  invalidReason,
  onClick,
}: EdgeMarkerProps) {
  const { start, end, midpoint } = edge;

  // Calculate angle for road orientation
  const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);

  return (
    <g>
      {/* Large transparent hitbox along the edge */}
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="transparent"
        strokeWidth={isValid ? 4 : 2}
        style={{ cursor: isValid ? 'pointer' : 'default' }}
        onClick={isValid ? onClick : undefined}
      >
        {!isValid && invalidReason && <title>{invalidReason}</title>}
      </line>

      {/* Visual indicator for valid edge */}
      {isValid && (
        <motion.circle
          cx={midpoint.x}
          cy={midpoint.y}
          r={1}
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
          }}
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
