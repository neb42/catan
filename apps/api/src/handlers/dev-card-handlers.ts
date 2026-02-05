import { WebSocket } from 'ws';

import {
  BuyDevCardMessage,
  DEV_CARD_COST,
  MonopolySelectMessage,
  PlayDevCardMessage,
  RoadBuildingPlaceMessage,
  YearOfPlentySelectMessage,
} from '@catan/shared';

import { RoomManager } from '../managers/RoomManager';
import { logMessage } from '../utils/message-logger';
import {
  broadcastLargestArmyIfTransferred,
  broadcastLongestRoadIfTransferred,
  broadcastVictory,
  sendError,
  sendMessage,
} from './handler-utils';

/**
 * Handle buy_dev_card message.
 * Player purchases a development card from the deck.
 */
export function handleBuyDevCard(
  ws: WebSocket,
  message: BuyDevCardMessage,
  roomManager: RoomManager,
  context: { currentRoomId: string | null; playerId: string | null },
): void {
  if (!context.currentRoomId || !context.playerId) {
    sendError(ws, 'Not in a room');
    return;
  }

  const gameManager = roomManager.getGameManager(context.currentRoomId);
  if (!gameManager) {
    sendError(ws, 'Game not started');
    return;
  }

  const result = gameManager.buyDevCard(context.playerId);

  if (!result.success) {
    // Send error only to buyer
    sendMessage(
      ws,
      {
        type: 'dev_card_play_failed',
        reason: result.error || 'Purchase failed',
      },
      context.currentRoomId,
    );
    return;
  }

  // Send full card info to buyer only
  sendMessage(
    ws,
    {
      type: 'dev_card_purchased',
      playerId: context.playerId,
      card: result.card,
      deckRemaining: result.deckRemaining,
      resourcesSpent: DEV_CARD_COST,
    },
    context.currentRoomId,
  );

  // Send hidden info to all other players in room
  const room = roomManager.getRoom(context.currentRoomId);
  if (room) {
    const publicMessage = {
      type: 'dev_card_purchased_public',
      playerId: context.playerId,
      deckRemaining: result.deckRemaining,
    };
    room.players.forEach((player) => {
      if (
        player.id !== context.playerId &&
        player.ws &&
        player.ws.readyState === WebSocket.OPEN
      ) {
        player.ws.send(JSON.stringify(publicMessage));
      }
    });
    logMessage(context.currentRoomId, 'send', publicMessage);
  }
}

/**
 * Handle play_dev_card message.
 * Player plays a development card (routes to card-specific logic).
 */
export function handlePlayDevCard(
  ws: WebSocket,
  message: PlayDevCardMessage,
  roomManager: RoomManager,
  context: { currentRoomId: string | null; playerId: string | null },
): void {
  if (!context.currentRoomId || !context.playerId) {
    sendError(ws, 'Not in a room');
    return;
  }

  const gameManager = roomManager.getGameManager(context.currentRoomId);
  if (!gameManager) {
    sendError(ws, 'Game not started');
    return;
  }

  // Get the card to determine its type
  const playerCards = gameManager.getPlayerDevCards(context.playerId);
  const card = playerCards.find((c) => c.id === message.cardId);

  if (!card) {
    sendMessage(
      ws,
      {
        type: 'dev_card_play_failed',
        reason: 'Card not found',
      },
      context.currentRoomId,
    );
    return;
  }

  // Route based on card type
  switch (card.type) {
    case 'knight': {
      const result = gameManager.playKnight(context.playerId, message.cardId);

      if (!result.success) {
        sendMessage(
          ws,
          {
            type: 'dev_card_play_failed',
            reason: result.error || 'Cannot play knight',
          },
          context.currentRoomId,
        );
        return;
      }

      // Broadcast knight played to all players
      roomManager.broadcastToRoom(context.currentRoomId, {
        type: 'dev_card_played',
        playerId: context.playerId,
        cardType: 'knight',
        cardId: message.cardId,
      });

      // Broadcast largest army update if it transferred
      broadcastLargestArmyIfTransferred(
        roomManager,
        context.currentRoomId,
        result.largestArmyResult,
      );

      // Check for victory (largest army may have transferred)
      if (result.victoryResult) {
        broadcastVictory(
          roomManager,
          context.currentRoomId,
          result.victoryResult,
        );
        return; // Game is over - don't continue to robber move
      }

      // Send robber_move_required to the knight player
      sendMessage(
        ws,
        {
          type: 'robber_move_required',
          currentHexId: result.currentRobberHex,
        },
        context.currentRoomId,
      );
      break;
    }

    case 'victory_point': {
      // VP cards cannot be played - they auto-score
      sendMessage(
        ws,
        {
          type: 'dev_card_play_failed',
          reason:
            'Victory point cards cannot be played - they score automatically',
        },
        context.currentRoomId,
      );
      break;
    }

    case 'road_building': {
      const result = gameManager.playRoadBuilding(
        context.playerId,
        message.cardId,
      );

      if (!result.success) {
        sendMessage(
          ws,
          {
            type: 'dev_card_play_failed',
            reason: result.error || 'Cannot play Road Building',
          },
          context.currentRoomId,
        );
        return;
      }

      // Broadcast card played to all players
      roomManager.broadcastToRoom(context.currentRoomId, {
        type: 'dev_card_played',
        playerId: context.playerId,
        cardType: 'road_building',
        cardId: message.cardId,
      });

      // Send road_building_required to the player
      sendMessage(
        ws,
        {
          type: 'road_building_required',
          roadsRemaining: result.roadsToPlace,
        },
        context.currentRoomId,
      );
      break;
    }

    case 'year_of_plenty': {
      const result = gameManager.playYearOfPlenty(
        context.playerId,
        message.cardId,
      );

      if (!result.success) {
        sendMessage(
          ws,
          {
            type: 'dev_card_play_failed',
            reason: result.error || 'Cannot play Year of Plenty',
          },
          context.currentRoomId,
        );
        return;
      }

      // Broadcast card played to all players
      roomManager.broadcastToRoom(context.currentRoomId, {
        type: 'dev_card_played',
        playerId: context.playerId,
        cardType: 'year_of_plenty',
        cardId: message.cardId,
      });

      // Send resource picker to player
      sendMessage(
        ws,
        {
          type: 'year_of_plenty_required',
          bankResources: result.bankResources,
        },
        context.currentRoomId,
      );
      break;
    }

    case 'monopoly': {
      const result = gameManager.playMonopoly(context.playerId, message.cardId);

      if (!result.success) {
        sendMessage(
          ws,
          {
            type: 'dev_card_play_failed',
            reason: result.error || 'Cannot play Monopoly',
          },
          context.currentRoomId,
        );
        return;
      }

      // Broadcast card played to all players (but don't reveal choice yet)
      roomManager.broadcastToRoom(context.currentRoomId, {
        type: 'dev_card_played',
        playerId: context.playerId,
        cardType: 'monopoly',
        cardId: message.cardId,
      });

      // Send resource picker to player
      sendMessage(
        ws,
        {
          type: 'monopoly_required',
        },
        context.currentRoomId,
      );
      break;
    }

    default: {
      sendMessage(
        ws,
        {
          type: 'dev_card_play_failed',
          reason: 'Unknown card type',
        },
        context.currentRoomId,
      );
    }
  }
}

