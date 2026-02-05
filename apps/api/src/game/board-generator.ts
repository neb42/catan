import { webcrypto } from 'node:crypto';
import {
  getCatanHexPositions,
  getNeighbors,
  axialToCube,
} from '../../../../libs/shared/src';
import { BoardState, Hex, Port, PortType, TerrainType } from './types';
import { validateBoardFairness } from './fairness-validator';

// Polyfill minimal crypto for Node if global crypto is missing
const crypto = (globalThis.crypto || webcrypto) as Crypto;

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  const randomValues = new Uint32Array(result.length);
  crypto.getRandomValues(randomValues);

  for (let i = result.length - 1; i > 0; i--) {
    const j = randomValues[i] % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

const TERRAINS: TerrainType[] = [
  ...Array(4).fill('forest'),
  ...Array(4).fill('fields'),
  ...Array(4).fill('pasture'),
  ...Array(3).fill('hills'),
  ...Array(3).fill('mountains'),
  'desert',
]; // Total 19

const NUMBERS = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12]; // Total 18

const PORT_TYPES: PortType[] = [
  ...Array(4).fill('generic'),
  'wood',
  'brick',
  'sheep',
  'wheat',
  'ore',
]; // Total 9

export function generateBoard(maxRetries = 100): BoardState {
  const positions = getCatanHexPositions();
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;

    // 1. Shuffle terrains
    const shuffledTerrains = shuffle(TERRAINS);

    // 2. Assign terrains
    // We create hex objects
    const hexes: Hex[] = positions.map((pos, index) => ({
      q: pos.q,
      r: pos.r,
      terrain: shuffledTerrains[index],
      number: null,
    }));

    // 3. Shuffle numbers
    const shuffledNumbers = shuffle(NUMBERS);

    // 4. Assign numbers
    // Spiral order from center? Or just iterate.
    // Catan spiral: Center -> Ring 1 -> Ring 2.
    // getCatanHexPositions returns Center, Ring 1, Ring 2.
    // So just matching index is effectively spiral.

    const nonDesertHexes = hexes.filter((h) => h.terrain !== 'desert');
    if (nonDesertHexes.length !== shuffledNumbers.length) {
      // Should be 18 non-desert, 18 numbers
      // This happens if we somehow have wrong counts, but we checked.
    }

    // Assign
    nonDesertHexes.forEach((hex, i) => {
      hex.number = shuffledNumbers[i];
    });

    // 5. Validate
    if (validateBoardFairness(hexes)) {
      // Success! Generate ports
      const ports = generatePorts(hexes);
      return { hexes, ports };
    }
  }

  console.warn(
    'Board generation retry limit exhausted. Returning last attempt.',
  );
  // In real app, maybe throw error or return fallback valid board.
  // Re-generate one last time to ensure we return structure even if unfair (or return the last unfair one)
  // The loop logic reuses variable names, so we need to capture inside loop or reconstruct.
  // For simplicity, just recursing once if failed? No, stack overflow risk.
  // Just run one more generation without validation?
  // Or just accept the fail.

  // Fallback: Generate one and return it
  const shuffledTerrains = shuffle(TERRAINS);
  const hexes: Hex[] = positions.map((pos, index) => ({
    q: pos.q,
    r: pos.r,
    terrain: shuffledTerrains[index],
    number: null,
  }));
  const shuffledNumbers = shuffle(NUMBERS);
  hexes
    .filter((h) => h.terrain !== 'desert')
    .forEach((h, i) => (h.number = shuffledNumbers[i]));
  const ports = generatePorts(hexes);
  return { hexes, ports };
}

