import { describe, it, expect } from 'vitest';
import { OwnedDevCard, Settlement } from '@catan/shared';
import {
  calculateVictoryPoints,
  checkForVictory,
  VICTORY_POINT_THRESHOLD,
  VPBreakdown,
  VictoryResult,
} from './victory-logic';

describe('calculateVictoryPoints', () => {
  const playerId = 'player-1';
  const otherId = 'player-2';

  describe('settlements and cities', () => {
    it('returns 0 VP for player with no settlements, awards, or VP cards', () => {
      const result = calculateVictoryPoints(playerId, [], null, null, []);

      expect(result.settlements).toBe(0);
      expect(result.cities).toBe(0);
      expect(result.longestRoad).toBe(0);
      expect(result.largestArmy).toBe(0);
      expect(result.victoryPointCards).toBe(0);
      expect(result.total).toBe(0);
    });

    it('returns 2 VP for 2 settlements only', () => {
      const settlements: Settlement[] = [
        { vertexId: 'v1', playerId, isCity: false },
        { vertexId: 'v2', playerId, isCity: false },
      ];

      const result = calculateVictoryPoints(
        playerId,
        settlements,
        null,
        null,
        [],
      );

      expect(result.settlements).toBe(2);
      expect(result.cities).toBe(0);
      expect(result.total).toBe(2);
    });

    it('returns 2 VP for 1 city only (cities are worth 2 VP)', () => {
      const settlements: Settlement[] = [
        { vertexId: 'v1', playerId, isCity: true },
      ];

      const result = calculateVictoryPoints(
        playerId,
        settlements,
        null,
        null,
        [],
      );

      expect(result.settlements).toBe(0);
      expect(result.cities).toBe(2); // 1 city * 2 VP
      expect(result.total).toBe(2);
    });

    it('returns 4 VP for 2 settlements + 1 city', () => {
      const settlements: Settlement[] = [
        { vertexId: 'v1', playerId, isCity: false },
        { vertexId: 'v2', playerId, isCity: false },
        { vertexId: 'v3', playerId, isCity: true },
      ];

      const result = calculateVictoryPoints(
        playerId,
        settlements,
        null,
        null,
        [],
      );

      expect(result.settlements).toBe(2); // 2 settlements * 1 VP
      expect(result.cities).toBe(2); // 1 city * 2 VP
      expect(result.total).toBe(4);
    });

    it('does not count other players settlements', () => {
      const settlements: Settlement[] = [
        { vertexId: 'v1', playerId, isCity: false },
        { vertexId: 'v2', playerId: otherId, isCity: false },
        { vertexId: 'v3', playerId: otherId, isCity: true },
      ];

      const result = calculateVictoryPoints(
        playerId,
        settlements,
        null,
        null,
        [],
      );

      expect(result.settlements).toBe(1);
      expect(result.cities).toBe(0);
      expect(result.total).toBe(1);
    });
  });

  describe('longest road award', () => {
    it('adds 2 VP when player has longest road', () => {
      const settlements: Settlement[] = [
        { vertexId: 'v1', playerId, isCity: false },
      ];

      const result = calculateVictoryPoints(
        playerId,
        settlements,
        playerId, // has longest road
        null,
        [],
      );

      expect(result.settlements).toBe(1);
      expect(result.longestRoad).toBe(2);
      expect(result.total).toBe(3);
    });

    it('does not add VP when another player has longest road', () => {
      const result = calculateVictoryPoints(
        playerId,
        [],
        otherId, // other player has longest road
        null,
        [],
      );

      expect(result.longestRoad).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe('largest army award', () => {
    it('adds 2 VP when player has largest army', () => {
      const settlements: Settlement[] = [
        { vertexId: 'v1', playerId, isCity: false },
      ];

      const result = calculateVictoryPoints(
        playerId,
        settlements,
        null,
        playerId, // has largest army
        [],
      );

      expect(result.settlements).toBe(1);
      expect(result.largestArmy).toBe(2);
      expect(result.total).toBe(3);
    });

    it('does not add VP when another player has largest army', () => {
      const result = calculateVictoryPoints(
        playerId,
        [],
        null,
        otherId, // other player has largest army
        [],
      );

      expect(result.largestArmy).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe('victory point cards', () => {
    it('adds 1 VP per VP dev card', () => {
      const devCards: OwnedDevCard[] = [
        { id: 'card-1', type: 'victory_point', purchasedOnTurn: 1 },
        { id: 'card-2', type: 'victory_point', purchasedOnTurn: 2 },
      ];

      const result = calculateVictoryPoints(playerId, [], null, null, devCards);

      expect(result.victoryPointCards).toBe(2);
      expect(result.total).toBe(2);
    });

    it('does not count non-VP dev cards', () => {
      const devCards: OwnedDevCard[] = [
        { id: 'card-1', type: 'knight', purchasedOnTurn: 1 },
        { id: 'card-2', type: 'road_building', purchasedOnTurn: 2 },
        { id: 'card-3', type: 'victory_point', purchasedOnTurn: 3 },
      ];

      const result = calculateVictoryPoints(playerId, [], null, null, devCards);

      expect(result.victoryPointCards).toBe(1);
      expect(result.total).toBe(1);
    });
  });

  describe('full combination', () => {
    it('calculates 9 VP for 2 settlements, 1 city, longest road, largest army, and 1 VP card', () => {
      const settlements: Settlement[] = [
        { vertexId: 'v1', playerId, isCity: false },
        { vertexId: 'v2', playerId, isCity: false },
        { vertexId: 'v3', playerId, isCity: true },
      ];
      const devCards: OwnedDevCard[] = [
        { id: 'card-1', type: 'victory_point', purchasedOnTurn: 1 },
      ];

      const result = calculateVictoryPoints(
        playerId,
        settlements,
        playerId, // has longest road
        playerId, // has largest army
        devCards,
      );

      expect(result.settlements).toBe(2); // 2 VP
      expect(result.cities).toBe(2); // 2 VP
      expect(result.longestRoad).toBe(2); // 2 VP
      expect(result.largestArmy).toBe(2); // 2 VP
      expect(result.victoryPointCards).toBe(1); // 1 VP
      expect(result.total).toBe(9);
    });
  });
});

describe('checkForVictory', () => {
  const player1 = 'player-1';
  const player2 = 'player-2';
  const player3 = 'player-3';

  // Helper to create dev cards for a player
  const createDevCards = (
    vpCount: number,
    playerId: string,
  ): OwnedDevCard[] => {
    return Array.from({ length: vpCount }, (_, i) => ({
      id: `card-${playerId}-${i}`,
      type: 'victory_point' as const,
      purchasedOnTurn: i + 1,
    }));
  };

  // Helper to get dev cards for a player (simulates what GameManager would provide)
  const makeGetPlayerDevCards = (
    playerCards: Record<string, OwnedDevCard[]>,
  ) => {
    return (playerId: string) => playerCards[playerId] || [];
  };

  it('returns gameEnded: false when no player at 10 VP', () => {
    const settlements: Settlement[] = [
      { vertexId: 'v1', playerId: player1, isCity: false },
      { vertexId: 'v2', playerId: player1, isCity: false },
      { vertexId: 'v3', playerId: player2, isCity: false },
    ];

    const result = checkForVictory(
      [player1, player2],
      settlements,
      null,
      null,
      () => [],
    );

    expect(result.gameEnded).toBe(false);
    expect(result.winnerId).toBeNull();
    expect(result.winnerVP).toBeNull();
    expect(result.allPlayerVP[player1].total).toBe(2);
    expect(result.allPlayerVP[player2].total).toBe(1);
  });

  it('returns gameEnded: true when one player reaches exactly 10 VP', () => {
    // 2 settlements = 2 VP, 3 cities = 6 VP, longest road = 2 VP = 10 VP
    const settlements: Settlement[] = [
      { vertexId: 'v1', playerId: player1, isCity: false },
      { vertexId: 'v2', playerId: player1, isCity: false },
      { vertexId: 'v3', playerId: player1, isCity: true },
      { vertexId: 'v4', playerId: player1, isCity: true },
      { vertexId: 'v5', playerId: player1, isCity: true },
    ];

    const result = checkForVictory(
      [player1, player2],
      settlements,
      player1, // has longest road
      null,
      () => [],
    );

    expect(result.gameEnded).toBe(true);
    expect(result.winnerId).toBe(player1);
    expect(result.winnerVP?.total).toBe(10);
    expect(result.winnerVP?.settlements).toBe(2);
    expect(result.winnerVP?.cities).toBe(6);
    expect(result.winnerVP?.longestRoad).toBe(2);
  });

  it('returns first player in order when multiple players above 10 VP', () => {
    // Both players have 10+ VP - first in array wins
    // Player 1: 3 settlements + 2 cities + longest road + largest army = 3 + 4 + 2 + 2 = 11 VP
    // Player 2: 4 settlements + 2 cities + 2 VP cards = 4 + 4 + 2 = 10 VP
    const settlements: Settlement[] = [
      { vertexId: 'v1', playerId: player1, isCity: false },
      { vertexId: 'v2', playerId: player1, isCity: false },
      { vertexId: 'v3', playerId: player1, isCity: false },
      { vertexId: 'v4', playerId: player1, isCity: true },
      { vertexId: 'v5', playerId: player1, isCity: true },
      { vertexId: 'v6', playerId: player2, isCity: false },
      { vertexId: 'v7', playerId: player2, isCity: false },
      { vertexId: 'v8', playerId: player2, isCity: false },
      { vertexId: 'v9', playerId: player2, isCity: false },
      { vertexId: 'v10', playerId: player2, isCity: true },
      { vertexId: 'v11', playerId: player2, isCity: true },
    ];
    const playerCards = {
      [player2]: createDevCards(2, player2),
    };

    const result = checkForVictory(
      [player1, player2], // player1 first in order
      settlements,
      player1, // player1 has longest road
      player1, // player1 has largest army
      makeGetPlayerDevCards(playerCards),
    );

    expect(result.gameEnded).toBe(true);
    expect(result.winnerId).toBe(player1);
    expect(result.winnerVP?.total).toBe(11);
  });

  it('populates revealedVPCards when winner has VP cards', () => {
    // Winner with VP cards
    const settlements: Settlement[] = [
      { vertexId: 'v1', playerId: player1, isCity: false },
      { vertexId: 'v2', playerId: player1, isCity: false },
      { vertexId: 'v3', playerId: player1, isCity: false },
      { vertexId: 'v4', playerId: player1, isCity: true },
      { vertexId: 'v5', playerId: player1, isCity: true },
    ];
    const playerCards = {
      [player1]: createDevCards(3, player1), // 3 VP cards
      [player2]: createDevCards(1, player2), // 1 VP card
    };

    const result = checkForVictory(
      [player1, player2],
      settlements,
      null,
      null,
      makeGetPlayerDevCards(playerCards),
    );

    expect(result.gameEnded).toBe(true);
    expect(result.winnerId).toBe(player1);
    // All players with VP cards should be listed
    expect(result.revealedVPCards).toContainEqual({
      playerId: player1,
      cardCount: 3,
    });
    expect(result.revealedVPCards).toContainEqual({
      playerId: player2,
      cardCount: 1,
    });
  });

  it('returns empty revealedVPCards when winner has no VP cards', () => {
    // Winner without VP cards: 4 settlements + 2 cities + longest + largest = 4 + 4 + 2 + 2 = 12 VP
    const settlements: Settlement[] = [
      { vertexId: 'v1', playerId: player1, isCity: false },
      { vertexId: 'v2', playerId: player1, isCity: false },
      { vertexId: 'v3', playerId: player1, isCity: false },
      { vertexId: 'v4', playerId: player1, isCity: false },
      { vertexId: 'v5', playerId: player1, isCity: true },
      { vertexId: 'v6', playerId: player1, isCity: true },
    ];

    const result = checkForVictory(
      [player1, player2],
      settlements,
      player1, // longest road
      player1, // largest army
      () => [], // no VP cards for anyone
    );

    expect(result.gameEnded).toBe(true);
    expect(result.winnerId).toBe(player1);
    expect(result.revealedVPCards).toEqual([]);
  });

  it('includes all players in allPlayerVP record', () => {
    const settlements: Settlement[] = [
      { vertexId: 'v1', playerId: player1, isCity: false },
      { vertexId: 'v2', playerId: player2, isCity: false },
      { vertexId: 'v3', playerId: player3, isCity: false },
    ];

    const result = checkForVictory(
      [player1, player2, player3],
      settlements,
      null,
      null,
      () => [],
    );

    expect(Object.keys(result.allPlayerVP)).toEqual([
      player1,
      player2,
      player3,
    ]);
    expect(result.allPlayerVP[player1].total).toBe(1);
    expect(result.allPlayerVP[player2].total).toBe(1);
    expect(result.allPlayerVP[player3].total).toBe(1);
  });
});

describe('VICTORY_POINT_THRESHOLD', () => {
  it('is set to 10', () => {
    expect(VICTORY_POINT_THRESHOLD).toBe(10);
  });
});
