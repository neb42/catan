/**
 * Server -> Client WebSocket Message Schemas
 *
 * Defines Zod schemas for all messages sent from server to client.
 * All server messages include messageId and timestamp for correlation and debugging.
 */

import { z } from 'zod';

/**
 * CLIENT_ID - Server assigns client ID after handshake
 *
 * Sent by server in response to HANDSHAKE message.
 * Client should persist this ID in memory for reconnection attempts.
 */
export const ClientIdMessageSchema = z.object({
  type: z.literal('CLIENT_ID'),
  payload: z.object({
    clientId: z.string().uuid(),
  }),
  messageId: z.string(),
  timestamp: z.number(),
});

export type ClientIdMessage = z.infer<typeof ClientIdMessageSchema>;

/**
 * ERROR - Server error response
 *
 * Sent when client message fails validation or processing.
 * - code: Error type identifier (e.g., 'INVALID_MESSAGE', 'ROOM_NOT_FOUND')
 * - message: Human-readable error description
 * - details: Optional additional context (validation errors, etc.)
 */
export const ErrorMessageSchema = z.object({
  type: z.literal('ERROR'),
  payload: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
  messageId: z.string(),
  timestamp: z.number(),
});

export type ErrorMessage = z.infer<typeof ErrorMessageSchema>;

/**
 * ROOM_JOINED - Confirmation of successful room join
 *
 * Sent by server in response to successful JOIN_ROOM request.
 * Confirms client is now a member of the specified room.
 */
export const RoomJoinedMessageSchema = z.object({
  type: z.literal('ROOM_JOINED'),
  payload: z.object({
    roomId: z.string(),
    clientId: z.string().uuid(),
  }),
  messageId: z.string(),
  timestamp: z.number(),
});

export type RoomJoinedMessage = z.infer<typeof RoomJoinedMessageSchema>;

/**
 * ServerMessageSchema - Discriminated union of all server messages
 *
 * Use this schema to validate outgoing server messages.
 * TypeScript will automatically narrow the type based on the 'type' discriminator.
 */
export const ServerMessageSchema = z.discriminatedUnion('type', [
  ClientIdMessageSchema,
  ErrorMessageSchema,
  RoomJoinedMessageSchema,
]);

export type ServerMessage = z.infer<typeof ServerMessageSchema>;
