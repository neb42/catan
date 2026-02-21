import { ResourceType } from '@catan/shared';

import { showGameNotification } from '@web/components/Feedback';
import { soundService } from '@web/services/sound';
import { useGameStore } from '@web/stores/gameStore';

import { HandlerContext, MessageHandler } from './types';

export const handleRoadBuilt: MessageHandler = (message, ctx) => {
  if (message.type !== 'road_built') return;

  const gameStore = useGameStore.getState();
  const { edgeId, playerId, resourcesSpent } = message;
  gameStore.addRoad({ edgeId, playerId });

  // Deduct resources from player
  if (resourcesSpent) {
    const resources = Object.entries(resourcesSpent).map(([type, count]) => ({
      type: type as ResourceType,
      count: -(count as number), // Negative to deduct
    }));
    gameStore.updatePlayerResources(playerId, resources);
  }

  // Show notification for road built
  const builder = ctx.room?.players.find((p) => p.id === playerId);
  const nickname = builder?.nickname || 'A player';
  showGameNotification(`${nickname} built a road`, 'success');
  soundService.play('buildRoad');

  // Log action
  gameStore.addLogEntry(`${nickname} built a road`);
};

export const handleSettlementBuilt: MessageHandler = (message, ctx) => {
  if (message.type !== 'settlement_built') return;

  const gameStore = useGameStore.getState();
  const { vertexId, playerId, resourcesSpent } = message;
  gameStore.addSettlement({ vertexId, playerId, isCity: false });

  // Deduct resources
  if (resourcesSpent) {
    const resources = Object.entries(resourcesSpent).map(([type, count]) => ({
      type: type as ResourceType,
      count: -(count as number),
    }));
    gameStore.updatePlayerResources(playerId, resources);
  }

  // Show notification for settlement built
  const builder = ctx.room?.players.find((p) => p.id === playerId);
  const nickname = builder?.nickname || 'A player';
  showGameNotification(`${nickname} built a settlement`, 'success');
  soundService.play('buildSettlement');

  // Log action
  gameStore.addLogEntry(`${nickname} built a settlement`);
};

export const handleCityBuilt: MessageHandler = (message, ctx) => {
  if (message.type !== 'city_built') return;

  const gameStore = useGameStore.getState();
  const { vertexId, playerId, resourcesSpent } = message;
  // Update existing settlement to city
  gameStore.upgradeToCity(vertexId);

  // Deduct resources
  if (resourcesSpent) {
    const resources = Object.entries(resourcesSpent).map(([type, count]) => ({
      type: type as ResourceType,
      count: -(count as number),
    }));
    gameStore.updatePlayerResources(playerId, resources);
  }

  // Show notification for city built
  const builder = ctx.room?.players.find((p) => p.id === playerId);
  const nickname = builder?.nickname || 'A player';
  showGameNotification(`${nickname} upgraded to a city`, 'success');
  soundService.play('buildCity');

  // Log action
  gameStore.addLogEntry(`${nickname} upgraded to a city`);
};

export const handleBuildFailed: MessageHandler = (message, ctx) => {
  if (message.type !== 'build_failed') return;

  const { reason } = message;
  showGameNotification(`Build failed: ${reason}`, 'error');
  soundService.play('negative');
};
