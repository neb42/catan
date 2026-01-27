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

    it('should generate ports facing outwards (external neighbors)', () => {
        const board = generateBoard();

        // Edge index to neighbor delta (q, r)
        // Based on logic: 
        // 0 -> (1, 0)
        // 1 -> (0, 1)
        // 2 -> (-1, 1)
        // 3 -> (-1, 0)
        // 4 -> (0, -1)
        // 5 -> (1, -1)
        // Note: This must match the backend's implicit visual edge mapping
        const EDGE_DELTAS: {q: number, r: number}[] = [
            { q: 1, r: 0 },   // Edge 0
            { q: 0, r: 1 },   // Edge 1
            { q: -1, r: 1 },  // Edge 2
            { q: -1, r: 0 },  // Edge 3
            { q: 0, r: -1 },  // Edge 4
            { q: 1, r: -1 }   // Edge 5
        ];

        board.ports.forEach(port => {
            const delta = EDGE_DELTAS[port.edge];
            const nQ = port.hexQ + delta.q;
            const nR = port.hexR + delta.r;
            const nS = -nQ - nR;

            const dist = (Math.abs(nQ) + Math.abs(nR) + Math.abs(nS)) / 2;
            
            // Expected distance for external neighbor of ring 2 is 3 (or more)
            expect(dist).toBeGreaterThan(2); 
            
            // Specifically check the reported failing cases if they appear
            if (port.hexQ === 2 && port.hexR === 0) {
                // Must be edge 0 or 1 or 5
                expect([0, 1, 5]).toContain(port.edge);
            }
             if (port.hexQ === 1 && port.hexR === 1) {
                // Expected edges for (1,1) are 0 or 1.
                expect([0, 1]).toContain(port.edge);
            }
        });
    });
});
