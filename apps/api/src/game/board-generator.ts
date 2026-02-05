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

  /* Port placement logic:
  - There are 9 ports, placed on the edges of the board (ring 2 hexes).
  - We have a pre-determined list of hex indices and edge directions for port placement to ensure even distribution and visual consistency.
  - We shuffle the port types and assign them to these predetermined locations.
  - This approach is based on the standard Catan base game layout, which has specific hexes and edges designated for ports to maintain balance and aesthetics.
  */
  const ports: Port[] = [];

  const portIndices = [0, 1, 2, 4, 5, 6, 8, 9, 10]; // Pre-determined hex indices for port placement (from sorted edgeHexes)
  const portEdges =   [3, 4, 5, 5, 0, 1, 1, 2, 3]; // Pre-determined edge directions for visual consistency

  portIndices.forEach((hexIndex, i) => {
    const hex = edgeHexes[hexIndex];
    const type = shuffledPorts[i];
    const edge = portEdges[i];

    ports.push({
      type,
      hexQ: hex.q,
      hexR: hex.r,
      edge,
    });
  });

  return ports;
}
