import { z } from 'zod';
import { PLAYER_COLORS, ROOM_ID_LENGTH } from '../constants';
import { BoardStateSchema } from './board';
import {
  DevelopmentCardTypeSchema,
  OwnedDevCardSchema,
  ResourceTypeSchema,
} from './game';
import { PlayerSchema } from './player';
import { RoomSchema } from './room';

const roomIdSchema = z
  .string()
  .length(ROOM_ID_LENGTH)
  .regex(/^[0-9A-Z]{6}$/);
const nicknameSchema = z.string().trim().min(2).max(30);
const playerIdSchema = z.string();

export const JoinRoomMessageSchema = z.object({
  type: z.literal('join_room'),
  roomId: roomIdSchema,
  nickname: nicknameSchema,
});

export const CreateRoomMessageSchema = z.object({
  type: z.literal('create_room'),
  nickname: nicknameSchema,
});

export const RoomCreatedMessageSchema = z.object({
  type: z.literal('room_created'),
  roomId: z.string(),
  player: PlayerSchema,
});

export const PlayerJoinedMessageSchema = z.object({
  type: z.literal('player_joined'),
  player: PlayerSchema,
});

export const PlayerLeftMessageSchema = z.object({
  type: z.literal('player_left'),
  playerId: playerIdSchema,
});

export const PlayerReadyMessageSchema = z.object({
  type: z.literal('player_ready'),
  playerId: playerIdSchema,
  ready: z.boolean(),
});

export const ChangeColorMessageSchema = z.object({
  type: z.literal('change_color'),
  playerId: playerIdSchema,
  color: z.enum(PLAYER_COLORS),
});

export const ColorChangedMessageSchema = z.object({
  type: z.literal('color_changed'),
  playerId: playerIdSchema,
  color: z.string(),
});

export const ToggleReadyMessageSchema = z.object({
  type: z.literal('toggle_ready'),
  playerId: playerIdSchema,
});

export const GameStartingMessageSchema = z.object({
  type: z.literal('game_starting'),
  countdown: z.number(),
});

export const GameStartedMessageSchema = z.object({
  type: z.literal('game_started'),
  board: BoardStateSchema,
});

export const RoomStateMessageSchema = z.object({
  type: z.literal('room_state'),
  room: RoomSchema,
});

export const ErrorMessageSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
});

// Placement Phase Messages
export const PlaceSettlementMessageSchema = z.object({
  type: z.literal('place_settlement'),
  vertexId: z.string(),
});

export const PlaceRoadMessageSchema = z.object({
  type: z.literal('place_road'),
  edgeId: z.string(),
});

export const SettlementPlacedMessageSchema = z.object({
  type: z.literal('settlement_placed'),
  vertexId: z.string(),
  playerId: z.string(),
  isSecondSettlement: z.boolean(),
  resourcesGranted: z
    .array(
      z.object({
        type: z.enum(['wood', 'brick', 'sheep', 'wheat', 'ore']),
        count: z.number(),
      }),
    )
    .optional(),
});

export const RoadPlacedMessageSchema = z.object({
  type: z.literal('road_placed'),
  edgeId: z.string(),
  playerId: z.string(),
});

export const PlacementTurnMessageSchema = z.object({
  type: z.literal('placement_turn'),
  currentPlayerIndex: z.number(),
  currentPlayerId: z.string(),
  phase: z.enum(['settlement', 'road']),
  round: z.union([z.literal(1), z.literal(2)]),
  turnNumber: z.number(),
});

export const SetupCompleteMessageSchema = z.object({
  type: z.literal('setup_complete'),
  nextPlayerId: z.string(),
});

export const InvalidPlacementMessageSchema = z.object({
  type: z.literal('invalid_placement'),
  reason: z.string(),
});

// Turn Phase Messages
export const RollDiceMessageSchema = z.object({
  type: z.literal('roll_dice'),
});

