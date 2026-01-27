import { AxialCoord, hexToPixel } from './coordinates';

export interface Vertex {
  id: string; // Unique identifier (rounded coordinate key)
  x: number; // SVG x coordinate
  y: number; // SVG y coordinate
  adjacentHexes: string[]; // Hex IDs that share this vertex (q,r format)
}

export interface Edge {
  id: string; // Unique identifier (sorted endpoint key)
  start: { x: number; y: number };
  end: { x: number; y: number };
  midpoint: { x: number; y: number };
  adjacentHexes: string[]; // Hex IDs that share this edge
}

const EPSILON = 0.1;

// Round coordinates to avoid floating point issues when generating keys
function roundCoord(n: number): number {
  return Math.round(n * 10) / 10;
}

function getVertexKey(x: number, y: number): string {
  return `${roundCoord(x)},${roundCoord(y)}`;
}

export function getVertexFromCorner(
  hex: AxialCoord,
  cornerIndex: number,
  size: { x: number; y: number } = { x: 10, y: 10 },
): Vertex {
  const center = hexToPixel(hex, size);
  // Pointy-top hex corners are at 30, 90, 150, 210, 270, 330 degrees
  const angleDeg = 30 + cornerIndex * 60;
  const angleRad = (angleDeg * Math.PI) / 180;

  const x = center.x + size.x * Math.cos(angleRad);
  const y = center.y + size.y * Math.sin(angleRad);

  return {
    id: getVertexKey(x, y),
    x,
    y,
    adjacentHexes: [`${hex.q},${hex.r}`],
  };
}

export function getUniqueVertices(
  hexes: AxialCoord[],
  size: { x: number; y: number } = { x: 10, y: 10 },
): Vertex[] {
  const vertexMap = new Map<string, Vertex>();

  hexes.forEach((hex) => {
    for (let i = 0; i < 6; i++) {
      const vertex = getVertexFromCorner(hex, i, size);

      if (vertexMap.has(vertex.id)) {
        const existing = vertexMap.get(vertex.id)!;
        if (!existing.adjacentHexes.includes(`${hex.q},${hex.r}`)) {
          existing.adjacentHexes.push(`${hex.q},${hex.r}`);
        }
      } else {
        vertexMap.set(vertex.id, vertex);
      }
    }
  });

  return Array.from(vertexMap.values());
}

export function getUniqueEdges(
  hexes: AxialCoord[],
  size: { x: number; y: number } = { x: 10, y: 10 },
): Edge[] {
  const edgeMap = new Map<string, Edge>();

  hexes.forEach((hex) => {
    const hexId = `${hex.q},${hex.r}`;

    for (let i = 0; i < 6; i++) {
      // Edge connects corner i and (i+1)%6
      const startV = getVertexFromCorner(hex, i, size);
      const endV = getVertexFromCorner(hex, (i + 1) % 6, size);

      // Create a unique key for the edge by sorting start and end points
      // This ensures edge A->B is same as B->A
      const points = [startV.id, endV.id].sort();
      const edgeId = `${points[0]}|${points[1]}`;

      if (edgeMap.has(edgeId)) {
        const existing = edgeMap.get(edgeId)!;
        if (!existing.adjacentHexes.includes(hexId)) {
          existing.adjacentHexes.push(hexId);
        }
      } else {
        const midpoint = {
          x: (startV.x + endV.x) / 2,
          y: (startV.y + endV.y) / 2,
        };

        edgeMap.set(edgeId, {
          id: edgeId,
          start: { x: startV.x, y: startV.y },
          end: { x: endV.x, y: endV.y },
          midpoint,
          adjacentHexes: [hexId],
        });
      }
    }
  });

  return Array.from(edgeMap.values());
}
