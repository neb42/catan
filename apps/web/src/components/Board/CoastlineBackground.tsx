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

    // Collect all perimeter vertices
    const perimeterVertices: Point[] = [];

    // For each hex, add its vertices with outward extension
    hexes.forEach((hex) => {
      const center = getHexCenter(hex.q, hex.r);
      const vertices = getHexVertices(center, hexSize.x * spacing);

      // Extend vertices outward by 15-20% for coastline effect
      vertices.forEach((vertex) => {
        const dx = vertex.x - center.x;
        const dy = vertex.y - center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const extension = 1.17; // 17% extension

        perimeterVertices.push({
          x: center.x + dx * extension,
          y: center.y + dy * extension,
        });
      });
    });

    // Find convex hull of perimeter vertices to get outer boundary
    const convexHull = getConvexHull(perimeterVertices);

    // Generate wiggly path by adding sine wave variations to hull edges
    const wigglePath = generateWigglyPath(convexHull);

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
 * Calculate convex hull using Graham scan algorithm
 */
function getConvexHull(points: Point[]): Point[] {
  if (points.length < 3) return points;

  // Find the point with lowest y (and leftmost if tie)
  let pivot = points[0];
  for (const point of points) {
    if (point.y < pivot.y || (point.y === pivot.y && point.x < pivot.x)) {
      pivot = point;
    }
  }

  // Sort points by polar angle with respect to pivot
  const sorted = [...points].sort((a, b) => {
    if (a === pivot) return -1;
    if (b === pivot) return 1;

    const angleA = Math.atan2(a.y - pivot.y, a.x - pivot.x);
    const angleB = Math.atan2(b.y - pivot.y, b.x - pivot.x);

    if (angleA !== angleB) return angleA - angleB;

    // If angles are equal, sort by distance
    const distA = Math.hypot(a.x - pivot.x, a.y - pivot.y);
    const distB = Math.hypot(b.x - pivot.x, b.y - pivot.y);
    return distA - distB;
  });

  // Build hull
  const hull: Point[] = [sorted[0], sorted[1]];

  for (let i = 2; i < sorted.length; i++) {
    let top = hull.length - 1;

    // Remove points that make clockwise turn
    while (
      hull.length > 1 &&
      crossProduct(hull[top - 1], hull[top], sorted[i]) <= 0
    ) {
      hull.pop();
      top--;
    }

    hull.push(sorted[i]);
  }

  return hull;
}

/**
 * Calculate cross product to determine turn direction
 */
function crossProduct(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

/**
 * Generate SVG path with wiggly coastline effect using sine wave
 */
function generateWigglyPath(points: Point[]): string {
  if (points.length < 3) return '';

  const pathCommands: string[] = [];

  // Start at first point
  pathCommands.push(`M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`);

  // For each edge, create wiggly line with bezier curves
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];

    // Calculate edge vector and perpendicular
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const edgeLength = Math.sqrt(dx * dx + dy * dy);

    // Perpendicular vector (normalized)
    const perpX = -dy / edgeLength;
    const perpY = dx / edgeLength;

    // Add multiple bezier curves along edge for organic wiggle
    const segments = Math.max(3, Math.floor(edgeLength / 8)); // ~8 units per segment

    for (let seg = 0; seg < segments; seg++) {
      const t1 = seg / segments;
      const t2 = (seg + 1) / segments;

      const x1 = p1.x + dx * t1;
      const y1 = p1.y + dy * t1;
      const x2 = p1.x + dx * t2;
      const y2 = p1.y + dy * t2;

      // Control point in middle of segment with sine wave offset
      const tMid = (t1 + t2) / 2;
      const xMid = p1.x + dx * tMid;
      const yMid = p1.y + dy * tMid;

      // Use deterministic "randomness" based on position
      const seed = (xMid * 0.1 + yMid * 0.1) % (Math.PI * 2);
      const wiggleAmount = (Math.sin(seed * 3) + Math.cos(seed * 5)) * 1.5;

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
