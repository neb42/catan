/**
 * Client -> Server WebSocket Message Schemas
 *
 * Defines Zod schemas for all messages sent from client to server.
 * Uses discriminated union pattern for type-safe message routing.
 */

import { z } from 'zod';

/**
 * HANDSHAKE - Initial connection message
 *
 * Sent by client immediately after WebSocket connection opens.
 * - clientId = null: New connection (server will generate UUID)
 * - clientId = UUID: Reconnection attempt (server will restore session if within grace period)
 */
export const HandshakeMessageSchema = z.object({
  type: z.literal('HANDSHAKE'),
  payload: z.object({
    clientId: z.string().uuid().nullable(),
  }),
});

export type HandshakeMessage = z.infer<typeof HandshakeMessageSchema>;

/**
 * JOIN_ROOM - Request to join a room
 *
 * Sent by client to join a specific room.
 * Server will respond with ROOM_JOINED on success or ERROR on failure.
 */
export const JoinRoomMessageSchema = z.object({
  type: z.literal('JOIN_ROOM'),
  payload: z.object({
    roomId: z.string(),
  }),
});

export type JoinRoomMessage = z.infer<typeof JoinRoomMessageSchema>;

/**
 * SET_NICKNAME - Set user nickname
 *
 * Sent by client to set their nickname before joining the lobby.
 * Server will respond with NICKNAME_ACCEPTED if unique and valid,
 * or NICKNAME_REJECTED if already taken or invalid.
 */
export const SetNicknameMessageSchema = z.object({
  type: z.literal('SET_NICKNAME'),
  payload: z.object({
    nickname: z.string().min(3).max(30).trim(),
  }),
});

export type SetNicknameMessage = z.infer<typeof SetNicknameMessageSchema>;

/**
 * ClientMessageSchema - Discriminated union of all client messages
 *
 * Use this schema to validate incoming client messages.
 * TypeScript will automatically narrow the type based on the 'type' discriminator.
 */
export const ClientMessageSchema = z.discriminatedUnion('type', [
  HandshakeMessageSchema,
  JoinRoomMessageSchema,
  SetNicknameMessageSchema,
]);

export type ClientMessage = z.infer<typeof ClientMessageSchema>;
