import { DEV_CARD_COST, ResourceType } from '@catan/shared';

import { showGameNotification } from '@web/components/Feedback';
import { useGameStore } from '@web/stores/gameStore';

import { HandlerContext, MessageHandler } from './types';

export const handleDevCardPurchased: MessageHandler = (message, ctx) => {
  if (message.type !== 'dev_card_purchased') return;

  // Buyer receives their card (only sent to buyer)
  const gameStore = useGameStore.getState();
  gameStore.addMyDevCard(message.card);
  gameStore.setDeckRemaining(message.deckRemaining);

  // Deduct resources from buyer
  if (message.resourcesSpent) {
    const resources = Object.entries(message.resourcesSpent).map(
      ([type, count]) => ({
        type: type as ResourceType,
        count: -(count as number), // Negative to deduct
      }),
    );
    gameStore.updatePlayerResources(message.playerId, resources);
  }

  showGameNotification('Development card purchased!', 'success');
};

export const handleDevCardPurchasedPublic: MessageHandler = (message, ctx) => {
  if (message.type !== 'dev_card_purchased_public') return;

  // Other players see someone bought a card
  const gameStore = useGameStore.getState();
  gameStore.setDeckRemaining(message.deckRemaining);
  // Increment opponent's card count
  const currentCount = gameStore.opponentDevCardCounts[message.playerId] || 0;
  gameStore.setOpponentDevCardCount(message.playerId, currentCount + 1);
  // Deduct resources from buyer (using constant cost since it's always the same)
  const devCardResources = Object.entries(DEV_CARD_COST).map(
    ([type, count]) => ({
      type: type as ResourceType,
      count: -(count as number), // Negative to deduct
    }),
  );
  gameStore.updatePlayerResources(message.playerId, devCardResources);
  // Show notification
  const buyer = ctx.room?.players.find((p) => p.id === message.playerId);
  const nickname = buyer?.nickname || 'A player';
  showGameNotification(`${nickname} bought a development card`, 'info');
};

export const handleDevCardPlayed: MessageHandler = (message, ctx) => {
  if (message.type !== 'dev_card_played') return;

  const gameStore = useGameStore.getState();
  const myId = gameStore.myPlayerId;

  if (message.playerId === myId) {
    // Remove card from my hand
    gameStore.removeMyDevCard(message.cardId);
    gameStore.setHasPlayedDevCardThisTurn(true);
  } else {
    // Decrement opponent's card count
    const currentCount = gameStore.opponentDevCardCounts[message.playerId] || 0;
    if (currentCount > 0) {
      gameStore.setOpponentDevCardCount(message.playerId, currentCount - 1);
    }
  }

  // Increment knights played if knight
  if (message.cardType === 'knight') {
    gameStore.incrementKnightsPlayed(message.playerId);
    // Show notification
    const player = ctx.room?.players.find((p) => p.id === message.playerId);
    const nickname = player?.nickname || 'A player';
    showGameNotification(`${nickname} played a Knight!`, 'info');
  }
};

export const handleDevCardPlayFailed: MessageHandler = (message, ctx) => {
  if (message.type !== 'dev_card_play_failed') return;

  showGameNotification(`${message.reason}`, 'error');
};

export const handleYearOfPlentyRequired: MessageHandler = (message, ctx) => {
  if (message.type !== 'year_of_plenty_required') return;

  // Player needs to select 2 resources from bank
  useGameStore.getState().setDevCardPlayPhase('year_of_plenty');
};

