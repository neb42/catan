import { Vertex, Edge } from '@catan/shared';

/**
 * Gets IDs of vertices adjacent to the given vertex.
 * Vertices are adjacent if they share an edge.
 */
export function getAdjacentVertexIds(
  vertexId: string,
  edges: Edge[],
): string[] {
  const adjacentIds = new Set<string>();

  edges.forEach((edge) => {
    // Edge ID format is "vertexId1|vertexId2" (sorted)
    const [v1, v2] = edge.id.split('|');

    if (v1 === vertexId) {
      adjacentIds.add(v2);
    } else if (v2 === vertexId) {
      adjacentIds.add(v1);
    }
  });

  return Array.from(adjacentIds);
}

/**
 * Checks if an edge connects to a specific vertex.
 *
 * @param edgeId The edge ID in format "vertexId1|vertexId2"
 * @param vertexId The vertex ID to check connection to
 */
export function isEdgeConnectedToVertex(
  edgeId: string,
  vertexId: string,
): boolean {
  const [v1, v2] = edgeId.split('|');
  return v1 === vertexId || v2 === vertexId;
}
