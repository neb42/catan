import { describe, it, expect } from 'vitest';
import { getCatanHexPositions, getNeighbors, axialToCube, cubeToAxial } from './coordinates';

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
});
