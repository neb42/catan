import { useMemo } from 'react';
import { getUniqueVertices, getUniqueEdges, Vertex, Edge } from '@catan/shared';
import { useGameStore, useSettlements, useRoads } from '../stores/gameStore';

function getAdjacentVertexIds(
  vertex: Vertex,
  allVertices: Vertex[],
  edges: Edge[],
): string[] {
  // Two vertices are adjacent if they share an edge
  return edges
    .filter((edge) => {
      const startMatch =
        Math.abs(edge.start.x - vertex.x) < 0.5 &&
        Math.abs(edge.start.y - vertex.y) < 0.5;
      const endMatch =
        Math.abs(edge.end.x - vertex.x) < 0.5 &&
        Math.abs(edge.end.y - vertex.y) < 0.5;
      return startMatch || endMatch;
    })
    .map((edge) => {
      // Return the other endpoint
      const startMatch =
        Math.abs(edge.start.x - vertex.x) < 0.5 &&
        Math.abs(edge.start.y - vertex.y) < 0.5;
      if (startMatch) {
        const roundedX = Math.round(edge.end.x * 10) / 10;
        const roundedY = Math.round(edge.end.y * 10) / 10;
        return `${roundedX},${roundedY}`;
      } else {
        const roundedX = Math.round(edge.start.x * 10) / 10;
        const roundedY = Math.round(edge.start.y * 10) / 10;
        return `${roundedX},${roundedY}`;
      }
    });
}

export function useValidSettlementLocations(): Array<{
  vertex: Vertex;
  isValid: boolean;
  invalidReason?: string;
}> {
  const board = useGameStore((state) => state.board);
  const settlements = useSettlements();

  return useMemo(() => {
    if (!board) return [];

    const vertices = getUniqueVertices(board.hexes);
    const edges = getUniqueEdges(board.hexes);
    const occupiedIds = new Set(settlements.map((s) => s.vertexId));

    return vertices.map((vertex) => {
      // Check if occupied
      if (occupiedIds.has(vertex.id)) {
        return { vertex, isValid: false, invalidReason: 'Already occupied' };
      }

      // Check distance rule - no adjacent settlements
      const adjacentIds = getAdjacentVertexIds(vertex, vertices, edges);
      const hasAdjacentSettlement = adjacentIds.some((id) =>
        occupiedIds.has(id),
      );

      if (hasAdjacentSettlement) {
        return {
          vertex,
          isValid: false,
          invalidReason: 'Too close to existing settlement',
        };
      }

      return { vertex, isValid: true };
    });
  }, [board, settlements]);
}

export function useValidRoadLocations(): Array<{
  edge: Edge;
  isValid: boolean;
  invalidReason?: string;
}> {
  const board = useGameStore((state) => state.board);
  const roads = useRoads();
  const lastPlacedSettlementId = useGameStore(
    (state) => state.lastPlacedSettlementId,
  );

  return useMemo(() => {
    if (!board || !lastPlacedSettlementId) return [];

    const vertices = getUniqueVertices(board.hexes);
    const edges = getUniqueEdges(board.hexes);
    const occupiedEdgeIds = new Set(roads.map((r) => r.edgeId));

    // Find the settlement vertex
    const settlementVertex = vertices.find(
      (v) => v.id === lastPlacedSettlementId,
    );
    if (!settlementVertex) return [];

    return edges.map((edge) => {
      // Check if occupied
      if (occupiedEdgeIds.has(edge.id)) {
        return { edge, isValid: false, invalidReason: 'Already occupied' };
      }

      // Check if connects to settlement
      const startConnects =
        Math.abs(edge.start.x - settlementVertex.x) < 0.5 &&
        Math.abs(edge.start.y - settlementVertex.y) < 0.5;
      const endConnects =
        Math.abs(edge.end.x - settlementVertex.x) < 0.5 &&
        Math.abs(edge.end.y - settlementVertex.y) < 0.5;

      if (!startConnects && !endConnects) {
        return {
          edge,
          isValid: false,
          invalidReason: 'Must connect to your settlement',
        };
      }

      return { edge, isValid: true };
    });
  }, [board, roads, lastPlacedSettlementId]);
}

export function useAllVertices(): Vertex[] {
  const board = useGameStore((state) => state.board);
  return useMemo(() => {
    if (!board) return [];
    return getUniqueVertices(board.hexes);
  }, [board]);
}

export function useAllEdges(): Edge[] {
  const board = useGameStore((state) => state.board);
  return useMemo(() => {
    if (!board) return [];
    return getUniqueEdges(board.hexes);
  }, [board]);
}