export const ResourceDistributionSchema = z.object({
  playerId: z.string(),
  resources: z.array(
    z.object({
      type: z.enum(['wood', 'brick', 'sheep', 'wheat', 'ore']),
      count: z.number(),
    }),
  ),
});

export const DiceRolledMessageSchema = z.object({
  type: z.literal('dice_rolled'),
  dice1: z.number().min(1).max(6),
  dice2: z.number().min(1).max(6),
  total: z.number().min(2).max(12),
  resourcesDistributed: z.array(ResourceDistributionSchema),
});

export const EndTurnMessageSchema = z.object({
  type: z.literal('end_turn'),
});

export const TurnChangedMessageSchema = z.object({
  type: z.literal('turn_changed'),
  currentPlayerId: z.string(),
  turnNumber: z.number(),
  phase: z.enum(['roll', 'main']),
});

// Building Phase Messages - Request schemas (client -> server)
export const BuildRoadMessageSchema = z.object({
  type: z.literal('build_road'),
  edgeId: z.string(),
});

export const BuildSettlementMessageSchema = z.object({
  type: z.literal('build_settlement'),
  vertexId: z.string(),
});

export const BuildCityMessageSchema = z.object({
  type: z.literal('build_city'),
  vertexId: z.string(),
});

// Building Phase Messages - Response/broadcast schemas (server -> clients)
export const ResourceCostSchema = z
  .object({
    wood: z.number(),
    brick: z.number(),
    sheep: z.number(),
    wheat: z.number(),
    ore: z.number(),
  })
  .partial();

export const RoadBuiltMessageSchema = z.object({
  type: z.literal('road_built'),
  edgeId: z.string(),
  playerId: z.string(),
  resourcesSpent: ResourceCostSchema,
});

export const SettlementBuiltMessageSchema = z.object({
  type: z.literal('settlement_built'),
  vertexId: z.string(),
  playerId: z.string(),
  resourcesSpent: ResourceCostSchema,
});

export const CityBuiltMessageSchema = z.object({
  type: z.literal('city_built'),
  vertexId: z.string(),
  playerId: z.string(),
  resourcesSpent: ResourceCostSchema,
});

export const BuildFailedMessageSchema = z.object({
  type: z.literal('build_failed'),
  reason: z.string(),
});

// Resource record schema for trade offers (reusable)
const ResourceRecordSchema = z.record(
  z.enum(['wood', 'brick', 'sheep', 'wheat', 'ore']),
  z.number(),
);

// Trading Phase Messages - Client -> Server
export const ProposeTradeMessageSchema = z.object({
  type: z.literal('propose_trade'),
  offering: ResourceRecordSchema,
  requesting: ResourceRecordSchema,
});

export const RespondTradeMessageSchema = z.object({
  type: z.literal('respond_trade'),
  response: z.enum(['accept', 'decline']),
});

export const SelectTradePartnerMessageSchema = z.object({
  type: z.literal('select_trade_partner'),
  partnerId: z.string(),
});

export const CancelTradeMessageSchema = z.object({
  type: z.literal('cancel_trade'),
});

export const ExecuteBankTradeMessageSchema = z.object({
  type: z.literal('execute_bank_trade'),
  giving: ResourceRecordSchema,
  receiving: ResourceRecordSchema,
});

// Trading Phase Messages - Server -> Client broadcasts
export const TradeProposedMessageSchema = z.object({
  type: z.literal('trade_proposed'),
  proposerId: z.string(),
  offering: ResourceRecordSchema,
  requesting: ResourceRecordSchema,
});

export const TradeResponseMessageSchema = z.object({
  type: z.literal('trade_response'),
  playerId: z.string(),
  response: z.enum(['accepted', 'declined']),
});

export const TradeExecutedMessageSchema = z.object({
  type: z.literal('trade_executed'),
  proposerId: z.string(),
  partnerId: z.string(),
  proposerGave: ResourceRecordSchema,
  partnerGave: ResourceRecordSchema,
});

