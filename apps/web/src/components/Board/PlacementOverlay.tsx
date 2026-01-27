import { AnimatePresence } from 'motion/react';
import {
  useValidSettlementLocations,
  useValidRoadLocations,
} from '../../hooks/useValidLocations';
import { usePlacementState } from '../../hooks/usePlacementState';
import {
  useSelectedLocation,
  usePlacementActions,
} from '../../stores/gameStore';
import { VertexMarker } from './VertexMarker';
import { EdgeMarker } from './EdgeMarker';

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

interface PlacementOverlayProps {
  currentPlayerColor: string; // e.g., 'red', 'blue'
}

export function PlacementOverlay({
  currentPlayerColor,
}: PlacementOverlayProps) {
  const { phase, canPlace } = usePlacementState();
  const selectedLocationId = useSelectedLocation();
  const { setSelected } = usePlacementActions();

  const validSettlements = useValidSettlementLocations();
  const validRoads = useValidRoadLocations();

  const colorHex = PLAYER_COLOR_HEX[currentPlayerColor] || currentPlayerColor;

  // Only show placement UI for the active player
  if (!canPlace) return null;

  return (
    <g className="placement-overlay">
      <AnimatePresence>
        {phase === 'settlement' && (
          <>
            {validSettlements.map(({ vertex, isValid, invalidReason }) => (
              <VertexMarker
                key={vertex.id}
                vertex={vertex}
                isValid={isValid}
                isSelected={selectedLocationId === vertex.id}
                playerColor={colorHex}
                invalidReason={invalidReason}
                onClick={() => setSelected(vertex.id)}
              />
            ))}
          </>
        )}

        {phase === 'road' && (
          <>
            {validRoads.map(({ edge, isValid, invalidReason }) => (
              <EdgeMarker
                key={edge.id}
                edge={edge}
                isValid={isValid}
                isSelected={selectedLocationId === edge.id}
                playerColor={colorHex}
                invalidReason={invalidReason}
                onClick={() => setSelected(edge.id)}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </g>
  );
}
