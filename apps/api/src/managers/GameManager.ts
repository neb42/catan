import { GameState, Player, Terrain } from '@catan/shared';

import { createInitialGameState } from '../game/GameState';
import {
  validateRoadPlacement,
  validateSettlementPlacement,
} from '../game/PlacementValidator';
import {
  buildVertexIndex,
  getHexCornerPositions,
  getVertexKeyFromId,
  positionKey,
} from '../game/geometry';

const getPlacementIndex = (round: number, playerCount: number): number => {
  if (round <= playerCount) {
    return round - 1;
  }

  const totalRounds = playerCount * 2;
  return totalRounds - round;
};

const getResourceKey = (terrain: Terrain): Exclude<Terrain, 'desert'> | null => {
  if (terrain === 'desert') return null;
  return terrain;
};

export class GameManager {
  private games = new Map<string, GameState>();
  private pendingRoadByRoom = new Map<string, { playerId: string; vertexId: string }>();

  createGame(roomId: string, players: Player[]): GameState {
    const existing = this.games.get(roomId);
    if (existing) {
      return existing;
    }

    const gameState = createInitialGameState(roomId, players);
    this.games.set(roomId, gameState);
    return gameState;
  }

  getGame(roomId: string): GameState | undefined {
    return this.games.get(roomId);
  }

  placeSettlement(roomId: string, playerId: string, vertexId: string): GameState {
    const gameState = this.requireGame(roomId);

    if (gameState.currentPlayer !== playerId) {
      throw new Error('Not your turn');
    }

    const pending = this.pendingRoadByRoom.get(roomId);
    if (pending) {
      throw new Error('Place a road before placing another settlement');
    }

    const result = validateSettlementPlacement(gameState, playerId, vertexId);
    if (!result.valid) {
      throw new Error(result.error ?? 'Invalid settlement placement');
    }

    const player = this.requirePlayer(gameState, playerId);
    player.settlements.push(vertexId);

    if (gameState.phase === 'initial_placement') {
      if (player.settlements.length === 2) {
        this.grantStartingResources(gameState, playerId, vertexId);
      }
      this.pendingRoadByRoom.set(roomId, { playerId, vertexId });
    }

    return gameState;
  }

  placeRoad(roomId: string, playerId: string, edgeId: string): GameState {
    const gameState = this.requireGame(roomId);

    if (gameState.currentPlayer !== playerId) {
      throw new Error('Not your turn');
    }

    const pending = this.pendingRoadByRoom.get(roomId);
    const mustConnectToVertex =
      gameState.phase === 'initial_placement' && pending?.playerId === playerId
        ? pending.vertexId
        : undefined;

    if (gameState.phase === 'initial_placement' && !mustConnectToVertex) {
      throw new Error('Place a settlement before placing a road');
    }

    const result = validateRoadPlacement(gameState, playerId, edgeId, {
      mustConnectToVertex,
    });

    if (!result.valid) {
      throw new Error(result.error ?? 'Invalid road placement');
    }

    const player = this.requirePlayer(gameState, playerId);
    player.roads.push(edgeId);

    if (gameState.phase === 'initial_placement') {
      this.pendingRoadByRoom.delete(roomId);
      this.advanceInitialPlacement(gameState);
    }

    return gameState;
  }

  private advanceInitialPlacement(gameState: GameState): void {
    const totalRounds = gameState.players.length * 2;
    const currentRound = gameState.placementRound ?? 1;
    const nextRound = currentRound + 1;

    if (nextRound > totalRounds) {
      gameState.phase = 'gameplay';
      gameState.turnPhase = 'roll';
      gameState.currentPlayer = gameState.players[0]?.id ?? '';
      gameState.placementRound = null;
      return;
    }

    const nextIndex = getPlacementIndex(nextRound, gameState.players.length);
    gameState.currentPlayer = gameState.players[nextIndex]?.id ?? '';
    gameState.placementRound = nextRound;
  }

  private grantStartingResources(
    gameState: GameState,
    playerId: string,
    vertexId: string
  ): void {
    const player = this.requirePlayer(gameState, playerId);
    const hexes = gameState.board.hexes;
    const vertexKey = getVertexKeyFromId(vertexId);
    if (!vertexKey) return;

    const { keyToPosition } = buildVertexIndex(hexes.map((hex) => hex.coord));
    if (!keyToPosition.has(vertexKey)) return;

    hexes.forEach((hex) => {
      const cornerKeys = getHexCornerPositions(hex.coord).map((corner) => positionKey(corner));
      if (!cornerKeys.includes(vertexKey)) return;

      const resourceKey = getResourceKey(hex.terrain);
      if (!resourceKey) return;

      player.resources[resourceKey] += 1;
    });
  }

  private requireGame(roomId: string): GameState {
    const gameState = this.games.get(roomId);
    if (!gameState) {
      throw new Error('Game not found');
    }
    return gameState;
  }

  private requirePlayer(gameState: GameState, playerId: string) {
    const player = gameState.players.find((candidate) => candidate.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }
    return player;
  }
}
