import { useGameStore } from '@web/stores/gameStore';

import { HandlerContext, MessageHandler } from './types';

export const handlePlacementTurn: MessageHandler = (message, ctx) => {
  if (message.type !== 'placement_turn') return;

  useGameStore.getState().setPlacementTurn({
    currentPlayerIndex: message.currentPlayerIndex,
    currentPlayerId: message.currentPlayerId,
    phase: message.phase,
    round: message.round,
    turnNumber: message.turnNumber,
  });
};

export const handleSettlementPlaced: MessageHandler = (message, ctx) => {
  if (message.type !== 'settlement_placed') return;

  useGameStore.getState().addSettlement({
    vertexId: message.vertexId,
    playerId: message.playerId,
    isCity: false,
  });

  // Process starting resources from second settlement
  if (message.resourcesGranted && message.resourcesGranted.length > 0) {
    useGameStore
      .getState()
      .updatePlayerResources(message.playerId, message.resourcesGranted);
  }

  // Log placement
  const player = ctx.room?.players.find((p) => p.id === message.playerId);
  const nickname = player?.nickname || 'A player';
  useGameStore.getState().addLogEntry(`${nickname} placed a settlement`);
};

export const handleRoadPlaced: MessageHandler = (message, ctx) => {
  if (message.type !== 'road_placed') return;

  useGameStore.getState().addRoad({
    edgeId: message.edgeId,
    playerId: message.playerId,
  });

  // Log placement
  const player = ctx.room?.players.find((p) => p.id === message.playerId);
  const nickname = player?.nickname || 'A player';
  useGameStore.getState().addLogEntry(`${nickname} placed a road`);
};
