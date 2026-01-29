import { AnimatePresence } from 'motion/react';
import { PLAYER_COLOR_HEX } from '@catan/shared';
import {
  useValidSettlementLocations,
  useValidRoadLocations,
  useAllVertices,
  useAllEdges,
} from '../../hooks/useValidLocations';
import { usePlacementState } from '../../hooks/usePlacementState';
import {
  useSelectedLocation,
  usePlacementActions,
  useGameStore,
  useSocket,
  useBuildMode,
} from '../../stores/gameStore';
import { useValidBuildLocations } from '../../hooks/useBuildMode';
import { VertexMarker } from './VertexMarker';
import { EdgeMarker } from './EdgeMarker';

interface PlacementOverlayProps {
  currentPlayerColor: string; // e.g., 'red', 'blue'
}

export function PlacementOverlay({
  currentPlayerColor,
}: PlacementOverlayProps) {
  const { phase: placementPhase, canPlace } = usePlacementState();
  const selectedLocationId = useSelectedLocation();
  const { setSelected } = usePlacementActions();

  // Placement phase (setup) hooks
  const validSettlements = useValidSettlementLocations();
  const validRoads = useValidRoadLocations();

  // Build mode (main game) hooks
  const buildMode = useBuildMode();
  const validBuildLocationIds = useValidBuildLocations();
  const sendMessage = useSocket();
  const setBuildMode = useGameStore((state) => state.setBuildMode);

  // Get all vertices/edges for build mode rendering
  const allVertices = useAllVertices();
  const allEdges = useAllEdges();

  const colorHex = PLAYER_COLOR_HEX[currentPlayerColor] || currentPlayerColor;

  // Handle build mode click (main game phase)
  const handleBuildClick = (locationId: string) => {
    if (!sendMessage || !buildMode) return;

    if (buildMode === 'road') {
      sendMessage({ type: 'build_road', edgeId: locationId });
    } else if (buildMode === 'settlement') {
      sendMessage({ type: 'build_settlement', vertexId: locationId });
    } else if (buildMode === 'city') {
      sendMessage({ type: 'build_city', vertexId: locationId });
    }

    // Exit build mode after sending (single placement per CONTEXT.md)
    setBuildMode(null);
  };

  // BUILD MODE (main game phase) - takes precedence if active
  if (buildMode) {
    const validLocationSet = new Set(validBuildLocationIds);

    return (
      <g className="placement-overlay build-mode">
        <AnimatePresence>
          {(buildMode === 'settlement' || buildMode === 'city') && (
            <>
              {allVertices
                .filter((v) => validLocationSet.has(v.id))
                .map((vertex) => (
                  <VertexMarker
                    key={vertex.id}
                    vertex={vertex}
                    isValid={true}
                    isSelected={false}
                    playerColor={colorHex}
                    onClick={() => handleBuildClick(vertex.id)}
                  />
                ))}
            </>
          )}

          {buildMode === 'road' && (
            <>
              {allEdges
                .filter((e) => validLocationSet.has(e.id))
                .map((edge) => (
                  <EdgeMarker
                    key={edge.id}
                    edge={edge}
                    isValid={true}
                    isSelected={false}
                    playerColor={colorHex}
                    onClick={() => handleBuildClick(edge.id)}
                  />
                ))}
            </>
          )}
        </AnimatePresence>
      </g>
    );
  }

  // PLACEMENT PHASE (setup) - Only show placement UI for the active player
  if (!canPlace) return null;

  return (
    <g className="placement-overlay setup-phase">
      <AnimatePresence>
        {placementPhase === 'settlement' && (
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

        {placementPhase === 'road' && (
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
