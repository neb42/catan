import { AnimatePresence } from 'motion/react';
import { PLAYER_COLOR_HEX } from '@catan/shared';
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
