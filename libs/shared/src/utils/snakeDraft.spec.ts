import { describe, it, expect } from 'vitest';
import {
  DraftPosition,
  calculateDraftPosition,
  isSetupComplete,
} from './snakeDraft';

describe('calculateDraftPosition', () => {
  describe('4 players', () => {
    // Round 1: Forward order (1→2→3→4)
    it('turn 0: player 0, settlement', () => {
      expect(calculateDraftPosition(0, 4)).toEqual({
        round: 1,
        playerIndex: 0,
        phase: 'settlement',
      });
    });
    it('turn 1: player 0, road', () => {
      expect(calculateDraftPosition(1, 4)).toEqual({
        round: 1,
        playerIndex: 0,
        phase: 'road',
      });
    });
    it('turn 6: player 3, settlement', () => {
      expect(calculateDraftPosition(6, 4)).toEqual({
        round: 1,
        playerIndex: 3,
        phase: 'settlement',
      });
    });
    it('turn 7: player 3, road', () => {
      expect(calculateDraftPosition(7, 4)).toEqual({
        round: 1,
        playerIndex: 3,
        phase: 'road',
      });
    });

    // Round 2: Reverse order (4→3→2→1)
    it('turn 8: player 3, settlement (round 2 starts)', () => {
      expect(calculateDraftPosition(8, 4)).toEqual({
        round: 2,
        playerIndex: 3,
        phase: 'settlement',
      });
    });
    it('turn 14: player 0, settlement', () => {
      expect(calculateDraftPosition(14, 4)).toEqual({
        round: 2,
        playerIndex: 0,
        phase: 'settlement',
      });
    });
    it('turn 15: player 0, road (last turn)', () => {
      expect(calculateDraftPosition(15, 4)).toEqual({
        round: 2,
        playerIndex: 0,
        phase: 'road',
      });
    });
  });

  describe('3 players', () => {
    it('turn 5: player 2, road', () => {
      expect(calculateDraftPosition(5, 3)).toEqual({
        round: 1,
        playerIndex: 2,
        phase: 'road',
      });
    });
    it('turn 6: player 2, settlement (round 2)', () => {
      expect(calculateDraftPosition(6, 3)).toEqual({
        round: 2,
        playerIndex: 2,
        phase: 'settlement',
      });
    });
    it('turn 11: player 0, road (last turn)', () => {
      expect(calculateDraftPosition(11, 3)).toEqual({
        round: 2,
        playerIndex: 0,
        phase: 'road',
      });
    });
  });
});

describe('isSetupComplete', () => {
  it('returns false during setup', () => {
    expect(isSetupComplete(15, 4)).toBe(false);
  });
  it('returns true after setup', () => {
    expect(isSetupComplete(16, 4)).toBe(true);
  });
});
