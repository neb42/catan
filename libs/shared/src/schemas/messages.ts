import { z } from 'zod';
import { PLAYER_COLORS, ROOM_ID_LENGTH } from '../constants';
import { PlayerSchema } from './player';
import { RoomSchema } from './room';
import { GameStateSchema } from './game';

const roomIdSchema = z.string().length(ROOM_ID_LENGTH).regex(/^[0-9A-Z]{6}$/);
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

export const RoomStateMessageSchema = z.object({
  type: z.literal('room_state'),
  room: RoomSchema,
});

export const StartGameMessageSchema = z.object({
  type: z.literal('start_game'),
  roomId: roomIdSchema,
});

export const PlaceSettlementMessageSchema = z.object({
  type: z.literal('place_settlement'),
  playerId: playerIdSchema,
  vertexId: z.string(),
});

export const PlaceRoadMessageSchema = z.object({
  type: z.literal('place_road'),
  playerId: playerIdSchema,
  edgeId: z.string(),
});

export const RollDiceMessageSchema = z.object({
  type: z.literal('roll_dice'),
  playerId: playerIdSchema,
});

export const EndTurnMessageSchema = z.object({
  type: z.literal('end_turn'),
  playerId: playerIdSchema,
});

export const GameStateMessageSchema = z.object({
  type: z.literal('game_state'),
  gameState: GameStateSchema,
});

export const ErrorMessageSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
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
  RoomStateMessageSchema,
  StartGameMessageSchema,
  PlaceSettlementMessageSchema,
  PlaceRoadMessageSchema,
  RollDiceMessageSchema,
  EndTurnMessageSchema,
  GameStateMessageSchema,
  ErrorMessageSchema,
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
export type RoomStateMessage = z.infer<typeof RoomStateMessageSchema>;
export type StartGameMessage = z.infer<typeof StartGameMessageSchema>;
export type PlaceSettlementMessage = z.infer<typeof PlaceSettlementMessageSchema>;
export type PlaceRoadMessage = z.infer<typeof PlaceRoadMessageSchema>;
export type RollDiceMessage = z.infer<typeof RollDiceMessageSchema>;
export type EndTurnMessage = z.infer<typeof EndTurnMessageSchema>;
export type GameStateMessage = z.infer<typeof GameStateMessageSchema>;
export type ErrorMessage = z.infer<typeof ErrorMessageSchema>;
export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;
