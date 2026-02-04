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
        fill="#D4C4A8" // Sand/land color
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
 * Generate SVG path with adaptive extension based on local curvature
 * Tighter in concave regions (inward curves), extended in convex regions
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
    // For a clockwise perimeter: angle > π means convex, angle < π means concave
    // For counter-clockwise: reversed
    // Check winding order by testing cross product
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

  // Start at first point
  pathCommands.push(
    `M ${extendedPoints[0].x.toFixed(2)} ${extendedPoints[0].y.toFixed(2)}`,
  );

  // Create wiggly path with bezier curves
  for (let i = 0; i < extendedPoints.length; i++) {
    const p1 = extendedPoints[i];
    const p2 = extendedPoints[(i + 1) % extendedPoints.length];

    // Calculate edge vector and perpendicular
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const edgeLength = Math.sqrt(dx * dx + dy * dy);

    // Perpendicular vector (normalized)
    const perpX = -dy / edgeLength;
    const perpY = dx / edgeLength;

    // Add multiple bezier curves along edge for organic wiggle
    const segments = Math.max(2, Math.floor(edgeLength / 10)); // ~10 units per segment

    for (let seg = 0; seg < segments; seg++) {
      const t1 = seg / segments;
      const t2 = (seg + 1) / segments;

      const x2 = p1.x + dx * t2;
      const y2 = p1.y + dy * t2;

      // Control point in middle of segment with sine wave offset
      const tMid = (t1 + t2) / 2;
      const xMid = p1.x + dx * tMid;
      const yMid = p1.y + dy * tMid;

      // Use deterministic "randomness" based on position
      const seed = (xMid * 0.1 + yMid * 0.1) % (Math.PI * 2);
      const wiggleAmount = (Math.sin(seed * 3) + Math.cos(seed * 5)) * 1.2;

      const cpX = xMid + perpX * wiggleAmount;
      const cpY = yMid + perpY * wiggleAmount;

      // Quadratic bezier curve
      pathCommands.push(
        `Q ${cpX.toFixed(2)} ${cpY.toFixed(2)}, ${x2.toFixed(2)} ${y2.toFixed(2)}`,
      );
    }
  }

  // Close path
  pathCommands.push('Z');

  return pathCommands.join(' ');
}
