export interface AxialCoord {
  q: number;
  r: number;
}

export interface CubeCoord {
  q: number;
  r: number;
  s: number;
}

export const CUBE_DIRECTIONS: CubeCoord[] = [
  { q: 1, r: 0, s: -1 },
  { q: 1, r: -1, s: 0 },
  { q: 0, r: -1, s: 1 },
  { q: -1, r: 0, s: 1 },
  { q: -1, r: 1, s: 0 },
  { q: 0, r: 1, s: -1 },
];

export function axialToCube(coord: AxialCoord): CubeCoord {
  return {
    q: coord.q,
    r: coord.r,
    s: -coord.q - coord.r,
  };
}

export function cubeToAxial(coord: CubeCoord): AxialCoord {
  return {
    q: coord.q,
    r: coord.r,
  };
}

export function getNeighbors(coord: AxialCoord): AxialCoord[] {
  const cube = axialToCube(coord);
  return CUBE_DIRECTIONS.map((dir) => {
    return cubeToAxial({
      q: cube.q + dir.q,
      r: cube.r + dir.r,
      s: cube.s + dir.s,
    });
  });
}

/**
 * Returns the 19 hex positions in a standard Catan board layout.
 * Includes center (0,0), ring 1 (radius 1), and ring 2 (radius 2).
 */
export function getCatanHexPositions(): AxialCoord[] {
  const positions: AxialCoord[] = [];
  const radius = 2;
  
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      positions.push({ q, r });
    }
  }
  
  return positions;
}

export interface PixelCoord {
  x: number;
  y: number;
}

/**
 * Convert axial hex coordinates to pixel coordinates.
 * Must match react-hexgrid Layout settings: size={x: 10, y: 10}, flat=false (pointy-top)
 * 
 * Formula for pointy-top hexes:
 * x = size.x * (Math.sqrt(3) * q + Math.sqrt(3)/2 * r)
 * y = size.y * (3/2 * r)
 */
export function hexToPixel(
  coord: AxialCoord, 
  size: { x: number; y: number } = { x: 10, y: 10 },
  spacing: number = 1
): PixelCoord {
  const x = size.x * (Math.sqrt(3) * coord.q + Math.sqrt(3) / 2 * coord.r) * spacing;
  const y = size.y * (3 / 2 * coord.r) * spacing;
  return { x, y };
}

/**
 * Get angle in degrees for hex edge direction (0-5).
 * For pointy-top hexes:
 * 0=E (0°), 1=NE (60°), 2=NW (120°), 3=W (180°), 4=SW (240°), 5=SE (300°)
 */
export function getEdgeAngle(edge: number): number {
  return edge * 60;
}

/**
 * Calculate pixel position for port on hex edge.
 * Port should be positioned at the midpoint of the edge, extended outward.
 */
export function getPortPosition(
  hexQ: number,
  hexR: number,
  edge: number,
  size: { x: number; y: number } = { x: 10, y: 10 },
  distance: number = 15,
  spacing: number = 1
): PixelCoord {
  const hexCenter = hexToPixel({ q: hexQ, r: hexR }, size, spacing);
  const angle = getEdgeAngle(edge);
  const radians = (angle * Math.PI) / 180;
  
  return {
    x: hexCenter.x + Math.cos(radians) * distance,
    y: hexCenter.y + Math.sin(radians) * distance,
  };
}
