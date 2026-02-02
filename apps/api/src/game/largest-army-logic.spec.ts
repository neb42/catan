import { describe, it, expect } from 'vitest';
import {
  recalculateLargestArmy,
  LargestArmyResult,
} from './largest-army-logic';

describe('recalculateLargestArmy', () => {
  // ============================================================================
  // MINIMUM THRESHOLD TESTS (3 knights required)
  // ============================================================================

  describe('minimum threshold', () => {
    it('returns no holder when no player has 3 knights', () => {
      const knightCounts = { p1: 2, p2: 1, p3: 0 };
      const currentState = { holderId: null, knights: 0 };

      const result = recalculateLargestArmy(knightCounts, currentState);

      expect(result.newState.holderId).toBeNull();
      expect(result.newState.knights).toBe(0);
      expect(result.transferred).toBe(false);
    });

    it('awards to first player reaching 3 knights', () => {
      const knightCounts = { p1: 3, p2: 2, p3: 1 };
      const currentState = { holderId: null, knights: 0 };

      const result = recalculateLargestArmy(knightCounts, currentState);

      expect(result.newState.holderId).toBe('p1');
      expect(result.newState.knights).toBe(3);
      expect(result.transferred).toBe(true);
      expect(result.toPlayerId).toBe('p1');
      expect(result.fromPlayerId).toBeUndefined();
    });

    it('awards to player exactly at 3 knights when others below', () => {
      const knightCounts = { p1: 0, p2: 3, p3: 2 };
      const currentState = { holderId: null, knights: 0 };

      const result = recalculateLargestArmy(knightCounts, currentState);

      expect(result.newState.holderId).toBe('p2');
      expect(result.newState.knights).toBe(3);
      expect(result.transferred).toBe(true);
    });
  });

  // ============================================================================
  // TIE-BREAKING TESTS (current holder favored)
  // ============================================================================

  describe('tie-breaking', () => {
    it('current holder retains when tied with challenger', () => {
      const knightCounts = { p1: 4, p2: 4 };
      const currentState = { holderId: 'p1', knights: 4 };

      const result = recalculateLargestArmy(knightCounts, currentState);

      expect(result.newState.holderId).toBe('p1');
      expect(result.newState.knights).toBe(4);
      expect(result.transferred).toBe(false);
    });

    it('current holder retains when matched by challenger (not exceeded)', () => {
      const knightCounts = { p1: 3, p2: 3, p3: 2 };
      const currentState = { holderId: 'p1', knights: 3 };

      const result = recalculateLargestArmy(knightCounts, currentState);

      expect(result.newState.holderId).toBe('p1');
      expect(result.newState.knights).toBe(3);
      expect(result.transferred).toBe(false);
    });

    it('no one gets award when multiple players tie at 3+ and no current holder', () => {
      const knightCounts = { p1: 3, p2: 3, p3: 1 };
      const currentState = { holderId: null, knights: 0 };

      const result = recalculateLargestArmy(knightCounts, currentState);

      expect(result.newState.holderId).toBeNull();
      expect(result.newState.knights).toBe(0);
      expect(result.transferred).toBe(false);
    });

    it('holder loses to tied players when holder drops below', () => {
      // Edge case: holder had 4, but their count isn't in the map
      // (This shouldn't happen in practice, but test defensive behavior)
      const knightCounts = { p1: 3, p2: 3 };
      const currentState = { holderId: 'p3', knights: 4 }; // p3 not in counts

      const result = recalculateLargestArmy(knightCounts, currentState);

      // Tie between p1 and p2, neither wins, current holder loses
      expect(result.newState.holderId).toBeNull();
      expect(result.transferred).toBe(true);
      expect(result.fromPlayerId).toBe('p3');
    });
  });

  // ============================================================================
  // TRANSFER TESTS (challenger must exceed)
  // ============================================================================

  describe('award transfer', () => {
    it('transfers when challenger exceeds current holder', () => {
      const knightCounts = { p1: 4, p2: 5, p3: 2 };
      const currentState = { holderId: 'p1', knights: 4 };

      const result = recalculateLargestArmy(knightCounts, currentState);

      expect(result.newState.holderId).toBe('p2');
      expect(result.newState.knights).toBe(5);
      expect(result.transferred).toBe(true);
      expect(result.fromPlayerId).toBe('p1');
      expect(result.toPlayerId).toBe('p2');
    });

    it('holder retains when challengers below holder count', () => {
      const knightCounts = { p1: 5, p2: 3, p3: 4 };
      const currentState = { holderId: 'p1', knights: 5 };

      const result = recalculateLargestArmy(knightCounts, currentState);

      expect(result.newState.holderId).toBe('p1');
      expect(result.newState.knights).toBe(5);
      expect(result.transferred).toBe(false);
    });

    it('holder retains and updates count when increasing own knights', () => {
      const knightCounts = { p1: 6, p2: 3, p3: 4 };
      const currentState = { holderId: 'p1', knights: 5 };

      const result = recalculateLargestArmy(knightCounts, currentState);

      expect(result.newState.holderId).toBe('p1');
      expect(result.newState.knights).toBe(6);
      expect(result.transferred).toBe(false);
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('edge cases', () => {
    it('handles empty knight counts', () => {
      const knightCounts: Record<string, number> = {};
      const currentState = { holderId: null, knights: 0 };

      const result = recalculateLargestArmy(knightCounts, currentState);

      expect(result.newState.holderId).toBeNull();
      expect(result.newState.knights).toBe(0);
      expect(result.transferred).toBe(false);
    });

    it('handles single player with 3+ knights', () => {
      const knightCounts = { p1: 5 };
      const currentState = { holderId: null, knights: 0 };

      const result = recalculateLargestArmy(knightCounts, currentState);

      expect(result.newState.holderId).toBe('p1');
      expect(result.newState.knights).toBe(5);
      expect(result.transferred).toBe(true);
    });

    it('removes holder when they drop below minimum (3)', () => {
      // This can happen if we track knight counts and somehow they decrease
      // (shouldn't happen in normal play, but defensive)
      const knightCounts = { p1: 2, p2: 1 };
      const currentState = { holderId: 'p1', knights: 3 };

      const result = recalculateLargestArmy(knightCounts, currentState);

      expect(result.newState.holderId).toBeNull();
      expect(result.newState.knights).toBe(0);
      expect(result.transferred).toBe(true);
      expect(result.fromPlayerId).toBe('p1');
    });

    it('returns knight counts for all players', () => {
      const knightCounts = { p1: 4, p2: 2, p3: 3 };
      const currentState = { holderId: null, knights: 0 };

      const result = recalculateLargestArmy(knightCounts, currentState);

      expect(result.knightCounts).toEqual(knightCounts);
    });
  });
});
