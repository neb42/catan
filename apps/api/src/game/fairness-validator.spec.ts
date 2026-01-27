import { describe, it, expect } from 'vitest';
import { validateBoardFairness } from './fairness-validator';
import { Hex, TerrainType } from './types';

describe('validateBoardFairness', () => {
    function createHex(q: number, r: number, num: number | null, terrain: TerrainType = 'fields'): Hex {
        return { q, r, number: num, terrain };
    }

    it('should pass for a board with no adjacent 6s or 8s', () => {
        // Simple case: two hexes far apart
        const hexes: Hex[] = [
            createHex(0, 0, 6),
            createHex(2, 0, 8), // Distance 2
        ];
        expect(validateBoardFairness(hexes)).toBe(true);
    });

    it('should fail if 6 is adjacent to 8', () => {
        const hexes: Hex[] = [
            createHex(0, 0, 6),
            createHex(1, 0, 8), // Adjacent
        ];
        expect(validateBoardFairness(hexes)).toBe(false);
    });

    it('should fail if 6 is adjacent to 6', () => {
        const hexes: Hex[] = [
            createHex(0, 0, 6),
            createHex(1, 0, 6), // Adjacent
        ];
        expect(validateBoardFairness(hexes)).toBe(false);
    });

    it('should fail if 8 is adjacent to 8', () => {
        const hexes: Hex[] = [
            createHex(0, 0, 8),
            createHex(0, 1, 8), // Adjacent
        ];
        expect(validateBoardFairness(hexes)).toBe(false);
    });
    
    it('should pass if 6/8 adjacent to other numbers', () => {
         const hexes: Hex[] = [
            createHex(0, 0, 6),
            createHex(1, 0, 5), 
            createHex(-1, 0, 9),
            createHex(0, 1, 8),
            createHex(0, 2, 4)
        ];
        // 0,0(6) next to 1,0(5) -> OK
        // 0,1(8) next to 0,0(6) -> FAIL! wait, 0,1 is neighbor of 0,0?
        // neighbors: (1,0), (1,-1), (0,-1), (-1,0), (-1,1), (0,1).
        // Yes, (0,1) is neighbor of (0,0). So this should fail.
        expect(validateBoardFairness(hexes)).toBe(false);
    });

    it('should pass if 6 adjacent to 5', () => {
        const hexes: Hex[] = [
            createHex(0, 0, 6),
            createHex(1, 0, 5),
        ];
        expect(validateBoardFairness(hexes)).toBe(true);
    });
});