/**
 * Handle year_of_plenty_select message.
 * Player selects which 2 resources to take from the bank.
 */
export function handleYearOfPlentySelect(
  ws: WebSocket,
  message: YearOfPlentySelectMessage,
  roomManager: RoomManager,
  context: { currentRoomId: string | null; playerId: string | null },
): void {
  if (!context.currentRoomId || !context.playerId) {
    sendError(ws, 'Not in a room');
    return;
  }

  const room = roomManager.getRoom(context.currentRoomId);
  if (!room?.gameManager) {
    sendError(ws, 'Game not started');
    return;
  }

  const { resources } = message;
  const result = room.gameManager.completeYearOfPlenty(
    context.playerId,
    resources,
  );

  if (!result.success) {
    sendMessage(
      ws,
      {
        type: 'dev_card_play_failed',
        reason: result.error || 'Failed to complete Year of Plenty',
      },
      context.currentRoomId,
    );
    return;
  }

  // Broadcast completion to all players
  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'year_of_plenty_completed',
    playerId: context.playerId,
    resources,
  });
}

/**
 * Handle monopoly_select message.
 * Player selects which resource type to monopolize from all players.
 */
export function handleMonopolySelect(
  ws: WebSocket,
  message: MonopolySelectMessage,
  roomManager: RoomManager,
  context: { currentRoomId: string | null; playerId: string | null },
): void {
  if (!context.currentRoomId || !context.playerId) {
    sendError(ws, 'Not in a room');
    return;
  }

  const room = roomManager.getRoom(context.currentRoomId);
  if (!room?.gameManager) {
    sendError(ws, 'Game not started');
    return;
  }

  const { resourceType } = message;
  const result = room.gameManager.completeMonopoly(
    context.playerId,
    resourceType,
  );

  if (!result.success) {
    sendMessage(
      ws,
      {
        type: 'dev_card_play_failed',
        reason: result.error || 'Failed to complete Monopoly',
      },
      context.currentRoomId,
    );
    return;
  }

  // Broadcast to all players (public announcement)
  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'monopoly_executed',
    playerId: context.playerId,
    resourceType,
    totalCollected: result.totalCollected,
    fromPlayers: result.fromPlayers,
  });
}

/**
 * Handle road_building_place message.
 * Player places one of the two free roads from Road Building card.
 */
export function handleRoadBuildingPlace(
  ws: WebSocket,
  message: RoadBuildingPlaceMessage,
  roomManager: RoomManager,
  context: { currentRoomId: string | null; playerId: string | null },
): void {
  if (!context.currentRoomId || !context.playerId) {
    sendError(ws, 'Not in a room');
    return;
  }

  const room = roomManager.getRoom(context.currentRoomId);
  if (!room?.gameManager) {
    sendError(ws, 'Game not started');
    return;
  }

  const { edgeId } = message;
  const result = room.gameManager.placeRoadBuildingRoad(
    context.playerId,
    edgeId,
  );

  if (!result.success) {
    sendMessage(
      ws,
      {
        type: 'build_failed', // Reuse existing error type
        reason: result.error,
      },
      context.currentRoomId,
    );
    return;
  }

  // Broadcast road placed to all players
  roomManager.broadcastToRoom(context.currentRoomId, {
    type: 'road_building_placed',
    playerId: context.playerId,
    edgeId,
    roadsRemaining: result.roadsRemaining,
  });

  // Broadcast longest road if transferred
  broadcastLongestRoadIfTransferred(
    roomManager,
    context.currentRoomId,
    result.longestRoadResult,
  );

  // Check for victory (longest road may have transferred)
  if (result.victoryResult) {
    broadcastVictory(roomManager, context.currentRoomId, result.victoryResult);
    return;
  }

  if (result.complete) {
    // Broadcast completion to all players
    roomManager.broadcastToRoom(context.currentRoomId, {
      type: 'road_building_completed',
      playerId: context.playerId,
      edgesPlaced: result.edgesPlaced,
    });
  } else {
    // Send updated required message to player
    sendMessage(
      ws,
      {
        type: 'road_building_required',
        roadsRemaining: result.roadsRemaining,
      },
      context.currentRoomId,
    );
  }
}