function generatePorts(hexes: Hex[]): Port[] {
  const shuffledPorts = shuffle(PORT_TYPES);

  // Find edge hexes (Ring 2).
  // Radius 2.
  // condition: max(abs(q), abs(r), abs(s)) == 2
  const edgeHexes = hexes.filter((h) => {
    const s = -h.q - h.r;
    return Math.max(Math.abs(h.q), Math.abs(h.r), Math.abs(s)) === 2;
  });

  // Sort angularly to distribute evenly
  // atan2(sqrt(3) * (q + r/2), 3/2 * r) ???
  // Standard flat-topped hexes to pixel:
  // x = 3/2 * q
  // y = sqrt(3)/2 * q + sqrt(3) * r  <-- Wait, this is Pointy Top?
  // Coordinates util uses pointy top vectors (q=1, r=0 is East-ish?)
  // Coordinates util vectors: (1,0, -1) etc.
  // Red Blob games: Pointy top: x = sqrt(3) * q + sqrt(3)/2 * r, y = 3/2 * r
  // Let's use simple atan2(r, q) but properly transformed.
  // Actually, we can just sort by angle of (q, r) in axial plane?
  // q checks x axis, r checks...
  // Let's compute approx angle.
  // For hexagonal grid, q is 0 deg (if r=0). r is 120 deg?
  // To get proper sort order around the ring:
  // (1, -1) -> (1, 0) -> (0, 1) -> (-1, 1) -> (-1, 0) -> (0, -1) is ring 1 clockwise?
  // Let's just use atan2 with basis vectors.

  edgeHexes.sort((a, b) => {
    const angleA = Math.atan2(Math.sqrt(3) * (a.q + a.r / 2), 1.5 * a.r); // Pointy top basis?
    // Wait, for sorting, simple angle from center is fine.
    // x_axial = q + r/2
    // y_axial = r
    // This is not quite right for screen coords but preserves ordering.
    // Actually, let's look at corner logic.
    // Top Left, Top Right, Right, Bottom Right, Bottom Left, Left.
    // We know there are exactly 12 in ring 2.
    // Let's just define an ordered list of ring 2 coordinates?
    // Or just trust atan2.

    // Pointy top conversion:
    // x = 3/2 * q  (Wait, this is Flat Top)
    // Check coordinates.ts: neighbor (1,0)
    // If pointy top, neighbor (1,0) is usually East-South-East?
    // Redblob pointy top: neighbors are (1,0), (0,1), (-1,1), (-1,0), (0,-1), (1,-1).

    // Let's assume standard basis for angle.
    // x = q * cos(0) + r * cos(60)
    // y = q * sin(0) + r * sin(60)
    const xA = a.q + a.r * 0.5;
    const yA = a.r * 0.866; // sqrt(3)/2

    const xB = b.q + b.r * 0.5;
    const yB = b.r * 0.866;

    return Math.atan2(yA, xA) - Math.atan2(yB, xB);
  });

  const ports: Port[] = [];

  // Pattern for 9 ports on 12 hexes.
  // Distribute evenly by skipping positions 2, 5, 9
  // This creates max 3 consecutive ports (better than the original 3 clusters of 3)
  // Pattern: PP_PP_PPP_PP (gaps at indices 2, 5, 9)
  const portIndices = [0, 1, 3, 4, 6, 7, 8, 10, 11];

  portIndices.forEach((hexIndex, i) => {
    const hex = edgeHexes[hexIndex];
    const type = shuffledPorts[i];

    // Determine edge direction (0-5)
    // We want the edge that faces OUTWARDS.
    // Center is (0,0). Hex is (q,r). Vector C->H is (q,r).
    // Neighbor along edge E is Hex + Dir[E].
    // We want Neighbor to be distance > 2 (out of board).
    // CUBE_DIRECTIONS order usually matches 0-5 edge indexing.
    // 0: (1, 0, -1), 1: (1, -1, 0)...

    // We need to import CUBE_DIRECTIONS or redefine.
    // Let's copy simple logic: check all 6 neighbors, find one that is NOT in the board (radius > 2).
    // Actually, corner hexes (radius 2) have 2 or 3 edges facing out.
    // We need to pick one consistently strictly for rendering?
    // Or just pick the "most outward" one.
    // Most outward = direction vector that has smallest angle to position vector?
    // dot product of (dir_vec, pos_vec) should be maximal.

    let bestEdge = 0;
    let maxDist = -1;

    // Directions from coordinates.ts (replicated here to match index 0-5)
    const DIRS = [
      { q: 1, r: 0, s: -1 },
      { q: 1, r: -1, s: 0 },
      { q: 0, r: -1, s: 1 },
      { q: -1, r: 0, s: 1 },
      { q: -1, r: 1, s: 0 },
      { q: 0, r: 1, s: -1 },
    ];
    // Map DIRS index to visual edge index (0-5)
    // DIRS are: East, NE, NW, West, SW, SE (in terms of q,r changes?)
    // Actually:
    // (1,0) -> East (Prop 0)
    // (1,-1) -> NE (Prop 5)
    // (0,-1) -> NW (Prop 4)
    // (-1,0) -> West (Prop 3)
    // (-1,1) -> SW (Prop 2)
    // (0,1) -> SE (Prop 1)
    const DIRS_TO_EDGE_MAP = [0, 5, 4, 3, 2, 1];

    // We find the direction that extends furthest from center AND is most aligned with position
    let bestEdgeIndex = -1;
    let maxAlignment = -Infinity;

    for (let e = 0; e < 6; e++) {
      const d = DIRS[e];
      const nQ = hex.q + d.q;
      const nR = hex.r + d.r;
      const nS = -hex.q - hex.r + d.s; // s = -q-r

      const dist = (Math.abs(nQ) + Math.abs(nR) + Math.abs(nS)) / 2;

      // Must be an external edge (neighbor is outside the board)
      if (dist > 2) {
        // Calculate alignment (dot product) between Position and Direction
        // Hex to pixel conversion (approximate for comparison):
        // x = q + r/2
        // y = r * sqrt(3)/2
        // Dot product = (P.x * D.x) + (P.y * D.y)

        // Position vector components
        const px = hex.q + hex.r * 0.5;
        const py = hex.r * 0.866;

        // Direction vector components
        const dx = d.q + d.r * 0.5;
        const dy = d.r * 0.866;

        const alignment = px * dx + py * dy;

        if (alignment > maxAlignment) {
          maxAlignment = alignment;
          bestEdgeIndex = e;
        }
      }
    }

    if (bestEdgeIndex !== -1) {
      const visualEdge = DIRS_TO_EDGE_MAP[bestEdgeIndex];

      ports.push({
        type,
        hexQ: hex.q,
        hexR: hex.r,
        edge: visualEdge,
      });
    }
  });

  return ports;
}
