import { GameState, Vertex, Edge } from '@catan/shared';
import {
  getAdjacentVertexIds,
  isEdgeConnectedToVertex,
} from './geometry-utils';

interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

/**
 * Gets all edges that connect to a specific vertex.
 */
export function getEdgesAtVertex(vertexId: string, edges: Edge[]): Edge[] {
  return edges.filter((edge) => {
    const [v1, v2] = edge.id.split('|');
    return v1 === vertexId || v2 === vertexId;
  });
}

/**
 * Validates if a settlement can be placed on the specified vertex.
 *
 * Rules:
 * 1. Vertex must exist in the valid vertices list
 * 2. Vertex must not be occupied by any existing settlement
 * 3. Distance rule: No existing settlement on any adjacent vertex
 *
 * @param vertexId The ID of the vertex to place on
 * @param gameState The current game state containing existing settlements
 * @param vertices List of all valid vertices on the board
 * @param edges List of all valid edges (needed for adjacency check)
 */
export function isValidSettlementPlacement(
  vertexId: string,
  gameState: GameState,
  vertices: Vertex[],
  edges: Edge[],
): boolean {
  return (
    getInvalidSettlementReason(vertexId, gameState, vertices, edges) === null
  );
}

/**
 * Returns the reason why a settlement placement is invalid, or null if valid.
 */
export function getInvalidSettlementReason(
  vertexId: string,
  gameState: GameState,
  vertices: Vertex[],
  edges: Edge[],
): string | null {
  // 1. Check vertex existence
  const vertex = vertices.find((v) => v.id === vertexId);
  if (!vertex) {
    return 'Invalid vertex';
  }

  // 2. Check occupancy
  const isOccupied = gameState.settlements.some((s) => s.vertexId === vertexId);
  if (isOccupied) {
    return 'Vertex already occupied';
  }

  // 3. Check distance rule (adjacency)
  const adjacentIds = getAdjacentVertexIds(vertexId, edges);
  const hasAdjacentSettlement = adjacentIds.some((adjId) =>
    gameState.settlements.some((s) => s.vertexId === adjId),
  );

  if (hasAdjacentSettlement) {
    return 'Too close to existing settlement';
  }

  return null;
}

/**
 * Validates if a road can be placed on the specified edge during setup phase.
 *
 * Rules:
 * 1. Edge must exist in valid edge list
 * 2. Edge must not be occupied
 * 3. Must connect to the settlement just placed in this turn
 *
 * @param edgeId The ID of the edge to place on
 * @param gameState The current game state
 * @param playerId The ID of the player placing the road
 * @param justPlacedSettlementId The ID of the settlement placed earlier this turn
 * @param edges List of all valid edges
 */
export function isValidRoadPlacement(
  edgeId: string,
  gameState: GameState,
  playerId: string,
  justPlacedSettlementId: string | null,
  edges: Edge[],
): boolean {
  return (
    getInvalidRoadReason(
      edgeId,
      gameState,
      playerId,
      justPlacedSettlementId,
      edges,
    ) === null
  );
}

/**
 * Returns the reason why a road placement is invalid, or null if valid.
 */
export function getInvalidRoadReason(
  edgeId: string,
  gameState: GameState,
  playerId: string,
  justPlacedSettlementId: string | null,
  edges: Edge[],
): string | null {
  // 1. Check edge existence
  const edge = edges.find((e) => e.id === edgeId);
  if (!edge) {
    return 'Invalid edge';
  }

  // 2. Check occupancy
  const isOccupied = gameState.roads.some((r) => r.edgeId === edgeId);
  if (isOccupied) {
    return 'Edge already occupied';
  }

  // 3. Check connection to just placed settlement
  if (!justPlacedSettlementId) {
    return 'Must place settlement first';
  }

  // 4. Check connectivity: Edge must connect to the settlement vertex
  if (!isEdgeConnectedToVertex(edgeId, justPlacedSettlementId)) {
    return 'Must connect to your settlement';
  }

  return null;
}

// ============================================================================
// MAIN-GAME VALIDATORS
// These validators are for the main gameplay phase (after setup).
// They have different rules than setup phase validators.
// ============================================================================

/**
 * Validates if a settlement can be placed during main game (after setup).
 *
 * Rules:
 * 1. Vertex must exist
 * 2. Vertex must not be occupied
 * 3. Distance rule: No settlement on adjacent vertex
 * 4. Must be adjacent to player's own road
 *
 * @param vertexId The vertex to place on
 * @param gameState Current game state
 * @param playerId The player attempting to build
 * @param vertices All valid vertices
 * @param edges All valid edges
 */
export function isValidMainGameSettlement(
  vertexId: string,
  gameState: GameState,
  playerId: string,
  vertices: Vertex[],
  edges: Edge[],
): boolean {
  return (
    getInvalidMainGameSettlementReason(
      vertexId,
      gameState,
      playerId,
      vertices,
      edges,
    ) === null
  );
}

