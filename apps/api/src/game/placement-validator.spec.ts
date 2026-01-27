import { describe, it, expect } from 'vitest';
import { GameState, Vertex, Edge } from '@catan/shared';
import {
  isValidSettlementPlacement,
  isValidRoadPlacement,
  getInvalidSettlementReason,
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
  cities: [],
  roads: [],
  placement: {
    currentPlayerIndex: 0,
    draftRound: 1,
    phase: 'setup_settlement1',
    turnNumber: 0,
  },
  playerResources: {},
  robberLocation: null,
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
      settlements: [{ id: 's1', vertexId: 'v1', playerId: 'p1' }],
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
      settlements: [{ id: 's1', vertexId: 'v2', playerId: 'p1' }], // v2 is adjacent to v1
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
      settlements: [{ id: 's1', vertexId: 'v2', playerId: 'p1' }],
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
