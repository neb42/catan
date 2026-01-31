import { describe, it, expect } from 'vitest';
import { GameState, Vertex, Edge } from '@catan/shared';
import {
  isValidSettlementPlacement,
  isValidRoadPlacement,
  getInvalidSettlementReason,
  isValidMainGameSettlement,
  getInvalidMainGameSettlementReason,
  isValidMainGameRoad,
  getInvalidMainGameRoadReason,
  isValidCityUpgrade,
  getInvalidCityUpgradeReason,
  getEdgesAtVertex,
} from './placement-validator';

// Mock data setup
const mockVertices: Vertex[] = [
  { id: 'v1', x: 0, y: 0, adjacentHexes: [] },
  { id: 'v2', x: 1, y: 0, adjacentHexes: [] }, // Adjacent to v1
  { id: 'v3', x: 2, y: 0, adjacentHexes: [] }, // Not adjacent to v1
];

const mockEdges: Edge[] = [
  {
    id: 'v1|v2',
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
    midpoint: { x: 0.5, y: 0 },
    adjacentHexes: [],
  },
  {
    id: 'v2|v3',
    start: { x: 1, y: 0 },
    end: { x: 2, y: 0 },
    midpoint: { x: 1.5, y: 0 },
    adjacentHexes: [],
  },
];

const emptyGameState: GameState = {
  board: { hexes: [], ports: [] },
  settlements: [],
  robberHexId: null,
  roads: [],
  placement: {
    currentPlayerIndex: 0,
    draftRound: 1,
    phase: 'setup_settlement1',
    turnNumber: 0,
  },
  playerResources: {},
  turnState: null, // null during setup
  longestRoadHolderId: null,
  longestRoadLength: 0,
  playerRoadLengths: {},
};

describe('isValidSettlementPlacement', () => {
  it('returns true for empty vertex with no adjacent settlements', () => {
    const isValid = isValidSettlementPlacement(
      'v1',
      emptyGameState,
      mockVertices,
      mockEdges,
    );
    expect(isValid).toBe(true);
  });

  it('returns false for occupied vertex', () => {
    const gameState = {
      ...emptyGameState,
      settlements: [
        { id: 's1', vertexId: 'v1', playerId: 'p1', isCity: false },
      ],
    };
    const isValid = isValidSettlementPlacement(
      'v1',
      gameState,
      mockVertices,
      mockEdges,
    );
    expect(isValid).toBe(false);
  });

  it('returns false for vertex adjacent to existing settlement', () => {
    const gameState = {
      ...emptyGameState,
      settlements: [
        { id: 's1', vertexId: 'v2', playerId: 'p1', isCity: false },
      ], // v2 is adjacent to v1
    };
    const isValid = isValidSettlementPlacement(
      'v1',
      gameState,
      mockVertices,
      mockEdges,
    );
    expect(isValid).toBe(false);
  });
});

describe('isValidRoadPlacement', () => {
  it('returns true for edge connecting to just-placed settlement', () => {
    const isValid = isValidRoadPlacement(
      'v1|v2',
      emptyGameState,
      'p1',
      'v1',
      mockEdges,
    );
    expect(isValid).toBe(true);
  });

  it('returns false for occupied edge', () => {
    const gameState = {
      ...emptyGameState,
      roads: [{ id: 'r1', edgeId: 'v1|v2', playerId: 'p1' }],
    };
    const isValid = isValidRoadPlacement(
      'v1|v2',
      gameState,
      'p1',
      'v1',
      mockEdges,
    );
    expect(isValid).toBe(false);
  });

  it('returns false for edge not connected to settlement', () => {
    const isValid = isValidRoadPlacement(
      'v2|v3',
      emptyGameState,
      'p1',
      'v1',
      mockEdges,
    ); // v1 not in v2|v3
    expect(isValid).toBe(false);
  });
});

