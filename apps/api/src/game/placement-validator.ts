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