export const handleYearOfPlentyCompleted: MessageHandler = (message, ctx) => {
  if (message.type !== 'year_of_plenty_completed') return;

  // Year of Plenty completed - update resources
  const gameStore = useGameStore.getState();
  gameStore.setDevCardPlayPhase(null);

  // Update resources for the player - only add the YoP resources
  const { playerId: yopPlayerId, resources: yopResources } = message;

  // Count how many of each resource type was selected
  const resourceCounts: Record<ResourceType, number> = {
    wood: 0,
    brick: 0,
    sheep: 0,
    wheat: 0,
    ore: 0,
  };
  yopResources.forEach((r: ResourceType) => {
    resourceCounts[r] = (resourceCounts[r] || 0) + 1;
  });

  // Only pass the delta (resources gained from YoP) to updatePlayerResources
  const resourceUpdates = Object.entries(resourceCounts)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({
      type: type as ResourceType,
      count: count as number,
    }));
  gameStore.updatePlayerResources(yopPlayerId, resourceUpdates);

  // Show notification
  const yopPlayer = ctx.room?.players.find((p) => p.id === yopPlayerId);
  const yopNickname = yopPlayer?.nickname || 'A player';
  showGameNotification(
    `${yopNickname} took ${yopResources.join(' and ')} from the bank!`,
    'info',
  );
};

export const handleMonopolyRequired: MessageHandler = (message, ctx) => {
  if (message.type !== 'monopoly_required') return;

  // Player needs to select a resource type for monopoly
  useGameStore.getState().setDevCardPlayPhase('monopoly');
};

export const handleMonopolyExecuted: MessageHandler = (message, ctx) => {
  if (message.type !== 'monopoly_executed') return;

  // Monopoly completed - update all affected resources
  const gameStore = useGameStore.getState();
  gameStore.setDevCardPlayPhase(null);

  const {
    playerId: monopolyPlayerId,
    resourceType: monopolyResource,
    totalCollected,
    fromPlayers,
  } = message;

  // Take resources from victims - pass negative delta for the resource taken
  Object.entries(fromPlayers).forEach(([victimId, amount]) => {
    // Only pass the delta (negative amount of the monopolized resource)
    gameStore.updatePlayerResources(victimId, [
      {
        type: monopolyResource as ResourceType,
        count: -(amount as number),
      },
    ]);
  });

  // Give resources to monopoly player - pass positive delta
  gameStore.updatePlayerResources(monopolyPlayerId, [
    {
      type: monopolyResource as ResourceType,
      count: totalCollected,
    },
  ]);

  // Show notification
  const monopolyPlayer = ctx.room?.players.find(
    (p) => p.id === monopolyPlayerId,
  );
  const monopolyNickname = monopolyPlayer?.nickname || 'A player';
  showGameNotification(
    `${monopolyNickname} collected ${totalCollected} ${monopolyResource} via Monopoly!`,
    'warning',
  );
};

export const handleRoadBuildingRequired: MessageHandler = (message, ctx) => {
  if (message.type !== 'road_building_required') return;

  // Player needs to place roads (up to 2)
  const gameStore = useGameStore.getState();
  gameStore.setDevCardPlayPhase('road_building');
  gameStore.setRoadsPlacedThisCard(0);
};

export const handleRoadBuildingPlaced: MessageHandler = (message, ctx) => {
  if (message.type !== 'road_building_placed') return;

  // A road was placed during Road Building
  const gameStore = useGameStore.getState();
  const { playerId: rbPlayerId, edgeId, roadsRemaining } = message;

  // Add the road to state
  gameStore.addRoad({ edgeId, playerId: rbPlayerId });

  // Update roads placed count
  gameStore.setRoadsPlacedThisCard(2 - (roadsRemaining ?? 0));
};

export const handleRoadBuildingCompleted: MessageHandler = (message, ctx) => {
  if (message.type !== 'road_building_completed') return;

  // Road Building completed
  const gameStore = useGameStore.getState();
  gameStore.setDevCardPlayPhase(null);
  gameStore.setRoadsPlacedThisCard(0);

  const { playerId: rbCompletedPlayerId, edgesPlaced } = message;
  const rbPlayer = ctx.room?.players.find((p) => p.id === rbCompletedPlayerId);
  const rbNickname = rbPlayer?.nickname || 'A player';
  showGameNotification(
    `${rbNickname} placed ${edgesPlaced?.length || 0} free roads!`,
    'success',
  );
};
