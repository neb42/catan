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
