import { AxialCoord } from '@catan/shared';

export type VertexPosition = { x: number; y: number };

const HEX_SIZE = 10;
const SQRT_3 = Math.sqrt(3);

export const axialToPixel = (coord: AxialCoord, size = HEX_SIZE): VertexPosition => ({
  x: size * SQRT_3 * (coord.q + coord.r / 2),
  y: size * 1.5 * coord.r,
});

export const getHexCornerPositions = (
  coord: AxialCoord,
  size = HEX_SIZE
): VertexPosition[] => {
  const center = axialToPixel(coord, size);
  return Array.from({ length: 6 }, (_, index) => {
    const angle = ((60 * index - 30) * Math.PI) / 180;
    return {
      x: center.x + size * Math.cos(angle),
      y: center.y + size * Math.sin(angle),
    };
  });
};

export const getVertexPosition = (
  coord: AxialCoord,
  vertexIndex: number,
  size = HEX_SIZE
): VertexPosition => {
  const corners = getHexCornerPositions(coord, size);
  const normalized = ((vertexIndex % 6) + 6) % 6;
  return corners[normalized];
};

const DIRECTION_TO_EDGE_CORNERS: Array<[number, number]> = [
  [0, 1],
  [5, 0],
  [4, 5],
  [3, 4],
  [2, 3],
  [1, 2],
];

export const getEdgeCornerIndices = (directionIndex: number): [number, number] => {
  const normalized = ((directionIndex % 6) + 6) % 6;
  return DIRECTION_TO_EDGE_CORNERS[normalized];
};

export const positionKey = (position: VertexPosition): string =>
  `${position.x.toFixed(4)},${position.y.toFixed(4)}`;

export const parseVertexId = (
  vertexId: string
): { coord: AxialCoord; vertexIndex: number } | null => {
  const [qStr, rStr, vStr] = vertexId.split(':');
  if (!qStr || !rStr || !vStr) return null;
  const q = Number(qStr);
  const r = Number(rStr);
  const v = Number(vStr);
  if (Number.isNaN(q) || Number.isNaN(r) || Number.isNaN(v)) return null;
  return { coord: { q, r }, vertexIndex: v };
};

export const parseEdgeId = (
  edgeId: string
):
  | { kind: 'neighbor'; a: AxialCoord; b: AxialCoord }
  | { kind: 'direction'; coord: AxialCoord; edgeIndex: number }
  | null => {
  if (edgeId.includes(',')) {
    const [coordPart, edgePart] = edgeId.split(':');
    if (!coordPart || edgePart === undefined) return null;
    const [qStr, rStr] = coordPart.split(',');
    const q = Number(qStr);
    const r = Number(rStr);
    const edgeIndex = Number(edgePart);
    if ([q, r, edgeIndex].some((value) => Number.isNaN(value))) return null;
    return { kind: 'direction', coord: { q, r }, edgeIndex };
  }

  const [left, right] = edgeId.split('-');
  if (!left || !right) return null;
  const [q1, r1] = left.split(':').map(Number);
  const [q2, r2] = right.split(':').map(Number);
  if ([q1, r1, q2, r2].some((value) => Number.isNaN(value))) return null;
  return { kind: 'neighbor', a: { q: q1, r: r1 }, b: { q: q2, r: r2 } };
};

export const buildVertexIndex = (hexes: AxialCoord[], size = HEX_SIZE) => {
  const keyToPosition = new Map<string, VertexPosition>();
  const vertexIdToKey = new Map<string, string>();

  hexes.forEach((coord) => {
    getHexCornerPositions(coord, size).forEach((corner, index) => {
      const key = positionKey(corner);
      const vertexId = `${coord.q}:${coord.r}:${index}`;
      if (!keyToPosition.has(key)) {
        keyToPosition.set(key, corner);
      }
      vertexIdToKey.set(vertexId, key);
    });
  });

  return { keyToPosition, vertexIdToKey };
};

export const getVertexKeyFromId = (
  vertexId: string,
  size = HEX_SIZE
): string | null => {
  const parsed = parseVertexId(vertexId);
  if (!parsed) return null;
  const position = getVertexPosition(parsed.coord, parsed.vertexIndex, size);
  return positionKey(position);
};

export const getSharedVertexKeysForEdge = (
  edgeId: string,
  hexes: AxialCoord[],
  size = HEX_SIZE
): string[] | null => {
  const parsed = parseEdgeId(edgeId);
  if (!parsed) return null;
  let shared: string[];
  if (parsed.kind === 'direction') {
    const corners = getHexCornerPositions(parsed.coord, size);
    const [startIndex, endIndex] = getEdgeCornerIndices(parsed.edgeIndex);
    shared = [positionKey(corners[startIndex]), positionKey(corners[endIndex])];
  } else {
    const aCorners = getHexCornerPositions(parsed.a, size).map(positionKey);
    const bCorners = getHexCornerPositions(parsed.b, size).map(positionKey);
    shared = aCorners.filter((key) => bCorners.includes(key));
    if (shared.length !== 2) {
      return null;
    }
  }
  const existingKeys = new Set(buildVertexIndex(hexes, size).keyToPosition.keys());
  if (!shared.every((key) => existingKeys.has(key))) {
    return null;
  }
  return shared;
};

export const getEdgeKeyFromVertexKeys = (vertexKeys: string[]): string => {
  const [first, second] = [...vertexKeys].sort();
  return `${first}|${second}`;
};

export const getEdgeKeyFromId = (
  edgeId: string,
  hexes: AxialCoord[],
  size = HEX_SIZE
): string | null => {
  const shared = getSharedVertexKeysForEdge(edgeId, hexes, size);
  if (!shared) return null;
  return getEdgeKeyFromVertexKeys(shared);
};

export const getDistance = (a: VertexPosition, b: VertexPosition): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

export const getHexVertexIds = (coord: AxialCoord): string[] =>
  Array.from({ length: 6 }, (_, index) => `${coord.q}:${coord.r}:${index}`);

export const getVertexPositionsByKey = (
  hexes: AxialCoord[],
  size = HEX_SIZE
): Map<string, VertexPosition> => buildVertexIndex(hexes, size).keyToPosition;
