import { Road, Settlement } from '../schemas/game';

/**
 * Gets the other endpoint of an edge given one vertex.
 * Edge ID format: "vertexA|vertexB" (sorted)
 */
function getOtherEndpoint(edgeId: string, fromVertex: string): string {
  const [v1, v2] = edgeId.split('|');
  return v1 === fromVertex ? v2 : v1;
}

/**
 * Gets all roads connected to a vertex that belong to a specific player.
 */
function getPlayerRoadsAtVertex(vertexId: string, playerRoads: Road[]): Road[] {
  return playerRoads.filter((road) => {
    const [v1, v2] = road.edgeId.split('|');
    return v1 === vertexId || v2 === vertexId;
  });
}

/**
 * DFS with edge-based backtracking to find longest path.
 *
 * Key insight: Track visited EDGES, not nodes. Nodes can be revisited
 * (for loops), but edges cannot be reused.
 *
 * @param currentVertex Current position in traversal
 * @param visitedEdges Set of edge IDs already used in this path
 * @param playerRoads All roads belonging to the player
 * @param blockedVertices Vertices where opponent settlements block traversal
 * @returns Length of longest path from current position
 */
function dfs(
  currentVertex: string,
  visitedEdges: Set<string>,
  playerRoads: Road[],
  blockedVertices: Set<string>,
): number {
  let maxLength = 0;
  const roadsHere = getPlayerRoadsAtVertex(currentVertex, playerRoads);

  for (const road of roadsHere) {
    // Skip if edge already visited in this path
    if (visitedEdges.has(road.edgeId)) continue;

    const nextVertex = getOtherEndpoint(road.edgeId, currentVertex);

    // Skip if blocked by opponent settlement
    if (blockedVertices.has(nextVertex)) continue;

    // Mark edge as visited
    visitedEdges.add(road.edgeId);

    // Recurse and track max length
    const length =
      1 + dfs(nextVertex, visitedEdges, playerRoads, blockedVertices);
    maxLength = Math.max(maxLength, length);

    // Backtrack - unmark edge
    visitedEdges.delete(road.edgeId);
  }

  return maxLength;
}

/**
 * Calculates the longest continuous road for a player.
 *
 * Key behaviors:
 * - Track visited EDGES not nodes (edges cannot be reused, nodes can be revisited)
 * - DFS from every vertex in player's road network, take maximum
 * - Opponent settlements block traversal at that vertex
 * - Own settlements do NOT block (per official Catan rules)
 *
 * @param roads All roads in the game
 * @param settlements All settlements in the game
 * @param playerId The player to calculate longest road for
 * @returns The length of the longest continuous road
 */
export function calculatePlayerLongestRoad(
  roads: Road[],
  settlements: Settlement[],
  playerId: string,
): number {
  // Filter to player's roads
  const playerRoads = roads.filter((r) => r.playerId === playerId);
  if (playerRoads.length === 0) return 0;

  // Opponent settlements block traversal (own settlements do NOT)
  const blockedVertices = new Set(
    settlements.filter((s) => s.playerId !== playerId).map((s) => s.vertexId),
  );

  // Get all unique vertices in player's road network
  const vertices = new Set<string>();
  for (const road of playerRoads) {
    const [v1, v2] = road.edgeId.split('|');
    vertices.add(v1);
    vertices.add(v2);
  }

  // Try DFS from each vertex, take maximum
  let longest = 0;
  for (const startVertex of vertices) {
    // Skip starting from blocked vertices
    if (blockedVertices.has(startVertex)) continue;

    const length = dfs(startVertex, new Set(), playerRoads, blockedVertices);
    longest = Math.max(longest, length);
  }

  return longest;
}
