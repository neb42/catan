import { getNeighbors } from '../../../../libs/shared/src';
import { Hex } from './types';

/**
 * Validates if the generated board meets fairness criteria.
 * @param hexes List of hexes on the board
 * @returns boolean true if board is fair
 */
export function validateBoardFairness(hexes: Hex[]): boolean {
  // 1. Check for adjacent 6s and 8s
  // "User never observes adjacent 6 and 8 number tokens"
  // This usually implies no 6 adjacent to 6, no 8 adjacent to 8, and no 6 adjacent to 8?
  // Standard rule: 6s and 8s cannot touch each other. (Any red number cannot touch any red number)
  
  const highNumbers = new Set([6, 8]);

  for (const hex of hexes) {
    if (hex.number !== null && highNumbers.has(hex.number)) {
      const neighbors = getNeighbors({ q: hex.q, r: hex.r });
      
      for (const neighborPos of neighbors) {
        const neighborHex = hexes.find(h => h.q === neighborPos.q && h.r === neighborPos.r);
        if (neighborHex && neighborHex.number !== null) {
          if (highNumbers.has(neighborHex.number)) {
             // Found a 6 or 8 adjacent to a 6 or 8
             return false;
          }
        }
      }
    }
  }

  // 2. Resource diversity check (Basic implementation)
  // Ensure we don't have too many of the same resource clustered?
  // Or just rely on random shuffle. The "no adjacent red numbers" is the critical rule.
  
  return true;
}
