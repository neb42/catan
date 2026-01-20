import { z } from 'zod';

import {
  NicknameSchema,
  PlayerIdSchema,
  PlayerSchema,
} from './player';
import { RoomIdSchema, RoomSchema } from './room';

const ColorSchema = PlayerSchema.shape.color;

export const JoinRoomMessageSchema = z.object({
  type: z.literal('join_room'),
  roomId: RoomIdSchema,
  nickname: NicknameSchema,
});

export const CreateRoomMessageSchema = z.object({
  type: z.literal('create_room'),
  nickname: NicknameSchema,
});

export const RoomCreatedMessageSchema = z.object({
  type: z.literal('room_created'),
  roomId: RoomIdSchema,
  player: PlayerSchema,
});

export const PlayerJoinedMessageSchema = z.object({
  type: z.literal('player_joined'),
  player: PlayerSchema,
});

export const PlayerLeftMessageSchema = z.object({
  type: z.literal('player_left'),
  playerId: PlayerIdSchema,
});

export const PlayerReadyMessageSchema = z.object({
  type: z.literal('player_ready'),
  playerId: PlayerIdSchema,
  ready: z.boolean(),
});

export const ChangeColorMessageSchema = z.object({
  type: z.literal('change_color'),
  playerId: PlayerIdSchema,
  color: ColorSchema,
});

export const ColorChangedMessageSchema = z.object({
  type: z.literal('color_changed'),
  playerId: PlayerIdSchema,
  color: ColorSchema,
});

export const ToggleReadyMessageSchema = z.object({
  type: z.literal('toggle_ready'),
  playerId: PlayerIdSchema,
});

export const GameStartingMessageSchema = z.object({
  type: z.literal('game_starting'),
  countdown: z.number().int().nonnegative(),
});

export const RoomStateMessageSchema = z.object({
  type: z.literal('room_state'),
  room: RoomSchema,
});

export const ErrorMessageSchema = z.object({
  type: z.literal('error'),
  message: z.enum([
    'Room not found',
    'Room is full',
    'Nickname taken',
    'Invalid room ID',
    'Color already taken',
  ]),
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
export type ErrorMessage = z.infer<typeof ErrorMessageSchema>;
export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;
