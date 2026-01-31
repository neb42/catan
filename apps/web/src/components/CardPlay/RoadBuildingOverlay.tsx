import { useMemo } from 'react';
import { Box, Text } from '@mantine/core';
import { AnimatePresence } from 'motion/react';
import { getUniqueEdges, PLAYER_COLOR_HEX } from '@catan/shared';
import {
  useGameStore,
  useSocket,
  useSettlements,
  useRoads,
} from '../../stores/gameStore';
import { EdgeMarker } from '../Board/EdgeMarker';

/**
 * RoadBuildingOverlay displays the Road Building card effect UI.
 * Shows a banner with progress (X/2 roads placed) and valid edge markers.
 */
export function RoadBuildingOverlay() {
  const devCardPlayPhase = useGameStore((s) => s.devCardPlayPhase);
  const roadsPlacedThisCard = useGameStore((s) => s.roadsPlacedThisCard);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const board = useGameStore((s) => s.board);
  const room = useGameStore((s) => s.room);
  const sendMessage = useSocket();
  const settlements = useSettlements();
  const roads = useRoads();

  // Calculate valid road locations (same logic as useValidRoadLocationsMainGame)
  const validRoadIds = useMemo(() => {
    if (!board || !myPlayerId) return [];

    const edges = getUniqueEdges(board.hexes);
    const occupiedEdgeIds = new Set(roads.map((r) => r.edgeId));

    // Get my settlements
    const mySettlementVertexIds = new Set(
      settlements
        .filter((s) => s.playerId === myPlayerId)
        .map((s) => s.vertexId),
    );

    // Get vertices connected to my roads
    const myRoadEdgeIds = new Set(
      roads.filter((r) => r.playerId === myPlayerId).map((r) => r.edgeId),
    );

    const verticesConnectedToMyRoads = new Set<string>();
    for (const edge of edges) {
      if (myRoadEdgeIds.has(edge.id)) {
        const startId = `${Math.round(edge.start.x * 10) / 10},${Math.round(edge.start.y * 10) / 10}`;
        const endId = `${Math.round(edge.end.x * 10) / 10},${Math.round(edge.end.y * 10) / 10}`;
        verticesConnectedToMyRoads.add(startId);
        verticesConnectedToMyRoads.add(endId);
      }
    }

    // Combine: vertices connected to my network (settlements + roads)
    const myNetworkVertices = new Set([
      ...mySettlementVertexIds,
      ...verticesConnectedToMyRoads,
    ]);

    const validIds: string[] = [];
    for (const edge of edges) {
      // Must not be occupied
      if (occupiedEdgeIds.has(edge.id)) continue;

      // At least one endpoint must be in my network
      const startId = `${Math.round(edge.start.x * 10) / 10},${Math.round(edge.start.y * 10) / 10}`;
      const endId = `${Math.round(edge.end.x * 10) / 10},${Math.round(edge.end.y * 10) / 10}`;

      if (!myNetworkVertices.has(startId) && !myNetworkVertices.has(endId)) {
        continue;
      }

      validIds.push(edge.id);
    }

    return validIds;
  }, [board, myPlayerId, settlements, roads]);

  // Get edge objects for valid locations
  const validEdges = useMemo(() => {
    if (!board) return [];
    const edges = getUniqueEdges(board.hexes);
    const validSet = new Set(validRoadIds);
    return edges.filter((e) => validSet.has(e.id));
  }, [board, validRoadIds]);

  // Don't render if not in road building mode
  if (devCardPlayPhase !== 'road_building') {
    return null;
  }

  // Calculate progress
  const roadsRemaining = 2 - roadsPlacedThisCard;

  // Get current player color
  const myPlayer = room?.players.find((p) => p.id === myPlayerId);
  const myColor = myPlayer?.color || 'gray';
  const colorHex = PLAYER_COLOR_HEX[myColor] || myColor;

  const handleEdgeClick = (edgeId: string) => {
    if (!sendMessage) return;
    sendMessage({
      type: 'road_building_place',
      edgeId,
    });
  };

  return (
    <>
      {/* Banner showing progress */}
      <Box
        style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.85)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Text size="lg" fw={600} ta="center">
          🛤️ Road Building: Place {roadsRemaining} more road
          {roadsRemaining !== 1 ? 's' : ''}
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          Click on a valid location to place a free road
        </Text>
      </Box>
    </>
  );
}

/**
 * RoadBuildingEdgeOverlay is an SVG component that renders
 * edge markers for Road Building. This should be rendered inside
 * the Board SVG.
 */
export function RoadBuildingEdgeOverlay() {
  const devCardPlayPhase = useGameStore((s) => s.devCardPlayPhase);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const board = useGameStore((s) => s.board);
  const room = useGameStore((s) => s.room);
  const sendMessage = useSocket();
  const settlements = useSettlements();
  const roads = useRoads();

  // Calculate valid road locations
  const validEdges = useMemo(() => {
    if (!board || !myPlayerId) return [];

    const edges = getUniqueEdges(board.hexes);
    const occupiedEdgeIds = new Set(roads.map((r) => r.edgeId));

    // Get my settlements
    const mySettlementVertexIds = new Set(
      settlements
        .filter((s) => s.playerId === myPlayerId)
        .map((s) => s.vertexId),
    );

    // Get vertices connected to my roads
    const myRoadEdgeIds = new Set(
      roads.filter((r) => r.playerId === myPlayerId).map((r) => r.edgeId),
    );

    const verticesConnectedToMyRoads = new Set<string>();
    for (const edge of edges) {
      if (myRoadEdgeIds.has(edge.id)) {
        const startId = `${Math.round(edge.start.x * 10) / 10},${Math.round(edge.start.y * 10) / 10}`;
        const endId = `${Math.round(edge.end.x * 10) / 10},${Math.round(edge.end.y * 10) / 10}`;
        verticesConnectedToMyRoads.add(startId);
        verticesConnectedToMyRoads.add(endId);
      }
    }

    // Combine: vertices connected to my network
    const myNetworkVertices = new Set([
      ...mySettlementVertexIds,
      ...verticesConnectedToMyRoads,
    ]);

    return edges.filter((edge) => {
      // Must not be occupied
      if (occupiedEdgeIds.has(edge.id)) return false;

      // At least one endpoint must be in my network
      const startId = `${Math.round(edge.start.x * 10) / 10},${Math.round(edge.start.y * 10) / 10}`;
      const endId = `${Math.round(edge.end.x * 10) / 10},${Math.round(edge.end.y * 10) / 10}`;

      return myNetworkVertices.has(startId) || myNetworkVertices.has(endId);
    });
  }, [board, myPlayerId, settlements, roads]);

  // Don't render if not in road building mode
  if (devCardPlayPhase !== 'road_building') {
    return null;
  }

  // Get current player color
  const myPlayer = room?.players.find((p) => p.id === myPlayerId);
  const myColor = myPlayer?.color || 'gray';
  const colorHex = PLAYER_COLOR_HEX[myColor] || myColor;

  const handleEdgeClick = (edgeId: string) => {
    if (!sendMessage) return;
    sendMessage({
      type: 'road_building_place',
      edgeId,
    });
  };

  return (
    <g className="road-building-overlay">
      <AnimatePresence>
        {validEdges.map((edge) => (
          <EdgeMarker
            key={edge.id}
            edge={edge}
            isValid={true}
            isSelected={false}
            playerColor={colorHex}
            onClick={() => handleEdgeClick(edge.id)}
          />
        ))}
      </AnimatePresence>
    </g>
  );
}
