export type CubeCoord = {
  q: number;
  r: number;
  s: number;
};

export type AxialCoord = {
  q: number;
  r: number;
};

const CUBE_DIRECTIONS: CubeCoord[] = [
  { q: 1, r: 0, s: -1 },
  { q: 1, r: -1, s: 0 },
  { q: 0, r: -1, s: 1 },
  { q: -1, r: 0, s: 1 },
  { q: -1, r: 1, s: 0 },
  { q: 0, r: 1, s: -1 },
];

export const axialToCube = (hex: AxialCoord): CubeCoord => ({
  q: hex.q,
  r: hex.r,
  s: -hex.q - hex.r,
});

export const cubeToAxial = (cube: CubeCoord): AxialCoord => ({
  q: cube.q,
  r: cube.r,
});

export const cubeNeighbor = (cube: CubeCoord, direction: number): CubeCoord => {
  const dir = CUBE_DIRECTIONS[((direction % 6) + 6) % 6];
  return {
    q: cube.q + dir.q,
    r: cube.r + dir.r,
    s: cube.s + dir.s,
  };
};

export const cubeDistance = (a: CubeCoord, b: CubeCoord): number =>
  Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(a.s - b.s));

export const getNeighbors = (coord: AxialCoord): AxialCoord[] => {
  const cube = axialToCube(coord);
  return CUBE_DIRECTIONS.map((direction) =>
    cubeToAxial({
      q: cube.q + direction.q,
      r: cube.r + direction.r,
      s: cube.s + direction.s,
    })
  );
};