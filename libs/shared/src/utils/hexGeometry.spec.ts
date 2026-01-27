import { describe, it, expect } from 'vitest';
import { getUniqueVertices, getUniqueEdges, Vertex } from './hexGeometry';
import { getCatanHexPositions } from './coordinates';

describe('hexGeometry', () => {
  // Standard Catan board has 19 hexes
  const hexes = getCatanHexPositions();
  const size = { x: 10, y: 10 };

  describe('getUniqueVertices', () => {
    it('should generate correct number of unique vertices for standard board', () => {
      const vertices = getUniqueVertices(hexes, size);

      // A standard 19-hex Catan board has exactly 54 unique intersections (vertices)
      expect(vertices.length).toBe(54);
    });

    it('should correctly track adjacent hexes for vertices', () => {
      const vertices = getUniqueVertices(hexes, size);

      // Vertices can be shared by 1, 2, or 3 hexes
      const adjacencyCounts = vertices.map((v) => v.adjacentHexes.length);

      expect(Math.min(...adjacencyCounts)).toBeGreaterThanOrEqual(1);
      expect(Math.max(...adjacencyCounts)).toBeLessThanOrEqual(3);

      // Specifically check a central vertex (shared by 3 hexes)
      // The center hex is at 0,0. Let's find vertices adjacent to 0,0
      const centerHexVertices = vertices.filter((v) =>
        v.adjacentHexes.includes('0,0'),
      );
      expect(centerHexVertices.length).toBe(6);

      // In a full grid, all vertices of the center hex should be shared by 3 hexes
      // (except possibly in smaller configurations, but for radius=2 standard board, this holds)
      centerHexVertices.forEach((v) => {
        expect(v.adjacentHexes.length).toBe(3);
      });
    });

    it('should have consistent coordinate precision', () => {
      const vertices = getUniqueVertices(hexes, size);

      vertices.forEach((v) => {
        const [xStr, yStr] = v.id.split(',');
        // Keys should match rounded coordinates
        expect(parseFloat(xStr)).toBeCloseTo(v.x, 1);
        expect(parseFloat(yStr)).toBeCloseTo(v.y, 1);
      });
    });
  });

  describe('getUniqueEdges', () => {
    it('should generate correct number of unique edges for standard board', () => {
      const edges = getUniqueEdges(hexes, size);

      // A standard 19-hex Catan board has exactly 72 edges
      expect(edges.length).toBe(72);
    });

    it('should correctly track adjacent hexes for edges', () => {
      const edges = getUniqueEdges(hexes, size);

      // Edges can be shared by 1 or 2 hexes (internal edges share 2, boundary edges share 1)
      const adjacencyCounts = edges.map((e) => e.adjacentHexes.length);

      expect(Math.min(...adjacencyCounts)).toBe(1);
      expect(Math.max(...adjacencyCounts)).toBe(2);

      // Count internal vs boundary edges
      const internalEdges = edges.filter((e) => e.adjacentHexes.length === 2);
      const boundaryEdges = edges.filter((e) => e.adjacentHexes.length === 1);

      // Total 72 edges.
      // 19 hexes * 6 edges = 114 total edges before deduplication
      // 72 unique edges.
      // Let I = internal edges, B = boundary edges
      // 2*I + 1*B = 114
      // I + B = 72
      // Subtracting: I = 42
      // B = 30
      expect(internalEdges.length).toBe(42);
      expect(boundaryEdges.length).toBe(30);
    });

    it('should verify midpoint calculation', () => {
      const edges = getUniqueEdges(hexes, size);
      const edge = edges[0];

      expect(edge.midpoint.x).toBeCloseTo((edge.start.x + edge.end.x) / 2);
      expect(edge.midpoint.y).toBeCloseTo((edge.start.y + edge.end.y) / 2);
    });
  });
});