describe('getInvalidSettlementReason', () => {
  it('returns null for valid placement', () => {
    const reason = getInvalidSettlementReason(
      'v1',
      emptyGameState,
      mockVertices,
      mockEdges,
    );
    expect(reason).toBeNull();
  });

  it('returns "Too close to existing settlement" for adjacent vertex', () => {
    const gameState = {
      ...emptyGameState,
      settlements: [
        { id: 's1', vertexId: 'v2', playerId: 'p1', isCity: false },
      ],
    };
    const reason = getInvalidSettlementReason(
      'v1',
      gameState,
      mockVertices,
      mockEdges,
    );
    expect(reason).toBe('Too close to existing settlement');
  });
});

// ============================================================================
// MAIN-GAME VALIDATOR TESTS
// ============================================================================

// Extended mock data for main-game tests
const extendedMockVertices: Vertex[] = [
  { id: 'v1', x: 0, y: 0, adjacentHexes: [] },
  { id: 'v2', x: 1, y: 0, adjacentHexes: [] },
  { id: 'v3', x: 2, y: 0, adjacentHexes: [] },
  { id: 'v4', x: 3, y: 0, adjacentHexes: [] },
  { id: 'v5', x: 4, y: 0, adjacentHexes: [] },
];

const extendedMockEdges: Edge[] = [
  {
    id: 'v1|v2',
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
    midpoint: { x: 0.5, y: 0 },
    adjacentHexes: [],
  },
  {
    id: 'v2|v3',
    start: { x: 1, y: 0 },
    end: { x: 2, y: 0 },
    midpoint: { x: 1.5, y: 0 },
    adjacentHexes: [],
  },
  {
    id: 'v3|v4',
    start: { x: 2, y: 0 },
    end: { x: 3, y: 0 },
    midpoint: { x: 2.5, y: 0 },
    adjacentHexes: [],
  },
  {
    id: 'v4|v5',
    start: { x: 3, y: 0 },
    end: { x: 4, y: 0 },
    midpoint: { x: 3.5, y: 0 },
    adjacentHexes: [],
  },
];

const mainGameState: GameState = {
  board: { hexes: [], ports: [] },
  settlements: [],
  robberHexId: null,
  roads: [],
  placement: null, // null during main game
  playerResources: {
    p1: { wood: 5, brick: 5, sheep: 5, wheat: 5, ore: 5 },
    p2: { wood: 5, brick: 5, sheep: 5, wheat: 5, ore: 5 },
  },
  turnState: {
    phase: 'main',
    currentPlayerId: 'p1',
    turnNumber: 1,
    lastDiceRoll: { dice1: 3, dice2: 4, total: 7 },
  },
  longestRoadHolderId: null,
  longestRoadLength: 0,
  playerRoadLengths: { p1: 0, p2: 0 },
};

describe('getEdgesAtVertex', () => {
  it('returns edges connected to vertex', () => {
    const edges = getEdgesAtVertex('v2', extendedMockEdges);
    expect(edges).toHaveLength(2);
    expect(edges.map((e) => e.id)).toContain('v1|v2');
    expect(edges.map((e) => e.id)).toContain('v2|v3');
  });

  it('returns single edge for end vertex', () => {
    const edges = getEdgesAtVertex('v1', extendedMockEdges);
    expect(edges).toHaveLength(1);
    expect(edges[0].id).toBe('v1|v2');
  });
});

