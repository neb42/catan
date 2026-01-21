import { GameState, Terrain } from '@catan/shared';

import { buildVertexIndex, getHexCornerPositions, positionKey } from './geometry';

const resourceFromTerrain = (
  terrain: Terrain
): Exclude<Terrain, 'desert'> | null => {
  if (terrain === 'desert') return null;
  return terrain;
};

type SettlementRecord = {
  playerId: string;
  isCity: boolean;
};

const buildSettlementMap = (gameState: GameState): Map<string, SettlementRecord> => {
  const records = new Map<string, SettlementRecord>();
  gameState.players.forEach((player) => {
    player.settlements.forEach((vertexId) => {
      const key = vertexIdKey(gameState, vertexId);
      if (key) {
        records.set(key, { playerId: player.id, isCity: false });
      }
    });

    player.cities.forEach((vertexId) => {
      const key = vertexIdKey(gameState, vertexId);
      if (key) {
        records.set(key, { playerId: player.id, isCity: true });
      }
    });
  });

  return records;
};

const vertexIdKey = (gameState: GameState, vertexId: string): string | null => {
  const hexes = gameState.board.hexes.map((hex) => hex.coord);
  const { vertexIdToKey } = buildVertexIndex(hexes);
  return vertexIdToKey.get(vertexId) ?? null;
};

export const rollDice = (
  gameState: GameState,
  playerId: string
): { die1: number; die2: number } => {
  if (gameState.currentPlayer !== playerId) {
    throw new Error('Not your turn');
  }

  if (gameState.turnPhase !== 'roll') {
    throw new Error('Wrong phase');
  }

  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;

  gameState.lastDiceRoll = [die1, die2];
  gameState.turnPhase = 'main';

  distributeResources(gameState, die1 + die2);

  return { die1, die2 };
};

export const distributeResources = (gameState: GameState, roll: number): void => {
  const settlementMap = buildSettlementMap(gameState);

  gameState.board.hexes.forEach((hex) => {
    if (hex.hasRobber) return;
    if (hex.number !== roll) return;

    const resource = resourceFromTerrain(hex.terrain);
    if (!resource) return;

    const vertexKeys = getHexCornerPositions(hex.coord).map((corner) =>
      positionKey(corner)
    );

    vertexKeys.forEach((key) => {
      const record = settlementMap.get(key);
      if (!record) return;
      const player = gameState.players.find((p) => p.id === record.playerId);
      if (!player) return;

      const amount = record.isCity ? 2 : 1;
      player.resources[resource] += amount;
    });
  });
};

export const advanceTurn = (gameState: GameState): void => {
  const currentIndex = gameState.players.findIndex(
    (player) => player.id === gameState.currentPlayer
  );

  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % gameState.players.length;
  gameState.currentPlayer = gameState.players[nextIndex]?.id ?? '';
  gameState.turnPhase = 'roll';
  gameState.lastDiceRoll = null;
};