/**
 * Returns the reason why a main-game settlement placement is invalid, or null if valid.
 */
export function getInvalidMainGameSettlementReason(
  vertexId: string,
  gameState: GameState,
  playerId: string,
  vertices: Vertex[],
  edges: Edge[],
): string | null {
  // 1. Check vertex existence
  const vertex = vertices.find((v) => v.id === vertexId);
  if (!vertex) {
    return 'Invalid vertex';
  }

  // 2. Check occupancy
  const isOccupied = gameState.settlements.some((s) => s.vertexId === vertexId);
  if (isOccupied) {
    return 'Vertex already occupied';
  }

  // 3. Check distance rule (adjacency)
  const adjacentIds = getAdjacentVertexIds(vertexId, edges);
  const hasAdjacentSettlement = adjacentIds.some((adjId) =>
    gameState.settlements.some((s) => s.vertexId === adjId),
  );

  if (hasAdjacentSettlement) {
    return 'Too close to existing settlement';
  }

  // 4. Check connectivity to player's own road
  const edgesAtVertex = getEdgesAtVertex(vertexId, edges);
  const hasOwnAdjacentRoad = edgesAtVertex.some((edge) =>
    gameState.roads.some(
      (road) => road.edgeId === edge.id && road.playerId === playerId,
    ),
  );

  if (!hasOwnAdjacentRoad) {
    return 'Must be adjacent to your road';
  }

  return null;
}

/**
 * Validates if a road can be placed during main game (after setup).
 *
 * Rules:
 * 1. Edge must exist
 * 2. Edge must not be occupied
 * 3. Must connect to player's own road OR player's own settlement/city
 *
 * @param edgeId The edge to place on
 * @param gameState Current game state
 * @param playerId The player attempting to build
 * @param edges All valid edges
 */
export function isValidMainGameRoad(
  edgeId: string,
  gameState: GameState,
  playerId: string,
  edges: Edge[],
): boolean {
  return (
    getInvalidMainGameRoadReason(edgeId, gameState, playerId, edges) === null
  );
}

/**
 * Returns the reason why a main-game road placement is invalid, or null if valid.
 */
export function getInvalidMainGameRoadReason(
  edgeId: string,
  gameState: GameState,
  playerId: string,
  edges: Edge[],
): string | null {
  // 1. Check edge existence
  const edge = edges.find((e) => e.id === edgeId);
  if (!edge) {
    return 'Invalid edge';
  }

  // 2. Check occupancy
  const isOccupied = gameState.roads.some((r) => r.edgeId === edgeId);
  if (isOccupied) {
    return 'Edge already occupied';
  }

  // 3. Check connectivity to player's network
  // Get the two vertices at the ends of this edge
  const [vertex1, vertex2] = edgeId.split('|');

  // Check if either vertex has the player's settlement or city
  const hasOwnSettlementAtVertex = gameState.settlements.some(
    (s) =>
      s.playerId === playerId &&
      (s.vertexId === vertex1 || s.vertexId === vertex2),
  );

  if (hasOwnSettlementAtVertex) {
    return null; // Valid - connects to own settlement
  }

  // Check if either vertex has the player's road
  // A road connects to this edge if they share a vertex
  const hasOwnRoadAtVertex = gameState.roads.some((road) => {
    if (road.playerId !== playerId) return false;
    const [roadV1, roadV2] = road.edgeId.split('|');
    return (
      roadV1 === vertex1 ||
      roadV1 === vertex2 ||
      roadV2 === vertex1 ||
      roadV2 === vertex2
    );
  });

  if (hasOwnRoadAtVertex) {
    return null; // Valid - connects to own road
  }

  return 'Must connect to your road or settlement';
}

/**
 * Validates if a city can be placed (upgrading an existing settlement).
 *
 * Rules:
 * 1. Vertex must have a settlement belonging to the player
 * 2. Settlement must not already be a city
 *
 * @param vertexId The vertex with the settlement to upgrade
 * @param gameState Current game state
 * @param playerId The player attempting to build
 */
export function isValidCityUpgrade(
  vertexId: string,
  gameState: GameState,
  playerId: string,
): boolean {
  return getInvalidCityUpgradeReason(vertexId, gameState, playerId) === null;
}

/**
 * Returns the reason why a city upgrade is invalid, or null if valid.
 */
export function getInvalidCityUpgradeReason(
  vertexId: string,
  gameState: GameState,
  playerId: string,
): string | null {
  // Find the settlement at this vertex
  const settlement = gameState.settlements.find((s) => s.vertexId === vertexId);

  if (!settlement) {
    return 'No settlement at this location';
  }

  if (settlement.playerId !== playerId) {
    return 'Not your settlement';
  }

  if (settlement.isCity) {
    return 'Already a city';
  }

  return null;
}