describe('isValidMainGameSettlement', () => {
  it('returns true when adjacent to own road and distance rule satisfied', () => {
    const gameState: GameState = {
      ...mainGameState,
      roads: [{ edgeId: 'v2|v3', playerId: 'p1' }],
    };

    // v3 is adjacent to p1's road at v2|v3
    const isValid = isValidMainGameSettlement(
      'v3',
      gameState,
      'p1',
      extendedMockVertices,
      extendedMockEdges,
    );
    expect(isValid).toBe(true);
  });

  it('returns false when not adjacent to own road', () => {
    const gameState: GameState = {
      ...mainGameState,
      roads: [{ edgeId: 'v1|v2', playerId: 'p1' }],
    };

    // v4 is not adjacent to p1's road at v1|v2
    const isValid = isValidMainGameSettlement(
      'v4',
      gameState,
      'p1',
      extendedMockVertices,
      extendedMockEdges,
    );
    expect(isValid).toBe(false);
  });

  it('returns false when adjacent only to another player road', () => {
    const gameState: GameState = {
      ...mainGameState,
      roads: [{ edgeId: 'v2|v3', playerId: 'p2' }], // p2's road, not p1's
    };

    const isValid = isValidMainGameSettlement(
      'v3',
      gameState,
      'p1',
      extendedMockVertices,
      extendedMockEdges,
    );
    expect(isValid).toBe(false);
  });

  it('returns false when vertex is too close to existing settlement', () => {
    const gameState: GameState = {
      ...mainGameState,
      settlements: [{ vertexId: 'v2', playerId: 'p1', isCity: false }],
      roads: [{ edgeId: 'v1|v2', playerId: 'p1' }],
    };

    // v1 is adjacent to v2 which has a settlement
    const isValid = isValidMainGameSettlement(
      'v1',
      gameState,
      'p1',
      extendedMockVertices,
      extendedMockEdges,
    );
    expect(isValid).toBe(false);
  });
});

describe('getInvalidMainGameSettlementReason', () => {
  it('returns null for valid placement', () => {
    const gameState: GameState = {
      ...mainGameState,
      roads: [{ edgeId: 'v2|v3', playerId: 'p1' }],
    };

    const reason = getInvalidMainGameSettlementReason(
      'v3',
      gameState,
      'p1',
      extendedMockVertices,
      extendedMockEdges,
    );
    expect(reason).toBeNull();
  });

  it('returns "Must be adjacent to your road" when no own road nearby', () => {
    const reason = getInvalidMainGameSettlementReason(
      'v3',
      mainGameState,
      'p1',
      extendedMockVertices,
      extendedMockEdges,
    );
    expect(reason).toBe('Must be adjacent to your road');
  });
});

describe('isValidMainGameRoad', () => {
  it('returns true when connecting to own settlement', () => {
    const gameState: GameState = {
      ...mainGameState,
      settlements: [{ vertexId: 'v1', playerId: 'p1', isCity: false }],
    };

    const isValid = isValidMainGameRoad(
      'v1|v2',
      gameState,
      'p1',
      extendedMockEdges,
    );
    expect(isValid).toBe(true);
  });

  it('returns true when connecting to own road', () => {
    const gameState: GameState = {
      ...mainGameState,
      roads: [{ edgeId: 'v1|v2', playerId: 'p1' }],
    };

    // v2|v3 connects to v1|v2 at vertex v2
    const isValid = isValidMainGameRoad(
      'v2|v3',
      gameState,
      'p1',
      extendedMockEdges,
    );
    expect(isValid).toBe(true);
  });

  it('returns false when not connected to anything', () => {
    const gameState: GameState = {
      ...mainGameState,
      settlements: [{ vertexId: 'v1', playerId: 'p1', isCity: false }],
    };

    // v3|v4 doesn't connect to v1 settlement
    const isValid = isValidMainGameRoad(
      'v3|v4',
      gameState,
      'p1',
      extendedMockEdges,
    );
    expect(isValid).toBe(false);
  });

  it('returns false when only connected to other player road', () => {
    const gameState: GameState = {
      ...mainGameState,
      roads: [{ edgeId: 'v1|v2', playerId: 'p2' }], // p2's road
    };

    const isValid = isValidMainGameRoad(
      'v2|v3',
      gameState,
      'p1',
      extendedMockEdges,
    );
    expect(isValid).toBe(false);
  });

  it('returns false for occupied edge', () => {
    const gameState: GameState = {
      ...mainGameState,
      roads: [{ edgeId: 'v1|v2', playerId: 'p1' }],
    };

    const isValid = isValidMainGameRoad(
      'v1|v2',
      gameState,
      'p1',
      extendedMockEdges,
    );
    expect(isValid).toBe(false);
  });
});

