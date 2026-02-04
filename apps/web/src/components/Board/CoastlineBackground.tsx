import { useMemo } from 'react';
import { Hex } from '@catan/shared';

interface CoastlineBackgroundProps {
  hexes: Hex[];
}

interface Point {
  x: number;
  y: number;
}

/**
 * Renders a land-colored background with wiggly coastline edges behind the board hexagons.
 * Creates an organic island appearance by extending beyond hex perimeter with irregular edges.
 */
export function CoastlineBackground({ hexes }: CoastlineBackgroundProps) {
  const coastlinePath = useMemo(() => {
    if (!hexes.length) return '';

    // Hex layout constants (must match Board.tsx Layout props)
    const hexSize = { x: 10, y: 10 };
    const spacing = 1.05;

    // Calculate hex center in pixel coordinates
    const getHexCenter = (q: number, r: number): Point => ({
      x: hexSize.x * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r) * spacing,
      y: hexSize.y * ((3 / 2) * r) * spacing,
    });

    // Get the 6 vertices of a pointy-top hexagon
    const getHexVertices = (center: Point, size: number): Point[] => {
      const vertices: Point[] = [];
      for (let i = 0; i < 6; i++) {
        const angleDeg = 60 * i - 30; // -30 offset for pointy-top
        const angleRad = (Math.PI / 180) * angleDeg;
        vertices.push({
          x: center.x + size * Math.cos(angleRad),
          y: center.y + size * Math.sin(angleRad),
        });
      }
      return vertices;
    };

    // Build a map of hex locations for neighbor detection
    const hexMap = new Map<string, Hex>();
    hexes.forEach((hex) => {
      hexMap.set(`${hex.q},${hex.r}`, hex);
    });

    // Find all perimeter edges (edges not shared with another hex)
    const perimeterEdges: Array<{ p1: Point; p2: Point; center: Point }> = [];

    hexes.forEach((hex) => {
      const center = getHexCenter(hex.q, hex.r);
      const vertices = getHexVertices(center, hexSize.x * spacing);

      // Check each edge of the hexagon
      for (let i = 0; i < 6; i++) {
        const v1 = vertices[i];
        const v2 = vertices[(i + 1) % 6];

        // Calculate which neighbor would share this edge
        // Pointy-top hex neighbors in axial coordinates
        const neighbors = [
          { q: hex.q + 1, r: hex.r }, // Edge 0
          { q: hex.q, r: hex.r + 1 }, // Edge 1
          { q: hex.q - 1, r: hex.r + 1 }, // Edge 2
          { q: hex.q - 1, r: hex.r }, // Edge 3
          { q: hex.q, r: hex.r - 1 }, // Edge 4
          { q: hex.q + 1, r: hex.r - 1 }, // Edge 5
        ];

        const neighborKey = `${neighbors[i].q},${neighbors[i].r}`;

        // If no neighbor on this edge, it's a perimeter edge
        if (!hexMap.has(neighborKey)) {
          perimeterEdges.push({ p1: v1, p2: v2, center });
        }
      }
    });

    // Sort perimeter edges to form a continuous boundary
    const sortedPerimeter = sortPerimeterEdges(perimeterEdges);

    // Generate wiggly path with variable extension based on curvature
    const wigglePath = generateAdaptiveWigglyPath(sortedPerimeter);

    return wigglePath;
  }, [hexes]);

  return (
    <g className="coastline-background">
      <path
      d={coastlinePath}
      fill="#d4a574" // Warm sandy beige
      opacity={0.95}
      style={{
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))',
      }}
      />
    </g>
  );
}

/**
 * Sort perimeter edges into continuous boundary order
 */
function sortPerimeterEdges(
  edges: Array<{ p1: Point; p2: Point; center: Point }>,
): Point[] {
  if (edges.length === 0) return [];

  const points: Point[] = [];
  const epsilon = 0.01; // Tolerance for point matching

  // Helper to check if two points are approximately equal
  const pointsEqual = (a: Point, b: Point) =>
    Math.abs(a.x - b.x) < epsilon && Math.abs(a.y - b.y) < epsilon;

  // Start with first edge
  let current = edges[0].p2;
  points.push(edges[0].p1);
  points.push(current);

  const remaining = [...edges.slice(1)];

  // Build continuous path by finding connected edges
  while (remaining.length > 0) {
    const nextIndex = remaining.findIndex(
      (edge) => pointsEqual(edge.p1, current) || pointsEqual(edge.p2, current),
    );

    if (nextIndex === -1) break; // No more connected edges

    const nextEdge = remaining[nextIndex];
    remaining.splice(nextIndex, 1);

    // Add the other endpoint
    if (pointsEqual(nextEdge.p1, current)) {
      current = nextEdge.p2;
    } else {
      current = nextEdge.p1;
    }

    points.push(current);
  }

  return points;
}

