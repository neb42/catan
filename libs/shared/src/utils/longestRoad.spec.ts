import { describe, it, expect } from 'vitest';
import { calculatePlayerLongestRoad } from './longestRoad';
import { Road, Settlement } from '../schemas/game';

describe('calculatePlayerLongestRoad', () => {
  const player1 = 'player-1';
  const player2 = 'player-2';

  // Helper to create roads with edgeId format "vertexA|vertexB"
  const road = (edgeId: string, playerId: string): Road => ({
    edgeId,
    playerId,
  });

  // Helper to create settlements
  const settlement = (vertexId: string, playerId: string): Settlement => ({
    vertexId,
    playerId,
    isCity: false,
  });

  describe('basic cases', () => {
    it('should return 0 for empty roads array', () => {
      const roads: Road[] = [];
      const settlements: Settlement[] = [];

      expect(calculatePlayerLongestRoad(roads, settlements, player1)).toBe(0);
    });

    it('should return 1 for a single road', () => {
      const roads: Road[] = [road('A|B', player1)];
      const settlements: Settlement[] = [];

      expect(calculatePlayerLongestRoad(roads, settlements, player1)).toBe(1);
    });

    it('should return 0 when player has no roads', () => {
      const roads: Road[] = [road('A|B', player2)];
      const settlements: Settlement[] = [];

      expect(calculatePlayerLongestRoad(roads, settlements, player1)).toBe(0);
    });
  });

  describe('linear roads', () => {
    it('should count 5 connected roads in a line', () => {
      // A - B - C - D - E - F (5 edges)
      const roads: Road[] = [
        road('A|B', player1),
        road('B|C', player1),
        road('C|D', player1),
        road('D|E', player1),
        road('E|F', player1),
      ];
      const settlements: Settlement[] = [];

      expect(calculatePlayerLongestRoad(roads, settlements, player1)).toBe(5);
    });
  });

  describe('forked roads (Y-shape)', () => {
    it('should find longest path in Y-shaped network', () => {
      // A - B - C (stem = 2)
      //     |
      //     D (branch = 1)
      // Max path: A-B-C = 2 edges or A-B-D = 2 edges (can't traverse both branches)
      const roads: Road[] = [
        road('A|B', player1),
        road('B|C', player1),
        road('B|D', player1),
      ];
      const settlements: Settlement[] = [];

      expect(calculatePlayerLongestRoad(roads, settlements, player1)).toBe(2);
    });

    it('should find longest path in complex fork', () => {
      // A - B - C - D (3 roads)
      //     |
      //     E - F (2 roads)
      // Max path: A-B-C-D = 3 or A-B-E-F = 3
      const roads: Road[] = [
        road('A|B', player1),
        road('B|C', player1),
        road('C|D', player1),
        road('B|E', player1),
        road('E|F', player1),
      ];
      const settlements: Settlement[] = [];

      expect(calculatePlayerLongestRoad(roads, settlements, player1)).toBe(4);
    });
  });

  describe('loop handling', () => {
    it('should correctly count a loop of 6 roads', () => {
      // A - B - C
      // |       |
      // F - E - D
      // 6 edges in a circle = 6 roads
      const roads: Road[] = [
        road('A|B', player1),
        road('B|C', player1),
        road('C|D', player1),
        road('D|E', player1),
        road('E|F', player1),
        road('F|A', player1),
      ];
      const settlements: Settlement[] = [];

      expect(calculatePlayerLongestRoad(roads, settlements, player1)).toBe(6);
    });

    it('should handle loop with tail correctly', () => {
      // G - A - B - C
      //     |       |
      //     F - E - D
      // Loop of 6 + 1 tail = max path is 7 (not 8)
      // You can traverse the loop once plus the tail
      const roads: Road[] = [
        road('A|B', player1),
        road('B|C', player1),
        road('C|D', player1),
        road('D|E', player1),
        road('E|F', player1),
        road('F|A', player1),
        road('G|A', player1), // tail
      ];
      const settlements: Settlement[] = [];

      expect(calculatePlayerLongestRoad(roads, settlements, player1)).toBe(7);
    });

    it('should handle loop with two tails correctly', () => {
      // G - A - B - C - H
      //     |       |
      //     F - E - D
      // Loop of 6 + 2 tails = 8 roads total
      // Max path is 7: G-A-B-C-D-E-F-A (uses all loop edges + one tail)
      // Or G-A-F-E-D-C-H = 6 edges
      // Best: G-A-B-C-D-E-F uses 6, then F-A is 7th edge back to A
      const roads: Road[] = [
        road('A|B', player1),
        road('B|C', player1),
        road('C|D', player1),
        road('D|E', player1),
        road('E|F', player1),
        road('F|A', player1),
        road('G|A', player1), // tail 1
        road('C|H', player1), // tail 2
      ];
      const settlements: Settlement[] = [];

      expect(calculatePlayerLongestRoad(roads, settlements, player1)).toBe(7);
    });
  });

  describe('opponent settlement blocking', () => {
    it('should count edges up to blocked vertex but not continue past', () => {
      // A - B - C - D - E (4 edges: A|B, B|C, C|D, D|E)
      // Opponent settlement at C blocks traversal THROUGH C
      // Edges B|C and C|D still count (road segments exist), but can't continue past C
      // Can traverse: A-B-C (2 edges) or D-E-C (2 edges)
      // Max path = 2
      const roads: Road[] = [
        road('A|B', player1),
        road('B|C', player1),
        road('C|D', player1),
        road('D|E', player1),
      ];
      const settlements: Settlement[] = [settlement('C', player2)];

      expect(calculatePlayerLongestRoad(roads, settlements, player1)).toBe(2);
    });

    it('should handle road broken into 3+2 segments', () => {
      // A - B - C - D - E - F (5 edges)
      // Opponent settlement at C blocks traversal
      // Segment 1: A-B-C (2 edges, can reach C but not pass)
      // Segment 2: C-D-E-F (3 edges, can reach C but not pass)
      // Max = 3
      const roads: Road[] = [
        road('A|B', player1),
        road('B|C', player1),
        road('C|D', player1),
        road('D|E', player1),
        road('E|F', player1),
      ];
      const settlements: Settlement[] = [settlement('C', player2)];

      expect(calculatePlayerLongestRoad(roads, settlements, player1)).toBe(3);
    });

    it('should count edge to blocked vertex at network endpoint', () => {
      // Opponent at A
      // A - B - C - D (3 edges)
      // Player cannot start from A, so must start from B, C, or D
      // Path from D: D-C-B-A = 3 edges (can reach A but not pass)
      // Max = 3
      const roads: Road[] = [
        road('A|B', player1),
        road('B|C', player1),
        road('C|D', player1),
      ];
      const settlements: Settlement[] = [settlement('A', player2)];

      expect(calculatePlayerLongestRoad(roads, settlements, player1)).toBe(3);
    });
  });

  describe('own settlement does NOT block', () => {
    it('should allow traversal through own settlement', () => {
      // A - B - C - D - E (4 edges)
      // Own settlement at C does NOT block
      const roads: Road[] = [
        road('A|B', player1),
        road('B|C', player1),
        road('C|D', player1),
        road('D|E', player1),
      ];
      const settlements: Settlement[] = [settlement('C', player1)];

      expect(calculatePlayerLongestRoad(roads, settlements, player1)).toBe(4);
    });
  });

  describe('disconnected segments', () => {
    it('should return max of disconnected segments', () => {
      // Segment 1: A - B - C (2 edges)
      // Segment 2: D - E - F - G (3 edges)
      // Max = 3
      const roads: Road[] = [
        road('A|B', player1),
        road('B|C', player1),
        road('D|E', player1),
        road('E|F', player1),
        road('F|G', player1),
      ];
      const settlements: Settlement[] = [];

      expect(calculatePlayerLongestRoad(roads, settlements, player1)).toBe(3);
    });
  });

  describe('multiple players', () => {
    it('should only count requesting player roads', () => {
      // Player 1: A - B - C (2 edges)
      // Player 2: D - E - F - G - H (4 edges)
      const roads: Road[] = [
        road('A|B', player1),
        road('B|C', player1),
        road('D|E', player2),
        road('E|F', player2),
        road('F|G', player2),
        road('G|H', player2),
      ];
      const settlements: Settlement[] = [];

      expect(calculatePlayerLongestRoad(roads, settlements, player1)).toBe(2);
      expect(calculatePlayerLongestRoad(roads, settlements, player2)).toBe(4);
    });
  });

  describe('complex scenarios', () => {
    it('should handle figure-8 shape', () => {
      // Two loops sharing a vertex at E
      // A - B - C
      // |   |
      // D - E - F
      //     |   |
      //     G - H
      // First loop: A-B-E-D-A (4 edges)
      // Second loop: E-C-F-H-G-E wait... let me make valid
      // Actually:
      // Loop 1: A-B, B-E, E-D, D-A = 4 edges
      // Loop 2: E-C, C-F, F-H, H-G, G-E = 5 edges? No wait...
      // Simpler: two triangles sharing E
      // Triangle 1: A-B-E-A = 3 edges
      // Triangle 2: E-C-D-E = 3 edges
      // Total unique edges = 6, longest path = 6
      const roads: Road[] = [
        road('A|B', player1),
        road('B|E', player1),
        road('E|A', player1), // triangle 1
        road('E|C', player1),
        road('C|D', player1),
        road('D|E', player1), // triangle 2
      ];
      const settlements: Settlement[] = [];

      // Max path traverses all 6 edges
      expect(calculatePlayerLongestRoad(roads, settlements, player1)).toBe(6);
    });
  });
});