export const TradeCancelledMessageSchema = z.object({
  type: z.literal('trade_cancelled'),
});

export const BankTradeExecutedMessageSchema = z.object({
  type: z.literal('bank_trade_executed'),
  playerId: z.string(),
  gave: ResourceRecordSchema,
  received: ResourceRecordSchema,
});

// Robber Phase Messages - Client -> Server
export const DiscardSubmittedMessageSchema = z.object({
  type: z.literal('discard_submitted'),
  resources: ResourceRecordSchema, // What player is discarding
});

export const MoveRobberMessageSchema = z.object({
  type: z.literal('move_robber'),
  hexId: z.string(), // "q,r" format
});

export const StealTargetMessageSchema = z.object({
  type: z.literal('steal_target'),
  victimId: z.string(),
});

// Robber Phase Messages - Server -> Client
export const DiscardRequiredMessageSchema = z.object({
  type: z.literal('discard_required'),
  playerId: z.string(),
  targetCount: z.number(), // How many cards to discard
  currentResources: ResourceRecordSchema, // Player's current resources
});

export const DiscardCompletedMessageSchema = z.object({
  type: z.literal('discard_completed'),
  playerId: z.string(),
  discarded: ResourceRecordSchema,
});

export const AllDiscardsCompleteMessageSchema = z.object({
  type: z.literal('all_discards_complete'),
});

export const RobberMoveRequiredMessageSchema = z.object({
  type: z.literal('robber_move_required'),
  currentHexId: z.string().nullable(),
});

export const RobberMovedMessageSchema = z.object({
  type: z.literal('robber_moved'),
  hexId: z.string(),
  playerId: z.string(),
});

export const StealRequiredMessageSchema = z.object({
  type: z.literal('steal_required'),
  candidates: z.array(
    z.object({
      playerId: z.string(),
      nickname: z.string(),
      cardCount: z.number(),
    }),
  ),
});

export const StolenMessageSchema = z.object({
  type: z.literal('stolen'),
  thiefId: z.string(),
  victimId: z.string(),
  resourceType: z.enum(['wood', 'brick', 'sheep', 'wheat', 'ore']).nullable(), // null if victim had no cards
});

export const NoStealPossibleMessageSchema = z.object({
  type: z.literal('no_steal_possible'),
});

export const RobberTriggeredMessageSchema = z.object({
  type: z.literal('robber_triggered'),
  mustDiscardPlayers: z.array(
    z.object({
      playerId: z.string(),
      targetCount: z.number(),
    }),
  ),
});

// Development Card Messages - Client -> Server
export const BuyDevCardMessageSchema = z.object({
  type: z.literal('buy_dev_card'),
});

export const PlayDevCardMessageSchema = z.object({
  type: z.literal('play_dev_card'),
  cardId: z.string(),
});

export const YearOfPlentySelectMessageSchema = z.object({
  type: z.literal('year_of_plenty_select'),
  resources: z.tuple([ResourceTypeSchema, ResourceTypeSchema]), // Exactly 2 resources
});

export const MonopolySelectMessageSchema = z.object({
  type: z.literal('monopoly_select'),
  resourceType: ResourceTypeSchema,
});

export const RoadBuildingPlaceMessageSchema = z.object({
  type: z.literal('road_building_place'),
  edgeId: z.string(),
});

// Development Card Messages - Server -> Client
export const DevCardPurchasedMessageSchema = z.object({
  type: z.literal('dev_card_purchased'),
  playerId: z.string(),
  card: OwnedDevCardSchema, // Full card info for buyer
  deckRemaining: z.number(),
});

export const DevCardPurchasedPublicMessageSchema = z.object({
  type: z.literal('dev_card_purchased_public'),
  playerId: z.string(),
  deckRemaining: z.number(),
});

export const DevCardPlayedMessageSchema = z.object({
  type: z.literal('dev_card_played'),
  playerId: z.string(),
  cardType: DevelopmentCardTypeSchema,
  cardId: z.string(),
});

