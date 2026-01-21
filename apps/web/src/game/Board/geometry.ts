export type AxialCoord = { q: number; r: number };
export type Point = { x: number; y: number };

export const HEX_SIZE = 10;
const SQRT_3 = Math.sqrt(3);

export const axialToPixel = (coord: AxialCoord, size = HEX_SIZE): Point => ({
  x: size * SQRT_3 * (coord.q + coord.r / 2),
  y: size * 1.5 * coord.r,
});

export const getHexCornerPositions = (
  coord: AxialCoord,
  size = HEX_SIZE
): Point[] => {
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
): Point => {
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

export const parseVertexId = (vertexId: string): { coord: AxialCoord; vertexIndex: number } | null => {
  const [qStr, rStr, vStr] = vertexId.split(':');
  if (!qStr || !rStr || !vStr) return null;
  const q = Number(qStr);
  const r = Number(rStr);
  const v = Number(vStr);
  if ([q, r, v].some((value) => Number.isNaN(value))) return null;
  return { coord: { q, r }, vertexIndex: v };
};

export const parseEdgeId = (
  edgeId: string
): { a: AxialCoord; b: AxialCoord } | null => {
  const [left, right] = edgeId.split('-');
  if (!left || !right) return null;
  const [q1, r1] = left.split(':').map(Number);
  const [q2, r2] = right.split(':').map(Number);
  if ([q1, r1, q2, r2].some((value) => Number.isNaN(value))) return null;
  return { a: { q: q1, r: r1 }, b: { q: q2, r: r2 } };
};

export const getEdgeVertexPositions = (
  edgeId: string,
  size = HEX_SIZE
): [Point, Point] | null => {
  const parsed = parseEdgeId(edgeId);
  if (!parsed) return null;
  const aCorners = getHexCornerPositions(parsed.a, size);
  const bCorners = getHexCornerPositions(parsed.b, size);

  const shared: Point[] = [];
  aCorners.forEach((corner) => {
    const match = bCorners.find(
      (candidate) =>
        Math.abs(candidate.x - corner.x) < 0.001 && Math.abs(candidate.y - corner.y) < 0.001
    );
    if (match) shared.push(corner);
  });

  if (shared.length !== 2) return null;
  return [shared[0], shared[1]];
};
