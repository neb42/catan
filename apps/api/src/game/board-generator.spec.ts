import { describe, it, expect } from 'vitest';
import { generateBoard } from './board-generator';
import { validateBoardFairness } from './fairness-validator';
import { Hex, PortType, TerrainType } from './types';

describe('generateBoard', () => {
    it('should generate a valid board', () => {
        const board = generateBoard();
        
        // 1. Check Hex count
        expect(board.hexes).toHaveLength(19);
        
        // 2. Check Terrain counts
        const terrains = board.hexes.map(h => h.terrain);
        const counts: Record<string, number> = {};
        terrains.forEach(t => counts[t] = (counts[t] || 0) + 1);
        
        expect(counts['forest']).toBe(4);
        expect(counts['fields']).toBe(4);
        expect(counts['pasture']).toBe(4);
        expect(counts['hills']).toBe(3);
        expect(counts['mountains']).toBe(3);
        expect(counts['desert']).toBe(1);
        
        // 3. Check numbers
        const numbers = board.hexes
            .filter(h => h.terrain !== 'desert')
            .map(h => h.number)
            .sort((a,b) => (a||0) - (b||0));
            
        // Expected: 2, 3,3, 4,4, 5,5, 6,6, 8,8, 9,9, 10,10, 11,11, 12
        const expectedNumbers = [2, 3,3, 4,4, 5,5, 6,6, 8,8, 9,9, 10,10, 11,11, 12];
        expect(numbers).toEqual(expectedNumbers);
        
        // Desert should have no number
        const desert = board.hexes.find(h => h.terrain === 'desert');
        expect(desert?.number).toBeNull();
        
        // 4. Fairness
        expect(validateBoardFairness(board.hexes)).toBe(true);
        
        // 5. Ports
        expect(board.ports).toHaveLength(9);
        const portTypes = board.ports.map(p => p.type);
        const portCounts: Record<string, number> = {};
        portTypes.forEach(p => portCounts[p] = (portCounts[p] || 0) + 1);
        
        expect(portCounts['generic']).toBe(4);
        expect(portCounts['wood']).toBe(1);
        expect(portCounts['brick']).toBe(1);
        expect(portCounts['sheep']).toBe(1);
        expect(portCounts['wheat']).toBe(1);
        expect(portCounts['ore']).toBe(1);
    });
    
    it('can generate multiple fair boards quickly', () => {
        const attempts = 50;
        const start = performance.now();
        for (let i=0; i<attempts; i++) {
             const board = generateBoard();
             expect(validateBoardFairness(board.hexes)).toBe(true);
        }
        const end = performance.now();
        // Should be reasonably fast (e.g., < 2000ms for 50 boards)
        expect(end - start).toBeLessThan(2000);
    });
});