export const YearOfPlentyRequiredMessageSchema = z.object({
  type: z.literal('year_of_plenty_required'),
  bankResources: z.record(ResourceTypeSchema, z.number()), // Available bank resources
});

export const YearOfPlentyCompletedMessageSchema = z.object({
  type: z.literal('year_of_plenty_completed'),
  playerId: z.string(),
  resources: z.tuple([ResourceTypeSchema, ResourceTypeSchema]),
});

export const MonopolyExecutedMessageSchema = z.object({
  type: z.literal('monopoly_executed'),
  playerId: z.string(),
  resourceType: ResourceTypeSchema,
  totalCollected: z.number(),
  fromPlayers: z.record(z.string(), z.number()), // playerId -> amount taken
});

export const RoadBuildingRequiredMessageSchema = z.object({
  type: z.literal('road_building_required'),
  roadsRemaining: z.number(), // 0, 1, or 2
});

export const RoadBuildingPlacedMessageSchema = z.object({
  type: z.literal('road_building_placed'),
  playerId: z.string(),
  edgeId: z.string(),
  roadsRemaining: z.number(),
});

export const RoadBuildingCompletedMessageSchema = z.object({
  type: z.literal('road_building_completed'),
  playerId: z.string(),
  edgesPlaced: z.array(z.string()),
});

export const DevCardPlayFailedMessageSchema = z.object({
  type: z.literal('dev_card_play_failed'),
  reason: z.string(),
});

export const WebSocketMessageSchema = z.discriminatedUnion('type', [
  JoinRoomMessageSchema,
  CreateRoomMessageSchema,
  RoomCreatedMessageSchema,
  PlayerJoinedMessageSchema,
  PlayerLeftMessageSchema,
  PlayerReadyMessageSchema,
  ChangeColorMessageSchema,
  ColorChangedMessageSchema,
  ToggleReadyMessageSchema,
  GameStartingMessageSchema,
  GameStartedMessageSchema,
  RoomStateMessageSchema,
  ErrorMessageSchema,
  // Placement messages
  PlaceSettlementMessageSchema,
  PlaceRoadMessageSchema,
  SettlementPlacedMessageSchema,
  RoadPlacedMessageSchema,
  PlacementTurnMessageSchema,
  SetupCompleteMessageSchema,
  InvalidPlacementMessageSchema,
  // Turn phase messages
  RollDiceMessageSchema,
  DiceRolledMessageSchema,
  EndTurnMessageSchema,
  TurnChangedMessageSchema,
  // Building phase messages
  BuildRoadMessageSchema,
  BuildSettlementMessageSchema,
  BuildCityMessageSchema,
  RoadBuiltMessageSchema,
  SettlementBuiltMessageSchema,
  CityBuiltMessageSchema,
  BuildFailedMessageSchema,
  // Trading phase messages - client to server
  ProposeTradeMessageSchema,
  RespondTradeMessageSchema,
  SelectTradePartnerMessageSchema,
  CancelTradeMessageSchema,
  ExecuteBankTradeMessageSchema,
  // Trading phase messages - server to clients
  TradeProposedMessageSchema,
  TradeResponseMessageSchema,
  TradeExecutedMessageSchema,
  TradeCancelledMessageSchema,
  BankTradeExecutedMessageSchema,
  // Robber phase messages - client to server
  DiscardSubmittedMessageSchema,
  MoveRobberMessageSchema,
  StealTargetMessageSchema,
  // Robber phase messages - server to clients
  DiscardRequiredMessageSchema,
  DiscardCompletedMessageSchema,
  AllDiscardsCompleteMessageSchema,
  RobberTriggeredMessageSchema,
  RobberMoveRequiredMessageSchema,
  RobberMovedMessageSchema,
  StealRequiredMessageSchema,
  StolenMessageSchema,
  NoStealPossibleMessageSchema,
  // Development card messages - client to server
  BuyDevCardMessageSchema,
  PlayDevCardMessageSchema,
  YearOfPlentySelectMessageSchema,
  MonopolySelectMessageSchema,
  RoadBuildingPlaceMessageSchema,
  // Development card messages - server to clients
  DevCardPurchasedMessageSchema,
  DevCardPurchasedPublicMessageSchema,
  DevCardPlayedMessageSchema,
  YearOfPlentyRequiredMessageSchema,
  YearOfPlentyCompletedMessageSchema,
  MonopolyExecutedMessageSchema,
  RoadBuildingRequiredMessageSchema,
  RoadBuildingPlacedMessageSchema,
  RoadBuildingCompletedMessageSchema,
  DevCardPlayFailedMessageSchema,
]);

