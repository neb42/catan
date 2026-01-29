import { useMemo } from 'react';
import { getUniqueVertices, getUniqueEdges, MAX_PIECES } from '@catan/shared';
import type { BuildingType } from '@catan/shared';
import {
  useGameStore,
  useSettlements,
  useRoads,
  useBuildMode,
  useCanAfford,
} from '../stores/gameStore';

/**
 * Hook that returns valid vertex IDs for settlement placement during main game.
 * Rules: Must be connected to own road, 2-distance from any settlement, not occupied.
 */
export function useValidSettlementLocationsMainGame(): string[] {
  const board = useGameStore((state) => state.board);
  const myPlayerId = useGameStore((state) => state.myPlayerId);
  const settlements = useSettlements();
  const roads = useRoads();

  return useMemo(() => {
    if (!board || !myPlayerId) return [];

    const vertices = getUniqueVertices(board.hexes);
    const edges = getUniqueEdges(board.hexes);
    const occupiedVertexIds = new Set(settlements.map((s) => s.vertexId));

    // Get my roads
    const myRoadEdgeIds = new Set(
      roads.filter((r) => r.playerId === myPlayerId).map((r) => r.edgeId),
    );

    // Find vertices connected to my roads
    const verticesConnectedToMyRoads = new Set<string>();
    for (const edge of edges) {
      if (myRoadEdgeIds.has(edge.id)) {
        // Add both endpoints of my roads
        const startId = `${Math.round(edge.start.x * 10) / 10},${Math.round(edge.start.y * 10) / 10}`;
        const endId = `${Math.round(edge.end.x * 10) / 10},${Math.round(edge.end.y * 10) / 10}`;
        verticesConnectedToMyRoads.add(startId);
        verticesConnectedToMyRoads.add(endId);
      }
    }

    // Build adjacency map for distance rule
    const adjacentVertices = new Map<string, Set<string>>();
    for (const vertex of vertices) {
      adjacentVertices.set(vertex.id, new Set());
    }
    for (const edge of edges) {
      const startId = `${Math.round(edge.start.x * 10) / 10},${Math.round(edge.start.y * 10) / 10}`;
      const endId = `${Math.round(edge.end.x * 10) / 10},${Math.round(edge.end.y * 10) / 10}`;
      adjacentVertices.get(startId)?.add(endId);
      adjacentVertices.get(endId)?.add(startId);
    }

    const validIds: string[] = [];
    for (const vertex of vertices) {
      // Must not be occupied
      if (occupiedVertexIds.has(vertex.id)) continue;

      // Must be connected to my road
      if (!verticesConnectedToMyRoads.has(vertex.id)) continue;

      // Must be 2-distance from any settlement (check adjacent)
      const neighbors = adjacentVertices.get(vertex.id) || new Set();
      let tooClose = false;
      for (const neighborId of neighbors) {
        if (occupiedVertexIds.has(neighborId)) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;

      validIds.push(vertex.id);
    }

    return validIds;
  }, [board, myPlayerId, settlements, roads]);
}

/**
 * Hook that returns valid edge IDs for road placement during main game.
 * Rules: Must connect to own road or settlement, not occupied.
 */
export function useValidRoadLocationsMainGame(): string[] {
  const board = useGameStore((state) => state.board);
  const myPlayerId = useGameStore((state) => state.myPlayerId);
  const settlements = useSettlements();
  const roads = useRoads();

  return useMemo(() => {
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
}

/**
 * Hook that returns valid vertex IDs for city upgrade during main game.
 * Rules: Must be my settlement (not already a city).
 */
export function useValidCityLocations(): string[] {
  const myPlayerId = useGameStore((state) => state.myPlayerId);
  const settlements = useSettlements();

  return useMemo(() => {
    if (!myPlayerId) return [];

    return settlements
      .filter((s) => s.playerId === myPlayerId && !s.isCity)
      .map((s) => s.vertexId);
  }, [myPlayerId, settlements]);
}

/**
 * Hook that returns valid location IDs based on current build mode.
 */
export function useValidBuildLocations(): string[] {
  const buildMode = useBuildMode();
  const validSettlements = useValidSettlementLocationsMainGame();
  const validRoads = useValidRoadLocationsMainGame();
  const validCities = useValidCityLocations();

  return useMemo(() => {
    switch (buildMode) {
      case 'settlement':
        return validSettlements;
      case 'road':
        return validRoads;
      case 'city':
        return validCities;
      default:
        return [];
    }
  }, [buildMode, validSettlements, validRoads, validCities]);
}

/**
 * Hook to count player's placed pieces.
 */
export function usePieceCounts(): {
  roads: number;
  settlements: number;
  cities: number;
} {
  const myPlayerId = useGameStore((state) => state.myPlayerId);
  const settlements = useSettlements();
  const roads = useRoads();

  return useMemo(() => {
    if (!myPlayerId) return { roads: 0, settlements: 0, cities: 0 };

    const mySettlements = settlements.filter((s) => s.playerId === myPlayerId);
    const myRoads = roads.filter((r) => r.playerId === myPlayerId);

    return {
      roads: myRoads.length,
      settlements: mySettlements.filter((s) => !s.isCity).length,
      cities: mySettlements.filter((s) => s.isCity).length,
    };
  }, [myPlayerId, settlements, roads]);
}

/**
 * Hook to calculate remaining pieces.
 */
export function useRemainingPieces(): {
  roads: number;
  settlements: number;
  cities: number;
} {
  const counts = usePieceCounts();

  return useMemo(
    () => ({
      roads: MAX_PIECES.roads - counts.roads,
      settlements: MAX_PIECES.settlements - counts.settlements,
      cities: MAX_PIECES.cities - counts.cities,
    }),
    [counts],
  );
}

/**
 * Combined hook for checking if player can build a specific type.
 * Returns whether buildable and reason if not.
 */
export function useCanBuild(buildingType: BuildingType): {
  canBuild: boolean;
  disabledReason: string | null;
} {
  const canAfford = useCanAfford(buildingType);
  const remaining = useRemainingPieces();
  const validSettlements = useValidSettlementLocationsMainGame();
  const validRoads = useValidRoadLocationsMainGame();
  const validCities = useValidCityLocations();
  const turnPhase = useGameStore((state) => state.turnPhase);
  const turnCurrentPlayerId = useGameStore(
    (state) => state.turnCurrentPlayerId,
  );
  const myPlayerId = useGameStore((state) => state.myPlayerId);
  const isBuildPending = useGameStore((state) => state.isBuildPending);

  return useMemo(() => {
    // Check if it's our turn and main phase
    if (turnPhase !== 'main') {
      return { canBuild: false, disabledReason: 'Not in main phase' };
    }
    if (turnCurrentPlayerId !== myPlayerId) {
      return { canBuild: false, disabledReason: 'Not your turn' };
    }
    if (isBuildPending) {
      return { canBuild: false, disabledReason: 'Build in progress' };
    }

    // Check piece limits
    const pieceKey =
      buildingType === 'road'
        ? 'roads'
        : buildingType === 'settlement'
          ? 'settlements'
          : 'cities';
    if (remaining[pieceKey] <= 0) {
      return { canBuild: false, disabledReason: `No ${pieceKey} remaining` };
    }

    // Check affordability
    if (!canAfford) {
      return { canBuild: false, disabledReason: 'Not enough resources' };
    }

    // Check valid locations
    let validLocations: string[];
    switch (buildingType) {
      case 'settlement':
        validLocations = validSettlements;
        break;
      case 'road':
        validLocations = validRoads;
        break;
      case 'city':
        validLocations = validCities;
        break;
    }

    if (validLocations.length === 0) {
      return { canBuild: false, disabledReason: 'No valid locations' };
    }

    return { canBuild: true, disabledReason: null };
  }, [
    turnPhase,
    turnCurrentPlayerId,
    myPlayerId,
    isBuildPending,
    remaining,
    canAfford,
    buildingType,
    validSettlements,
    validRoads,
    validCities,
  ]);
}

// Re-export from gameStore for convenience
export { useBuildMode, useCanAfford } from '../stores/gameStore';
