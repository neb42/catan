/**
 * WebSocket Message Schemas - Barrel Export
 *
 * Re-exports all message schemas and types for convenient importing.
 */

// Client message schemas and types
export {
  ClientMessageSchema,
  HandshakeMessageSchema,
  JoinRoomMessageSchema,
  SetNicknameMessageSchema,
} from './client-messages.js';

export type {
  ClientMessage,
  HandshakeMessage,
  JoinRoomMessage,
  SetNicknameMessage,
} from './client-messages.js';

// Server message schemas and types
export {
  ServerMessageSchema,
  ClientIdMessageSchema,
  ErrorMessageSchema,
  RoomJoinedMessageSchema,
  NicknameAcceptedMessageSchema,
  NicknameRejectedMessageSchema,
} from './server-messages.js';

export type {
  ServerMessage,
  ClientIdMessage,
  ErrorMessage,
  RoomJoinedMessage,
  NicknameAcceptedMessage,
  NicknameRejectedMessage,
} from './server-messages.js';
