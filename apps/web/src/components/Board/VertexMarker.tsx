import { motion } from 'motion/react';
import type { Vertex } from '@catan/shared';

interface VertexMarkerProps {
  vertex: Vertex;
  isValid: boolean;
  isSelected: boolean;
  playerColor: string;
  invalidReason?: string;
  onClick: () => void;
}

export function VertexMarker({
  vertex,
  isValid,
  isSelected,
  playerColor,
  invalidReason,
  onClick,
}: VertexMarkerProps) {
  // Don't render invalid markers (no visual clutter)
  // Tooltip for invalid handled separately if needed

  return (
    <g>
      {/* Visual dot for valid locations */}
      {isValid && (
        <motion.circle
          cx={vertex.x}
          cy={vertex.y}
          r={1.2}
          fill={playerColor}
          stroke="white"
          strokeWidth={0.3}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: isSelected ? 1.4 : 1,
            opacity: isSelected ? 1 : 0.7,
          }}
          whileHover={{ scale: 1.3, opacity: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{
            filter: `drop-shadow(0 0 ${isSelected ? 4 : 2}px ${playerColor})`,
            cursor: 'pointer',
          }}
          onClick={onClick}
        />
      )}

      {/* Selection preview - settlement shape */}
      {isSelected && (
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Simple house shape for settlement preview */}
          <motion.path
            d={`M ${vertex.x} ${vertex.y - 3}
                L ${vertex.x + 2} ${vertex.y - 1}
                L ${vertex.x + 2} ${vertex.y + 2}
                L ${vertex.x - 2} ${vertex.y + 2}
                L ${vertex.x - 2} ${vertex.y - 1} Z`}
            fill={playerColor}
            stroke="white"
            strokeWidth={0.4}
            animate={{
              y: [0, -0.5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.g>
      )}

      {/* Large transparent hitbox for easier clicking */}
      {!isValid && invalidReason && (
        <circle cx={vertex.x} cy={vertex.y} r={1.5} fill="transparent">
          <title>{invalidReason}</title>
        </circle>
      )}
    </g>
  );
}
