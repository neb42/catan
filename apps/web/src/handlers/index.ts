import { WebSocketMessage } from '@catan/shared';

import { HandlerContext, MessageHandler } from './types';
import {
  handleRoomCreated,
  handleRoomState,
  handlePlayerJoined,
  handlePlayerLeft,
  handlePlayerReady,
  handleColorChanged,
} from './lobbyHandlers';
import {
  handleGameStarting,
  handleGameStarted,
  handleSetupComplete,
} from './gameLifecycleHandlers';
import {
  handlePlacementTurn,
  handleSettlementPlaced,
  handleRoadPlaced,
} from './placementHandlers';
import { handleDiceRolled, handleTurnChanged } from './turnHandlers';
import {
  handleRoadBuilt,
  handleSettlementBuilt,
  handleCityBuilt,
  handleBuildFailed,
} from './buildingHandlers';
import {
  handleTradeProposed,
  handleTradeResponse,
  handleTradeExecuted,
  handleTradeCancelled,
  handleBankTradeExecuted,
} from './tradeHandlers';
import {
  handleDiscardRequired,
  handleDiscardCompleted,
  handleAllDiscardsComplete,
  handleRobberTriggered,
  handleRobberMoveRequired,
  handleRobberMoved,
  handleStealRequired,
  handleStolen,
  handleNoStealPossible,
} from './robberHandlers';
import {
  handleDevCardPurchased,
  handleDevCardPurchasedPublic,
  handleDevCardPlayed,
  handleDevCardPlayFailed,
  handleYearOfPlentyRequired,
  handleYearOfPlentyCompleted,
  handleMonopolyRequired,
  handleMonopolyExecuted,
  handleRoadBuildingRequired,
  handleRoadBuildingPlaced,
  handleRoadBuildingCompleted,
} from './devCardHandlers';
import {
  handleLongestRoadUpdated,
  handleLargestArmyUpdated,
} from './awardHandlers';
import { handleVictory } from './victoryHandlers';
import { handleError } from './errorHandlers';

const handlerRegistry: Partial<
  Record<WebSocketMessage['type'], MessageHandler>
> = {
  // Lobby handlers
  room_created: handleRoomCreated,
  room_state: handleRoomState,
  player_joined: handlePlayerJoined,
  player_left: handlePlayerLeft,
  player_ready: handlePlayerReady,
  color_changed: handleColorChanged,

  // Game lifecycle handlers
  game_starting: handleGameStarting,
  game_started: handleGameStarted,
  setup_complete: handleSetupComplete,

  // Placement handlers
  placement_turn: handlePlacementTurn,
  settlement_placed: handleSettlementPlaced,
  road_placed: handleRoadPlaced,

  // Turn handlers
  dice_rolled: handleDiceRolled,
  turn_changed: handleTurnChanged,

  // Building handlers
  road_built: handleRoadBuilt,
  settlement_built: handleSettlementBuilt,
  city_built: handleCityBuilt,
  build_failed: handleBuildFailed,

  // Trade handlers
  trade_proposed: handleTradeProposed,
  trade_response: handleTradeResponse,
  trade_executed: handleTradeExecuted,
  trade_cancelled: handleTradeCancelled,
  bank_trade_executed: handleBankTradeExecuted,

  // Robber handlers
  discard_required: handleDiscardRequired,
  discard_completed: handleDiscardCompleted,
  all_discards_complete: handleAllDiscardsComplete,
  robber_triggered: handleRobberTriggered,
  robber_move_required: handleRobberMoveRequired,
  robber_moved: handleRobberMoved,
  steal_required: handleStealRequired,
  stolen: handleStolen,
  no_steal_possible: handleNoStealPossible,

  // Dev card handlers
  dev_card_purchased: handleDevCardPurchased,
  dev_card_purchased_public: handleDevCardPurchasedPublic,
  dev_card_played: handleDevCardPlayed,
  dev_card_play_failed: handleDevCardPlayFailed,
  year_of_plenty_required: handleYearOfPlentyRequired,
  year_of_plenty_completed: handleYearOfPlentyCompleted,
  monopoly_required: handleMonopolyRequired,
  monopoly_executed: handleMonopolyExecuted,
  road_building_required: handleRoadBuildingRequired,
  road_building_placed: handleRoadBuildingPlaced,
  road_building_completed: handleRoadBuildingCompleted,

  // Award handlers
  longest_road_updated: handleLongestRoadUpdated,
  largest_army_updated: handleLargestArmyUpdated,

  // Victory handler
  victory: handleVictory,

  // Error handler
  error: handleError,
};

export function handleWebSocketMessage(
  message: WebSocketMessage,
  context: HandlerContext,
): void {
  const handler = handlerRegistry[message.type];
  if (handler) {
    handler(message, context);
  } else {
    console.warn('Unhandled message type:', message.type);
  }
}

export type { HandlerContext };