export type JoinRoomMessage = z.infer<typeof JoinRoomMessageSchema>;
export type CreateRoomMessage = z.infer<typeof CreateRoomMessageSchema>;
export type RoomCreatedMessage = z.infer<typeof RoomCreatedMessageSchema>;
export type PlayerJoinedMessage = z.infer<typeof PlayerJoinedMessageSchema>;
export type PlayerLeftMessage = z.infer<typeof PlayerLeftMessageSchema>;
export type PlayerReadyMessage = z.infer<typeof PlayerReadyMessageSchema>;
export type ChangeColorMessage = z.infer<typeof ChangeColorMessageSchema>;
export type ColorChangedMessage = z.infer<typeof ColorChangedMessageSchema>;
export type ToggleReadyMessage = z.infer<typeof ToggleReadyMessageSchema>;
export type GameStartingMessage = z.infer<typeof GameStartingMessageSchema>;
export type GameStartedMessage = z.infer<typeof GameStartedMessageSchema>;
export type RoomStateMessage = z.infer<typeof RoomStateMessageSchema>;
export type ErrorMessage = z.infer<typeof ErrorMessageSchema>;
// New placement types
export type PlaceSettlementMessage = z.infer<
  typeof PlaceSettlementMessageSchema
>;
export type PlaceRoadMessage = z.infer<typeof PlaceRoadMessageSchema>;
export type SettlementPlacedMessage = z.infer<
  typeof SettlementPlacedMessageSchema
>;
export type RoadPlacedMessage = z.infer<typeof RoadPlacedMessageSchema>;
export type PlacementTurnMessage = z.infer<typeof PlacementTurnMessageSchema>;
export type SetupCompleteMessage = z.infer<typeof SetupCompleteMessageSchema>;
export type InvalidPlacementMessage = z.infer<
  typeof InvalidPlacementMessageSchema
>;
// Turn phase message types
export type RollDiceMessage = z.infer<typeof RollDiceMessageSchema>;
export type DiceRolledMessage = z.infer<typeof DiceRolledMessageSchema>;
export type EndTurnMessage = z.infer<typeof EndTurnMessageSchema>;
export type TurnChangedMessage = z.infer<typeof TurnChangedMessageSchema>;
export type ResourceDistribution = z.infer<typeof ResourceDistributionSchema>;
// Building phase message types
export type BuildRoadMessage = z.infer<typeof BuildRoadMessageSchema>;
export type BuildSettlementMessage = z.infer<
  typeof BuildSettlementMessageSchema
>;
export type BuildCityMessage = z.infer<typeof BuildCityMessageSchema>;
export type ResourceCost = z.infer<typeof ResourceCostSchema>;
export type RoadBuiltMessage = z.infer<typeof RoadBuiltMessageSchema>;
export type SettlementBuiltMessage = z.infer<
  typeof SettlementBuiltMessageSchema
>;
export type CityBuiltMessage = z.infer<typeof CityBuiltMessageSchema>;
export type BuildFailedMessage = z.infer<typeof BuildFailedMessageSchema>;
// Trading phase message types - client to server
export type ProposeTradeMessage = z.infer<typeof ProposeTradeMessageSchema>;
export type RespondTradeMessage = z.infer<typeof RespondTradeMessageSchema>;
export type SelectTradePartnerMessage = z.infer<
  typeof SelectTradePartnerMessageSchema
