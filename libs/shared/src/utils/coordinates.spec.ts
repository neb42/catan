import { describe, it, expect } from 'vitest';
import { getCatanHexPositions, getNeighbors, axialToCube, cubeToAxial, hexToPixel, getPortPosition } from './coordinates';

describe('Coordinates Utilities', () => {
  describe('getCatanHexPositions', () => {
    it('should return exactly 19 positions', () => {
      const positions = getCatanHexPositions();
      expect(positions).toHaveLength(19);
    });

    it('should include the center (0,0)', () => {
      const positions = getCatanHexPositions();
      expect(positions).toContainEqual({ q: 0, r: 0 });
    });

    it('should have unique positions', () => {
        const positions = getCatanHexPositions();
        const set = new Set(positions.map(p => `${p.q},${p.r}`));
        expect(set.size).toBe(19);
    });
  });

  describe('getNeighbors', () => {
    it('should return 6 neighbors', () => {
      const neighbors = getNeighbors({ q: 0, r: 0 });
      expect(neighbors).toHaveLength(6);
    });

    it('should return correct neighbors for center', () => {
      const neighbors = getNeighbors({ q: 0, r: 0 });
      // One neighbor should be (1, 0)
      expect(neighbors).toContainEqual({ q: 1, r: 0 });
      // Check all 6 directions
      const expected = [
        { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
        { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
      ];
      expected.forEach(e => expect(neighbors).toContainEqual(e));
    });
  });

  describe('Conversions', () => {
    it('should convert axial to cube and back', () => {
        const ax = { q: 2, r: -1 };
        const cube = axialToCube(ax);
        expect(cube).toEqual({ q: 2, r: -1, s: -1 }); // 2 + (-1) + (-1) = 0
        const back = cubeToAxial(cube);
        expect(back).toEqual(ax);
    });
  });

  describe('Visual Coordinates', () => {
    it('hexToPixel should account for spacing', () => {
      const coord = { q: 1, r: 0 }; // Use simple coord to test x scaling
      const size = { x: 10, y: 10 };
      
      const p1 = hexToPixel(coord, size, 1);
      const p2 = hexToPixel(coord, size, 2);
      
      expect(p2.x).toBeCloseTo(p1.x * 2);
      expect(p2.y).toBeCloseTo(p1.y * 2);
    });

    it('getPortPosition should account for spacing in hex center calculation', () => {
       const q = 1, r = 0, edge = 0;
       const size = { x: 10, y: 10 };
       const distance = 15;
       
       const p1 = getPortPosition(q, r, edge, size, distance, 1);
       const p2 = getPortPosition(q, r, edge, size, distance, 2);
       
       const c1 = hexToPixel({ q, r }, size, 1);
       const c2 = hexToPixel({ q, r }, size, 2);
       
       // The offset from center should be identical (distance is not scaled)
       expect(p1.x - c1.x).toBeCloseTo(p2.x - c2.x);
       expect(p1.y - c1.y).toBeCloseTo(p2.y - c2.y);
       
       // The absolute positions should be different due to center shift
       expect(p1.x).not.toBeCloseTo(p2.x);
    });
  });
});
