import { z } from 'zod';
import { PLAYER_COLORS, ROOM_ID_LENGTH } from '../constants';
import { BoardStateSchema } from './board';
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
export const ResourceCostSchema = z.record(
  z.enum(['wood', 'brick', 'sheep', 'wheat', 'ore']),
  z.number(),
);

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

export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;
