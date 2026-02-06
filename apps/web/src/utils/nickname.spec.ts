/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateRandomNickname, getNickname } from './nickname';

describe('Nickname utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('generateRandomNickname', () => {
    it('should generate a nickname with two words', () => {
      const nickname = generateRandomNickname();
      const words = nickname.split(' ');
      expect(words).toHaveLength(2);
    });

    it('should generate a nickname between 2 and 30 characters', () => {
      const nickname = generateRandomNickname();
      expect(nickname.length).toBeGreaterThanOrEqual(2);
      expect(nickname.length).toBeLessThanOrEqual(30);
    });

    it('should generate different nicknames on multiple calls (statistically)', () => {
      const nicknames = new Set();
      for (let i = 0; i < 20; i++) {
        nicknames.add(generateRandomNickname());
      }
      // Should have at least some variety (not all the same)
      expect(nicknames.size).toBeGreaterThan(1);
    });
  });

  describe('getNickname', () => {
    it('should generate and save a new nickname when localStorage is empty', () => {
      const nickname = getNickname();
      expect(nickname.length).toBeGreaterThanOrEqual(2);
      expect(localStorage.getItem('catan_nickname')).toBe(nickname);
    });

    it('should return existing nickname from localStorage', () => {
      localStorage.setItem('catan_nickname', 'Stored Nickname');
      const nickname = getNickname();
      expect(nickname).toBe('Stored Nickname');
    });

    it('should generate new nickname if stored nickname is too short', () => {
      localStorage.setItem('catan_nickname', 'A');
      const nickname = getNickname();
      expect(nickname).not.toBe('A');
      expect(nickname.length).toBeGreaterThanOrEqual(2);
    });

    it('should trim whitespace from stored nickname', () => {
      localStorage.setItem('catan_nickname', '  Valid Name  ');
      const nickname = getNickname();
      expect(nickname).toBe('Valid Name');
    });

    it('should generate new nickname if stored value is only whitespace', () => {
      localStorage.setItem('catan_nickname', '   ');
      const nickname = getNickname();
      expect(nickname.length).toBeGreaterThanOrEqual(2);
      expect(nickname.trim().length).toBeGreaterThanOrEqual(2);
    });
  });
});