/**
 * Calculate interior angle at a point in a polygon
 * Returns angle in radians (0 to 2π)
 */
function calculateInteriorAngle(prev: Point, curr: Point, next: Point): number {
  const v1x = prev.x - curr.x;
  const v1y = prev.y - curr.y;
  const v2x = next.x - curr.x;
  const v2y = next.y - curr.y;

  const angle1 = Math.atan2(v1y, v1x);
  const angle2 = Math.atan2(v2y, v2x);

  let angle = angle2 - angle1;
  if (angle < 0) angle += 2 * Math.PI;
  if (angle > 2 * Math.PI) angle -= 2 * Math.PI;

  return angle;
}

/**
 * Generate SVG path with straight edges and rounded corners
 * Uses adaptive extension based on local curvature
 */
function generateAdaptiveWigglyPath(points: Point[]): string {
  if (points.length < 3) return '';

  const pathCommands: string[] = [];
  const extendedPoints: Point[] = [];

  // Calculate center of all points for outward direction reference
  const centroid = {
    x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
    y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
  };

  // For each point, calculate extension based on interior angle
  for (let i = 0; i < points.length; i++) {
    const prev = points[(i - 1 + points.length) % points.length];
    const curr = points[i];
    const next = points[(i + 1) % points.length];

    // Calculate interior angle
    const interiorAngle = calculateInteriorAngle(prev, curr, next);

    // Determine if this is convex (outward) or concave (inward)
    const isOutward = interiorAngle > Math.PI;

    // Calculate extension factor based on curvature
    // Convex (outward): 15-20% extension
    // Concave (inward): 5-8% extension (tighter)
    let extensionFactor: number;
    if (isOutward) {
      // Smooth convex corners - more extension
      extensionFactor = 1.15 + (interiorAngle - Math.PI) * 0.02;
    } else {
      // Concave corners - minimal extension
      const concavity = (Math.PI - interiorAngle) / Math.PI;
      extensionFactor = 1.05 + concavity * 0.03; // 5-8% extension
    }

    // Calculate outward direction from centroid
    const dx = curr.x - centroid.x;
    const dy = curr.y - centroid.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const extended = {
      x: centroid.x + (dx / dist) * dist * extensionFactor,
      y: centroid.y + (dy / dist) * dist * extensionFactor,
    };

    extendedPoints.push(extended);
  }

  // Corner radius for rounded corners (in SVG units)
  const cornerRadius = 3;

  // Start path
  const startPoint = extendedPoints[0];
  const startNext = extendedPoints[1];

  // Calculate starting position offset by corner radius
  const startDx = startNext.x - startPoint.x;
  const startDy = startNext.y - startPoint.y;
  const startDist = Math.sqrt(startDx * startDx + startDy * startDy);
  const startOffsetRatio = Math.min(cornerRadius / startDist, 0.5);

  const startX = startPoint.x + startDx * startOffsetRatio;
  const startY = startPoint.y + startDy * startOffsetRatio;

  pathCommands.push(`M ${startX.toFixed(2)} ${startY.toFixed(2)}`);

  // Draw straight lines with rounded corners
  for (let i = 0; i < extendedPoints.length; i++) {
    const prev =
      extendedPoints[(i - 1 + extendedPoints.length) % extendedPoints.length];
    const curr = extendedPoints[i];
    const next = extendedPoints[(i + 1) % extendedPoints.length];

    // Vector from current to next
    const dx = next.x - curr.x;
    const dy = next.y - curr.y;
    const distToNext = Math.sqrt(dx * dx + dy * dy);

    // Vector from previous to current
    const dxPrev = curr.x - prev.x;
    const dyPrev = curr.y - prev.y;
    const distFromPrev = Math.sqrt(dxPrev * dxPrev + dyPrev * dyPrev);

    // Calculate how much to offset from corner (smaller of radius or half edge length)
    const offsetPrev = Math.min(cornerRadius, distFromPrev * 0.4);
    const offsetNext = Math.min(cornerRadius, distToNext * 0.4);

    // Point before corner (on incoming edge)
    const beforeX = curr.x - (dxPrev / distFromPrev) * offsetPrev;
    const beforeY = curr.y - (dyPrev / distFromPrev) * offsetPrev;

    // Point after corner (on outgoing edge)
    const afterX = curr.x + (dx / distToNext) * offsetNext;
    const afterY = curr.y + (dy / distToNext) * offsetNext;

    // Draw line to point before corner
    pathCommands.push(`L ${beforeX.toFixed(2)} ${beforeY.toFixed(2)}`);

    // Draw quadratic curve for rounded corner
    pathCommands.push(
      `Q ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}, ${afterX.toFixed(2)} ${afterY.toFixed(2)}`,
    );
  }

  // Close path
  pathCommands.push('Z');

  return pathCommands.join(' ');
}