>;
export type CancelTradeMessage = z.infer<typeof CancelTradeMessageSchema>;
export type ExecuteBankTradeMessage = z.infer<
  typeof ExecuteBankTradeMessageSchema
>;
// Trading phase message types - server to clients
export type TradeProposedMessage = z.infer<typeof TradeProposedMessageSchema>;
export type TradeResponseMessage = z.infer<typeof TradeResponseMessageSchema>;
export type TradeExecutedMessage = z.infer<typeof TradeExecutedMessageSchema>;
export type TradeCancelledMessage = z.infer<typeof TradeCancelledMessageSchema>;
export type BankTradeExecutedMessage = z.infer<
  typeof BankTradeExecutedMessageSchema
>;
// Robber phase message types - client to server
export type DiscardSubmittedMessage = z.infer<
  typeof DiscardSubmittedMessageSchema
>;
export type MoveRobberMessage = z.infer<typeof MoveRobberMessageSchema>;
export type StealTargetMessage = z.infer<typeof StealTargetMessageSchema>;
// Robber phase message types - server to clients
export type DiscardRequiredMessage = z.infer<
  typeof DiscardRequiredMessageSchema
>;
export type DiscardCompletedMessage = z.infer<
  typeof DiscardCompletedMessageSchema
>;
export type AllDiscardsCompleteMessage = z.infer<
  typeof AllDiscardsCompleteMessageSchema
>;
export type RobberTriggeredMessage = z.infer<
  typeof RobberTriggeredMessageSchema
>;
export type RobberMoveRequiredMessage = z.infer<
  typeof RobberMoveRequiredMessageSchema
>;
export type RobberMovedMessage = z.infer<typeof RobberMovedMessageSchema>;
export type StealRequiredMessage = z.infer<typeof StealRequiredMessageSchema>;
export type StolenMessage = z.infer<typeof StolenMessageSchema>;
export type NoStealPossibleMessage = z.infer<
  typeof NoStealPossibleMessageSchema
>;
// Development card message types - client to server
export type BuyDevCardMessage = z.infer<typeof BuyDevCardMessageSchema>;
export type PlayDevCardMessage = z.infer<typeof PlayDevCardMessageSchema>;
export type YearOfPlentySelectMessage = z.infer<
  typeof YearOfPlentySelectMessageSchema
>;
export type MonopolySelectMessage = z.infer<typeof MonopolySelectMessageSchema>;
export type RoadBuildingPlaceMessage = z.infer<
  typeof RoadBuildingPlaceMessageSchema
>;
// Development card message types - server to clients
export type DevCardPurchasedMessage = z.infer<
  typeof DevCardPurchasedMessageSchema
>;
export type DevCardPurchasedPublicMessage = z.infer<
  typeof DevCardPurchasedPublicMessageSchema
>;
export type DevCardPlayedMessage = z.infer<typeof DevCardPlayedMessageSchema>;
export type YearOfPlentyRequiredMessage = z.infer<
  typeof YearOfPlentyRequiredMessageSchema
>;
export type YearOfPlentyCompletedMessage = z.infer<
  typeof YearOfPlentyCompletedMessageSchema
>;
export type MonopolyExecutedMessage = z.infer<
  typeof MonopolyExecutedMessageSchema
>;
export type RoadBuildingRequiredMessage = z.infer<
  typeof RoadBuildingRequiredMessageSchema
>;
export type RoadBuildingPlacedMessage = z.infer<
  typeof RoadBuildingPlacedMessageSchema
>;
export type RoadBuildingCompletedMessage = z.infer<
  typeof RoadBuildingCompletedMessageSchema
>;
export type DevCardPlayFailedMessage = z.infer<
  typeof DevCardPlayFailedMessageSchema
>;

export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;
