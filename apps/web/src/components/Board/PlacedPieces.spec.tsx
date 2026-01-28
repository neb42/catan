import { describe, it, expect } from 'vitest';
import { getCatanHexPositions } from '@catan/shared';
import { getUniqueEdges } from '@catan/shared';

describe('Road outer edge placement', () => {
  it('should identify boundary edges correctly', () => {
    const hexes = getCatanHexPositions();
    const size = { x: 10, y: 10 };
    const edges = getUniqueEdges(hexes, size);

    const boundaryEdges = edges.filter((e) => e.adjacentHexes.length === 1);
    const internalEdges = edges.filter((e) => e.adjacentHexes.length === 2);

    // Standard Catan board should have 30 boundary edges and 42 internal edges
    expect(boundaryEdges.length).toBe(30);
    expect(internalEdges.length).toBe(42);
  });

  it('should calculate outward offset for boundary edge', () => {
    const hexes = getCatanHexPositions();
    const size = { x: 10, y: 10 };
    const edges = getUniqueEdges(hexes, size);

    // Find a boundary edge
    const boundaryEdge = edges.find((e) => e.adjacentHexes.length === 1);
    expect(boundaryEdge).toBeDefined();

    if (!boundaryEdge) return;

    // Get hex center
    const hexId = boundaryEdge.adjacentHexes[0];
    const [qStr, rStr] = hexId.split(',');
    const hexQ = parseInt(qStr, 10);
    const hexR = parseInt(rStr, 10);

    const hexCenterX =
      size.x * (Math.sqrt(3) * hexQ + (Math.sqrt(3) / 2) * hexR);
    const hexCenterY = size.y * (3 / 2) * hexR;

    // Calculate distance from hex center to original edge midpoint
    const distBefore = Math.sqrt(
      Math.pow(boundaryEdge.midpoint.x - hexCenterX, 2) +
        Math.pow(boundaryEdge.midpoint.y - hexCenterY, 2),
    );

    // Apply offset logic (same as in PlacedPieces)
    const { start, end } = boundaryEdge;
    const edgeVectorX = end.x - start.x;
    const edgeVectorY = end.y - start.y;

    const perpX = -edgeVectorY;
    const perpY = edgeVectorX;

    const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
    const perpNormX = perpX / perpLength;
    const perpNormY = perpY / perpLength;

    const toEdgeX = boundaryEdge.midpoint.x - hexCenterX;
    const toEdgeY = boundaryEdge.midpoint.y - hexCenterY;

    const dotProduct = perpNormX * toEdgeX + perpNormY * toEdgeY;
    const directionMultiplier = dotProduct > 0 ? 1 : -1;

    const offsetAmount = 1.0;

    const offsetStart = {
      x: start.x + perpNormX * offsetAmount * directionMultiplier,
      y: start.y + perpNormY * offsetAmount * directionMultiplier,
    };
    const offsetEnd = {
      x: end.x + perpNormX * offsetAmount * directionMultiplier,
      y: end.y + perpNormY * offsetAmount * directionMultiplier,
    };

    const offsetMidpoint = {
      x: (offsetStart.x + offsetEnd.x) / 2,
      y: (offsetStart.y + offsetEnd.y) / 2,
    };

    // Calculate distance from hex center to offset edge midpoint
    const distAfter = Math.sqrt(
      Math.pow(offsetMidpoint.x - hexCenterX, 2) +
        Math.pow(offsetMidpoint.y - hexCenterY, 2),
    );

    // After offset, distance should be greater (moved away from center)
    expect(distAfter).toBeGreaterThan(distBefore);

    // Distance increase should be approximately offsetAmount
    expect(distAfter - distBefore).toBeCloseTo(offsetAmount, 1);
  });
});
