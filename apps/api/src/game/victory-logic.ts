import { OwnedDevCard, Settlement, GameStats } from '@catan/shared';

export interface VPBreakdown {
  settlements: number; // Count of non-city settlements (1 VP each)
  cities: number; // City count * 2 (2 VP each)
  longestRoad: number; // 2 if holder, 0 otherwise
  largestArmy: number; // 2 if holder, 0 otherwise
  victoryPointCards: number; // Count of VP dev cards (1 VP each)
  total: number;
}

export interface VictoryResult {
  gameEnded: boolean;
  winnerId: string | null;
  winnerVP: VPBreakdown | null;
  allPlayerVP: Record<string, VPBreakdown>;
  revealedVPCards: Array<{ playerId: string; cardCount: number }>;
  stats?: GameStats; // Optional game statistics (only present when called by GameManager)
}

export const VICTORY_POINT_THRESHOLD = 10;

/**
 * Calculate victory points breakdown for a single player.
 *
 * VP Sources:
 * - Settlement: 1 VP each
 * - City: 2 VP each
 * - Longest Road: 2 VP (if holder)
 * - Largest Army: 2 VP (if holder)
 * - Victory Point cards: 1 VP each
 */
export function calculateVictoryPoints(
  playerId: string,
  settlements: Settlement[],
  longestRoadHolderId: string | null,
  largestArmyHolderId: string | null,
  playerDevCards: OwnedDevCard[],
): VPBreakdown {
  // Filter settlements to only this player's
  const playerSettlements = settlements.filter((s) => s.playerId === playerId);

  // Count settlements (non-cities) and cities
  const settlementCount = playerSettlements.filter((s) => !s.isCity).length;
  const cityCount = playerSettlements.filter((s) => s.isCity).length;

  // Award points
  const settlementPoints = settlementCount; // 1 VP each
  const cityPoints = cityCount * 2; // 2 VP each

  // Longest road: 2 VP if player is holder
  const longestRoadPoints = longestRoadHolderId === playerId ? 2 : 0;

  // Largest army: 2 VP if player is holder
  const largestArmyPoints = largestArmyHolderId === playerId ? 2 : 0;

  // Victory point cards: 1 VP each
  const vpCardCount = playerDevCards.filter(
    (card) => card.type === 'victory_point',
  ).length;

  const total =
    settlementPoints +
    cityPoints +
    longestRoadPoints +
    largestArmyPoints +
    vpCardCount;

  return {
    settlements: settlementPoints,
    cities: cityPoints,
    longestRoad: longestRoadPoints,
    largestArmy: largestArmyPoints,
    victoryPointCards: vpCardCount,
    total,
  };
}

/**
 * Check if any player has reached victory condition (10+ VP).
 *
 * Returns the first player (in order) who reaches 10+ VP as the winner.
 * Also returns VP breakdown for all players and reveals VP cards at game end.
 */
export function checkForVictory(
  playerIds: string[],
  settlements: Settlement[],
  longestRoadHolderId: string | null,
  largestArmyHolderId: string | null,
  getPlayerDevCards: (playerId: string) => OwnedDevCard[],
): VictoryResult {
  // Calculate VP for all players
  const allPlayerVP: Record<string, VPBreakdown> = {};
  for (const playerId of playerIds) {
    allPlayerVP[playerId] = calculateVictoryPoints(
      playerId,
      settlements,
      longestRoadHolderId,
      largestArmyHolderId,
      getPlayerDevCards(playerId),
    );
  }

  // Find first player with 10+ VP (order matters)
  let winnerId: string | null = null;
  for (const playerId of playerIds) {
    if (allPlayerVP[playerId].total >= VICTORY_POINT_THRESHOLD) {
      winnerId = playerId;
      break;
    }
  }

  // If no winner, game continues
  if (winnerId === null) {
    return {
      gameEnded: false,
      winnerId: null,
      winnerVP: null,
      allPlayerVP,
      revealedVPCards: [],
    };
  }

  // Game ended - reveal all VP cards
  const revealedVPCards: Array<{ playerId: string; cardCount: number }> = [];
  for (const playerId of playerIds) {
    const vpCardCount = allPlayerVP[playerId].victoryPointCards;
    if (vpCardCount > 0) {
      revealedVPCards.push({ playerId, cardCount: vpCardCount });
    }
  }

  return {
    gameEnded: true,
    winnerId,
    winnerVP: allPlayerVP[winnerId],
    allPlayerVP,
    revealedVPCards,
  };
}
