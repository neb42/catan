import {
  axialToCube,
  AxialCoord,
  Board,
  cubeNeighbor,
  cubeToAxial,
  getNeighbors,
  HexTile,
  Port,
  Terrain,
} from '@catan/shared';

export type BoardGenerationMode = 'balanced' | 'natural';

const TERRAIN_DISTRIBUTION: Terrain[] = [
  'wood',
  'wood',
  'wood',
  'wood',
  'wheat',
  'wheat',
  'wheat',
  'wheat',
  'sheep',
  'sheep',
  'sheep',
  'sheep',
  'brick',
  'brick',
  'brick',
  'ore',
  'ore',
  'ore',
  'desert',
];

const NUMBER_TOKENS = [
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
];

const PORT_TYPES: Port['type'][] = [
  '3:1',
  '3:1',
  '3:1',
  '3:1',
  '2:1-wood',
  '2:1-wheat',
  '2:1-sheep',
  '2:1-brick',
  '2:1-ore',
];

const AXIAL_DIRECTIONS: AxialCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

const coordKey = (coord: AxialCoord): string => `${coord.q},${coord.r}`;

export const shuffle = <T,>(array: T[]): T[] => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const spiralCoordinates = (): AxialCoord[] => {
  const coords: AxialCoord[] = [{ q: 0, r: 0 }];
  for (let radius = 1; radius <= 2; radius += 1) {
    let cube = axialToCube({ q: 0, r: 0 });
    for (let step = 0; step < radius; step += 1) {
      cube = cubeNeighbor(cube, 4);
    }
    for (let side = 0; side < 6; side += 1) {
      for (let step = 0; step < radius; step += 1) {
        coords.push(cubeToAxial(cube));
        cube = cubeNeighbor(cube, side);
      }
    }
  }
  return coords;
};

export const validateNoAdjacent68 = (hexes: HexTile[]): boolean => {
  const hexMap = new Map(hexes.map((hex) => [coordKey(hex.coord), hex]));
  for (const hex of hexes) {
    if (hex.number !== 6 && hex.number !== 8) {
      continue;
    }
    const neighbors = getNeighbors(hex.coord);
    for (const neighbor of neighbors) {
      const neighborHex = hexMap.get(coordKey(neighbor));
      if (neighborHex && (neighborHex.number === 6 || neighborHex.number === 8)) {
        return false;
      }
    }
  }
  return true;
};

export const generatePorts = (hexes: HexTile[]): Port[] => {
  const hexKeys = new Set(hexes.map((hex) => coordKey(hex.coord)));
  const edgePositions: string[] = [];

  for (const hex of hexes) {
    AXIAL_DIRECTIONS.forEach((direction, index) => {
      const neighbor = {
        q: hex.coord.q + direction.q,
        r: hex.coord.r + direction.r,
      };
      if (!hexKeys.has(coordKey(neighbor))) {
        edgePositions.push(`${hex.coord.q},${hex.coord.r}:${index}`);
      }
    });
  }

  const shuffledEdges = shuffle(edgePositions);
  const shuffledTypes = shuffle(PORT_TYPES);

  if (shuffledEdges.length < 9) {
    throw new Error('Insufficient coastal edges to place ports.');
  }

  return shuffledTypes.map((type, index) => ({
    position: shuffledEdges[index],
    type,
  }));
};

export const generateBoard = (mode: BoardGenerationMode = 'balanced'): Board => {
  const maxAttempts = 250;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const terrain = shuffle(TERRAIN_DISTRIBUTION);
    const numbers = shuffle(NUMBER_TOKENS);
    let numberIndex = 0;

    const hexes: HexTile[] = spiralCoordinates().map((coord, index) => {
      const terrainType = terrain[index];
      const isDesert = terrainType === 'desert';
      const number = isDesert ? null : numbers[numberIndex++];
      return {
        coord,
        terrain: terrainType,
        number: number ?? null,
        hasRobber: isDesert,
      };
    });

    if (numberIndex !== NUMBER_TOKENS.length) {
      throw new Error('Number token assignment mismatch.');
    }

    if (mode === 'balanced' && !validateNoAdjacent68(hexes)) {
      continue;
    }

    const ports = generatePorts(hexes);
    return {
      hexes,
      ports,
    };
  }

  throw new Error('Failed to generate a valid board layout.');
};
