import { AxialCoord, GameState, cubeDistance, axialToCube } from '@catan/shared';

import {
  buildVertexIndex,
  getDistance,
  getEdgeKeyFromId,
  getSharedVertexKeysForEdge,
  getVertexKeyFromId,
} from './geometry';

const EDGE_LENGTH = 10;
const DISTANCE_EPSILON = 0.25;

const getBoardHexCoords = (gameState: GameState): AxialCoord[] =>
  gameState.board.hexes.map((hex) => hex.coord);

const getAllSettlementVertexKeys = (gameState: GameState): string[] => {
  const keys: string[] = [];
  gameState.players.forEach((player) => {
    [...player.settlements, ...player.cities].forEach((vertexId) => {
      const key = getVertexKeyFromId(vertexId);
      if (key) keys.push(key);
    });
  });
  return keys;
};

const getPlayerSettlementKeys = (gameState: GameState, playerId: string): string[] => {
  const player = gameState.players.find((candidate) => candidate.id === playerId);
  if (!player) return [];
  return [...player.settlements, ...player.cities]
    .map((vertexId) => getVertexKeyFromId(vertexId))
    .filter((key): key is string => Boolean(key));
};

const getPlayerRoadEdgeKeys = (gameState: GameState, playerId: string): string[] => {
  const player = gameState.players.find((candidate) => candidate.id === playerId);
  if (!player) return [];
  const hexes = getBoardHexCoords(gameState);
  return player.roads
    .map((edgeId) => getEdgeKeyFromId(edgeId, hexes))
    .filter((key): key is string => Boolean(key));
};

const getAllRoadEdgeKeys = (gameState: GameState): string[] => {
  const hexes = getBoardHexCoords(gameState);
  const keys: string[] = [];
  gameState.players.forEach((player) => {
    player.roads.forEach((edgeId) => {
      const edgeKey = getEdgeKeyFromId(edgeId, hexes);
      if (edgeKey) keys.push(edgeKey);
    });
  });
  return keys;
};

export const getVertexNeighbors = (gameState: GameState, vertexId: string): string[] => {
  const hexes = getBoardHexCoords(gameState);
  const { keyToPosition, vertexIdToKey } = buildVertexIndex(hexes);
  const key = getVertexKeyFromId(vertexId);
  if (!key) return [];
  const origin = keyToPosition.get(key);
  if (!origin) return [];

  const keyToVertexId = new Map<string, string>();
  vertexIdToKey.forEach((value, id) => {
    if (!keyToVertexId.has(value)) {
      keyToVertexId.set(value, id);
    }
  });

  const neighbors: string[] = [];
  keyToPosition.forEach((position, candidateKey) => {
    if (candidateKey === key) return;
    const distance = getDistance(origin, position);
    if (distance <= EDGE_LENGTH + DISTANCE_EPSILON) {
      const neighborId = keyToVertexId.get(candidateKey);
      if (neighborId) neighbors.push(neighborId);
    }
  });

  return neighbors;
};

export const getAdjacentVertices = (
  gameState: GameState,
  hexCoord: AxialCoord,
  vertexIndex: number
): string[] => {
  const vertexId = `${hexCoord.q}:${hexCoord.r}:${vertexIndex}`;
  const neighbors = getVertexNeighbors(gameState, vertexId);
  return neighbors.slice(0, 3);
};

export const getEdgeVertices = (
  gameState: GameState,
  edgeId: string
): [string, string] | null => {
  const hexes = getBoardHexCoords(gameState);
  const shared = getSharedVertexKeysForEdge(edgeId, hexes);
  if (!shared || shared.length !== 2) return null;

  const { vertexIdToKey } = buildVertexIndex(hexes);
  const keyToVertexId = new Map<string, string>();
  vertexIdToKey.forEach((value, id) => {
    if (!keyToVertexId.has(value)) {
      keyToVertexId.set(value, id);
    }
  });

  const [firstKey, secondKey] = shared;
  const firstId = keyToVertexId.get(firstKey);
  const secondId = keyToVertexId.get(secondKey);

  if (!firstId || !secondId) return null;
  return [firstId, secondId];
};

