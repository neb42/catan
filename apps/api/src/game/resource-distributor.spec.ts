import { describe, it, expect } from 'vitest';
import {
  distributeResources,
  terrainToResource,
  PlayerResourceGrant,
} from './resource-distributor';
import { Hex, Settlement, PlayerResources } from '@catan/shared';
import { Vertex } from '@catan/shared';

describe('terrainToResource', () => {
  it('maps forest to wood', () => {
    expect(terrainToResource('forest')).toBe('wood');
  });

  it('maps hills to brick', () => {
    expect(terrainToResource('hills')).toBe('brick');
  });

  it('maps pasture to sheep', () => {
    expect(terrainToResource('pasture')).toBe('sheep');
  });

  it('maps fields to wheat', () => {
    expect(terrainToResource('fields')).toBe('wheat');
  });

  it('maps mountains to ore', () => {
    expect(terrainToResource('mountains')).toBe('ore');
  });

  it('returns null for desert', () => {
    expect(terrainToResource('desert')).toBe(null);
  });

  it('returns null for unknown terrain', () => {
    expect(terrainToResource('unknown')).toBe(null);
  });
});

describe('distributeResources', () => {
  // Helper to create test data
  const createHex = (
    q: number,
    r: number,
    terrain: string,
    number: number | null,
  ): Hex => ({
    q,
    r,
    terrain: terrain as Hex['terrain'],
    number,
  });

  const createVertex = (id: string, adjacentHexes: string[]): Vertex => ({
    id,
    x: 0,
    y: 0,
    adjacentHexes,
  });

  const createSettlement = (
    vertexId: string,
    playerId: string,
    isCity: boolean = false,
  ): Settlement => ({
    vertexId,
    playerId,
    isCity,
  });

  const createPlayerResources = (): PlayerResources => ({
    wood: 0,
    brick: 0,
    sheep: 0,
    wheat: 0,
    ore: 0,
  });

  it('distributes 1 resource to player with settlement adjacent to rolled hex', () => {
    const hexes: Hex[] = [createHex(0, 0, 'forest', 8)];
    const vertices: Vertex[] = [createVertex('v1', ['0,0'])];
    const settlements: Settlement[] = [createSettlement('v1', 'player1')];
    const playerResources: Record<string, PlayerResources> = {
      player1: createPlayerResources(),
    };

    const result = distributeResources(
      8,
      hexes,
      settlements,
      vertices,
      playerResources,
      null, // No robber blocking
    );

    // Check return value
    expect(result).toHaveLength(1);
    expect(result[0].playerId).toBe('player1');
    expect(result[0].resources).toContainEqual({ type: 'wood', count: 1 });

    // Check mutation
    expect(playerResources['player1'].wood).toBe(1);
  });

  it('distributes 2 resources to player with city adjacent to rolled hex', () => {
    const hexes: Hex[] = [createHex(0, 0, 'hills', 6)];
    const vertices: Vertex[] = [createVertex('v1', ['0,0'])];
    const settlements: Settlement[] = [createSettlement('v1', 'player1', true)]; // isCity = true
    const playerResources: Record<string, PlayerResources> = {
      player1: createPlayerResources(),
    };

    const result = distributeResources(
      6,
      hexes,
      settlements,
      vertices,
      playerResources,
      null, // No robber blocking
    );

    expect(result).toHaveLength(1);
    expect(result[0].playerId).toBe('player1');
    expect(result[0].resources).toContainEqual({ type: 'brick', count: 2 });

    expect(playerResources['player1'].brick).toBe(2);
  });

  it('does not distribute resources when dice matches desert', () => {
    const hexes: Hex[] = [createHex(0, 0, 'desert', 7)]; // Desert shouldn't have number, but testing edge case
    const vertices: Vertex[] = [createVertex('v1', ['0,0'])];
    const settlements: Settlement[] = [createSettlement('v1', 'player1')];
    const playerResources: Record<string, PlayerResources> = {
      player1: createPlayerResources(),
    };

    const result = distributeResources(
      7,
      hexes,
      settlements,
      vertices,
      playerResources,
      null, // No robber blocking
    );

    expect(result).toHaveLength(0);
    expect(playerResources['player1'].wood).toBe(0);
  });

  it('returns empty array when dice matches hex with no adjacent settlements', () => {
    const hexes: Hex[] = [createHex(0, 0, 'pasture', 5)];
    const vertices: Vertex[] = [createVertex('v1', ['0,0'])];
    const settlements: Settlement[] = []; // No settlements
    const playerResources: Record<string, PlayerResources> = {};

    const result = distributeResources(
      5,
      hexes,
      settlements,
      vertices,
      playerResources,
      null, // No robber blocking
    );

    expect(result).toHaveLength(0);
  });

  it('distributes resources to multiple players from same hex', () => {
    const hexes: Hex[] = [createHex(0, 0, 'fields', 9)];
    const vertices: Vertex[] = [
      createVertex('v1', ['0,0']),
      createVertex('v2', ['0,0']),
    ];
    const settlements: Settlement[] = [
      createSettlement('v1', 'player1'),
      createSettlement('v2', 'player2'),
    ];
    const playerResources: Record<string, PlayerResources> = {
      player1: createPlayerResources(),
      player2: createPlayerResources(),
    };

    const result = distributeResources(
      9,
      hexes,
      settlements,
      vertices,
      playerResources,
      null, // No robber blocking
    );

    expect(result).toHaveLength(2);

    const player1Grant = result.find((g) => g.playerId === 'player1');
    const player2Grant = result.find((g) => g.playerId === 'player2');

    expect(player1Grant?.resources).toContainEqual({ type: 'wheat', count: 1 });
    expect(player2Grant?.resources).toContainEqual({ type: 'wheat', count: 1 });

    expect(playerResources['player1'].wheat).toBe(1);
    expect(playerResources['player2'].wheat).toBe(1);
  });

  it('aggregates resources when player has multiple settlements on matching hexes', () => {
    const hexes: Hex[] = [
      createHex(0, 0, 'mountains', 10),
      createHex(1, 0, 'mountains', 10),
    ];
    const vertices: Vertex[] = [
      createVertex('v1', ['0,0']),
      createVertex('v2', ['1,0']),
    ];
    const settlements: Settlement[] = [
      createSettlement('v1', 'player1'),
      createSettlement('v2', 'player1'),
    ];
    const playerResources: Record<string, PlayerResources> = {
      player1: createPlayerResources(),
    };

    const result = distributeResources(
      10,
      hexes,
      settlements,
      vertices,
      playerResources,
      null, // No robber blocking
    );

    expect(result).toHaveLength(1);
    expect(result[0].playerId).toBe('player1');
    // Should aggregate to 2 ore from 2 settlements
    expect(result[0].resources).toContainEqual({ type: 'ore', count: 2 });

    expect(playerResources['player1'].ore).toBe(2);
  });

  it('returns empty array when no hex matches the dice roll', () => {
    const hexes: Hex[] = [
      createHex(0, 0, 'forest', 5),
      createHex(1, 0, 'hills', 6),
    ];
    const vertices: Vertex[] = [createVertex('v1', ['0,0'])];
    const settlements: Settlement[] = [createSettlement('v1', 'player1')];
    const playerResources: Record<string, PlayerResources> = {
      player1: createPlayerResources(),
    };

    const result = distributeResources(
      11, // No hex has number 11
      hexes,
      settlements,
      vertices,
      playerResources,
      null, // No robber blocking
    );

    expect(result).toHaveLength(0);
    expect(playerResources['player1'].wood).toBe(0);
  });

  it('handles player with settlement adjacent to multiple matching hexes', () => {
    // A vertex can be adjacent to up to 3 hexes
    const hexes: Hex[] = [
      createHex(0, 0, 'forest', 8),
      createHex(1, 0, 'hills', 8),
    ];
    const vertices: Vertex[] = [
      createVertex('v1', ['0,0', '1,0']), // Adjacent to both hexes
    ];
    const settlements: Settlement[] = [createSettlement('v1', 'player1')];
    const playerResources: Record<string, PlayerResources> = {
      player1: createPlayerResources(),
    };

    const result = distributeResources(
      8,
      hexes,
      settlements,
      vertices,
      playerResources,
      null, // No robber blocking
    );

    expect(result).toHaveLength(1);
    expect(result[0].playerId).toBe('player1');
    // Should get 1 wood from forest and 1 brick from hills
    expect(result[0].resources).toContainEqual({ type: 'wood', count: 1 });
    expect(result[0].resources).toContainEqual({ type: 'brick', count: 1 });

    expect(playerResources['player1'].wood).toBe(1);
    expect(playerResources['player1'].brick).toBe(1);
  });

  // Robber blocking tests
  it('does not distribute resources from hex with robber', () => {
    const hexes: Hex[] = [createHex(0, 0, 'forest', 8)];
    const vertices: Vertex[] = [createVertex('v1', ['0,0'])];
    const settlements: Settlement[] = [createSettlement('v1', 'player1')];
    const playerResources: Record<string, PlayerResources> = {
      player1: createPlayerResources(),
    };

    const result = distributeResources(
      8,
      hexes,
      settlements,
      vertices,
      playerResources,
      '0,0', // Robber on this hex
    );

    // No resources distributed because robber blocks
    expect(result).toHaveLength(0);
    expect(playerResources['player1'].wood).toBe(0);
  });

  it('distributes resources from adjacent hexes when robber blocks one', () => {
    // Two hexes with same number, robber on one
    const hexes: Hex[] = [
      createHex(0, 0, 'forest', 8),
      createHex(1, 0, 'hills', 8),
    ];
    const vertices: Vertex[] = [
      createVertex('v1', ['0,0', '1,0']), // Adjacent to both hexes
    ];
    const settlements: Settlement[] = [createSettlement('v1', 'player1')];
    const playerResources: Record<string, PlayerResources> = {
      player1: createPlayerResources(),
    };

    const result = distributeResources(
      8,
      hexes,
      settlements,
      vertices,
      playerResources,
      '0,0', // Robber blocks forest hex only
    );

    expect(result).toHaveLength(1);
    expect(result[0].playerId).toBe('player1');
    // Should only get brick from hills (forest blocked by robber)
    expect(result[0].resources).toHaveLength(1);
    expect(result[0].resources).toContainEqual({ type: 'brick', count: 1 });

    expect(playerResources['player1'].wood).toBe(0); // Blocked
    expect(playerResources['player1'].brick).toBe(1); // Not blocked
  });

  it('robberHexId null means no blocking (backward compat)', () => {
    const hexes: Hex[] = [createHex(0, 0, 'forest', 8)];
    const vertices: Vertex[] = [createVertex('v1', ['0,0'])];
    const settlements: Settlement[] = [createSettlement('v1', 'player1')];
    const playerResources: Record<string, PlayerResources> = {
      player1: createPlayerResources(),
    };

    const result = distributeResources(
      8,
      hexes,
      settlements,
      vertices,
      playerResources,
      null, // No robber - null means no blocking
    );

    expect(result).toHaveLength(1);
    expect(result[0].resources).toContainEqual({ type: 'wood', count: 1 });
    expect(playerResources['player1'].wood).toBe(1);
  });
});