describe('getInvalidMainGameRoadReason', () => {
  it('returns null for valid placement', () => {
    const gameState: GameState = {
      ...mainGameState,
      settlements: [{ vertexId: 'v1', playerId: 'p1', isCity: false }],
    };

    const reason = getInvalidMainGameRoadReason(
      'v1|v2',
      gameState,
      'p1',
      extendedMockEdges,
    );
    expect(reason).toBeNull();
  });

  it('returns "Must connect to your road or settlement" when not connected', () => {
    const reason = getInvalidMainGameRoadReason(
      'v3|v4',
      mainGameState,
      'p1',
      extendedMockEdges,
    );
    expect(reason).toBe('Must connect to your road or settlement');
  });

  it('returns "Edge already occupied" for occupied edge', () => {
    const gameState: GameState = {
      ...mainGameState,
      roads: [{ edgeId: 'v1|v2', playerId: 'p2' }],
    };

    const reason = getInvalidMainGameRoadReason(
      'v1|v2',
      gameState,
      'p1',
      extendedMockEdges,
    );
    expect(reason).toBe('Edge already occupied');
  });
});

describe('isValidCityUpgrade', () => {
  it('returns true for own settlement that is not a city', () => {
    const gameState: GameState = {
      ...mainGameState,
      settlements: [{ vertexId: 'v1', playerId: 'p1', isCity: false }],
    };

    const isValid = isValidCityUpgrade('v1', gameState, 'p1');
    expect(isValid).toBe(true);
  });

  it('returns false for other player settlement', () => {
    const gameState: GameState = {
      ...mainGameState,
      settlements: [{ vertexId: 'v1', playerId: 'p2', isCity: false }],
    };

    const isValid = isValidCityUpgrade('v1', gameState, 'p1');
    expect(isValid).toBe(false);
  });

  it('returns false when already a city', () => {
    const gameState: GameState = {
      ...mainGameState,
      settlements: [{ vertexId: 'v1', playerId: 'p1', isCity: true }],
    };

    const isValid = isValidCityUpgrade('v1', gameState, 'p1');
    expect(isValid).toBe(false);
  });

  it('returns false when no settlement at vertex', () => {
    const isValid = isValidCityUpgrade('v1', mainGameState, 'p1');
    expect(isValid).toBe(false);
  });
});

describe('getInvalidCityUpgradeReason', () => {
  it('returns null for valid upgrade', () => {
    const gameState: GameState = {
      ...mainGameState,
      settlements: [{ vertexId: 'v1', playerId: 'p1', isCity: false }],
    };

    const reason = getInvalidCityUpgradeReason('v1', gameState, 'p1');
    expect(reason).toBeNull();
  });

  it('returns "No settlement at this location" when empty', () => {
    const reason = getInvalidCityUpgradeReason('v1', mainGameState, 'p1');
    expect(reason).toBe('No settlement at this location');
  });

  it('returns "Not your settlement" for other player', () => {
    const gameState: GameState = {
      ...mainGameState,
      settlements: [{ vertexId: 'v1', playerId: 'p2', isCity: false }],
    };

    const reason = getInvalidCityUpgradeReason('v1', gameState, 'p1');
    expect(reason).toBe('Not your settlement');
  });

  it('returns "Already a city" for existing city', () => {
    const gameState: GameState = {
      ...mainGameState,
      settlements: [{ vertexId: 'v1', playerId: 'p1', isCity: true }],
    };

    const reason = getInvalidCityUpgradeReason('v1', gameState, 'p1');
    expect(reason).toBe('Already a city');
  });
});