export const isVertexAdjacentToRoad = (
  gameState: GameState,
  vertexId: string,
  roads: string[]
): boolean => {
  const hexes = getBoardHexCoords(gameState);
  const targetKey = getVertexKeyFromId(vertexId);
  if (!targetKey) return false;

  return roads.some((edgeId) => {
    const edgeKeys = getSharedVertexKeysForEdge(edgeId, hexes);
    return edgeKeys ? edgeKeys.includes(targetKey) : false;
  });
};

export const validateSettlementPlacement = (
  gameState: GameState,
  playerId: string,
  vertexId: string
): { valid: boolean; error?: string } => {
  const hexes = getBoardHexCoords(gameState);
  const { keyToPosition } = buildVertexIndex(hexes);
  const vertexKey = getVertexKeyFromId(vertexId);

  if (!vertexKey || !keyToPosition.has(vertexKey)) {
    return { valid: false, error: 'Invalid vertex' };
  }

  const occupiedKeys = getAllSettlementVertexKeys(gameState);
  if (occupiedKeys.includes(vertexKey)) {
    return { valid: false, error: 'Vertex already occupied' };
  }

  const targetPosition = keyToPosition.get(vertexKey);
  if (!targetPosition) {
    return { valid: false, error: 'Invalid vertex' };
  }

  for (const occupiedKey of occupiedKeys) {
    const occupiedPosition = keyToPosition.get(occupiedKey);
    if (!occupiedPosition) continue;
    const distance = getDistance(targetPosition, occupiedPosition);
    if (distance <= EDGE_LENGTH + DISTANCE_EPSILON) {
      return { valid: false, error: 'Too close to another settlement' };
    }
  }

  if (gameState.phase !== 'initial_placement') {
    const player = gameState.players.find((candidate) => candidate.id === playerId);
    if (!player) {
      return { valid: false, error: 'Player not found' };
    }

    if (!isVertexAdjacentToRoad(gameState, vertexId, player.roads)) {
      return { valid: false, error: 'Settlement must connect to your road' };
    }
  }

  return { valid: true };
};

export const validateRoadPlacement = (
  gameState: GameState,
  playerId: string,
  edgeId: string,
  options?: { mustConnectToVertex?: string }
): { valid: boolean; error?: string } => {
  const hexes = getBoardHexCoords(gameState);
  const edgeKey = getEdgeKeyFromId(edgeId, hexes);
  if (!edgeKey) {
    return { valid: false, error: 'Invalid edge' };
  }

  const allRoads = getAllRoadEdgeKeys(gameState);
  if (allRoads.includes(edgeKey)) {
    return { valid: false, error: 'Road already exists' };
  }

  const sharedVertexKeys = getSharedVertexKeysForEdge(edgeId, hexes);
  if (!sharedVertexKeys) {
    return { valid: false, error: 'Invalid edge' };
  }

  const playerSettlementKeys = getPlayerSettlementKeys(gameState, playerId);
  const playerRoadKeys = getPlayerRoadEdgeKeys(gameState, playerId);

  if (options?.mustConnectToVertex) {
    const requiredKey = getVertexKeyFromId(options.mustConnectToVertex);
    if (!requiredKey || !sharedVertexKeys.includes(requiredKey)) {
      return { valid: false, error: 'Road must connect to the placed settlement' };
    }
    return { valid: true };
  }

  const touchesSettlement = sharedVertexKeys.some((key) => playerSettlementKeys.includes(key));
  if (touchesSettlement) {
    return { valid: true };
  }

  const touchesRoad = playerRoadKeys.some((playerEdgeKey) => {
    if (!playerEdgeKey) return false;
    const [a, b] = playerEdgeKey.split('|');
    return sharedVertexKeys.includes(a) || sharedVertexKeys.includes(b);
  });

  if (!touchesRoad) {
    return { valid: false, error: 'Road must connect to your settlement or road' };
  }

  return { valid: true };
};

export const areHexesAdjacent = (a: AxialCoord, b: AxialCoord): boolean =>
  cubeDistance(axialToCube(a), axialToCube(b)) === 1;
