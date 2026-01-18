/**
 * MessageRouter
 * Type-safe WebSocket message routing with Zod validation
 *
 * Features:
 * - Validates all incoming messages against Zod schemas
 * - Routes validated messages to type-specific handlers
 * - Converts validation errors to ERROR responses
 * - Adds messageId and timestamp to all outbound messages
 * - Delegates state changes to ConnectionManager and RoomManager
 */

import { randomUUID } from 'crypto';
import { ZodError } from 'zod';
import { ClientMessageSchema } from './schemas';
import type { ClientIdMessage, ErrorMessage, RoomJoinedMessage } from './schemas';
import { ConnectionManager } from './connection-manager';
import { RoomManager } from './room-manager';

/**
 * Error code to human-readable message mapping
 */
function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'INVALID_MESSAGE': 'Message failed validation',
    'MALFORMED_JSON': 'Invalid JSON format',
    'UNKNOWN_MESSAGE_TYPE': 'Unrecognized message type',
    'ROOM_FULL': 'Room has reached maximum capacity',
  };

  return messages[code] || 'Unknown error';
}

export class MessageRouter {
  private connectionManager: ConnectionManager;
  private roomManager: RoomManager;

  constructor(connectionManager: ConnectionManager, roomManager: RoomManager) {
    this.connectionManager = connectionManager;
    this.roomManager = roomManager;
  }

  /**
   * Route an incoming message to the appropriate handler
   * Validates with Zod and handles parsing errors
   * @param clientId Client ID of sender
   * @param data Raw message buffer
   */
  routeMessage(clientId: string, data: Buffer): void {
    try {
      // Parse JSON
      const raw = JSON.parse(data.toString());

      // Validate with Zod schema
      const message = ClientMessageSchema.parse(raw);

      // Route based on discriminated union type
      switch (message.type) {
        case 'HANDSHAKE':
          this.handleHandshake(clientId, message.payload);
          break;

        case 'JOIN_ROOM':
          this.handleJoinRoom(clientId, message.payload);
          break;

        default:
          // TypeScript exhaustiveness check - should never reach here
          this.sendError(clientId, 'UNKNOWN_MESSAGE_TYPE', 'Unrecognized message type');
          break;
      }
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        this.sendError(clientId, 'INVALID_MESSAGE', error.issues);
        return;
      }

      // Handle JSON parse errors
      if (error instanceof SyntaxError) {
        this.sendError(clientId, 'MALFORMED_JSON', error.message);
        return;
      }

      // Unexpected error
      console.error(`[MessageRouter] Unexpected error routing message from ${clientId}:`, error);
      this.sendError(clientId, 'INTERNAL_ERROR', 'An unexpected error occurred');
    }
  }

  /**
   * Handle HANDSHAKE message
   * Assigns client ID (new or restored) and sends CLIENT_ID response
   * @param clientId Current client ID from connection
   * @param payload Handshake payload with nullable clientId
   */
  private handleHandshake(clientId: string, payload: { clientId: string | null }): void {
    // For new connections, clientId from connection is already assigned
    // For reconnections, we would need to restore it (handled in ConnectionManager.addConnection)
    // For now, just confirm the current clientId

    const clientIdMessage: ClientIdMessage = {
      type: 'CLIENT_ID',
      payload: { clientId },
      messageId: randomUUID(),
      timestamp: Date.now(),
    };

    this.connectionManager.sendToClient(clientId, clientIdMessage);
    console.log(`[MessageRouter] Handshake completed for client ${clientId}`);
  }

  /**
   * Handle JOIN_ROOM message
   * Attempts to add client to room and sends appropriate response
   * @param clientId Client ID
   * @param payload Join room payload with roomId
   */
  private handleJoinRoom(clientId: string, payload: { roomId: string }): void {
    const { roomId } = payload;

    // Attempt to join room
    const success = this.roomManager.joinRoom(clientId, roomId);

    if (success) {
      // Send confirmation to client
      const roomJoinedMessage: RoomJoinedMessage = {
        type: 'ROOM_JOINED',
        payload: { roomId, clientId },
        messageId: randomUUID(),
        timestamp: Date.now(),
      };

      this.connectionManager.sendToClient(clientId, roomJoinedMessage);

      // Broadcast to other room members (excluding sender)
      const notification = {
        type: 'PLAYER_JOINED',
        payload: { roomId, clientId },
        messageId: randomUUID(),
        timestamp: Date.now(),
      };

      this.roomManager.broadcastToRoom(roomId, notification, clientId);

      console.log(`[MessageRouter] Client ${clientId} joined room ${roomId}`);
    } else {
      // Room is full - send error
      this.sendError(clientId, 'ROOM_FULL', 'Room capacity reached');
      console.log(`[MessageRouter] Client ${clientId} failed to join room ${roomId}: capacity reached`);
    }
  }

  /**
   * Send an error message to a client
   * @param clientId Client ID
   * @param code Error code
   * @param details Additional error details
   */
  private sendError(clientId: string, code: string, details?: unknown): void {
    const errorMessage: ErrorMessage = {
      type: 'ERROR',
      payload: {
        code,
        message: getErrorMessage(code),
        details,
      },
      messageId: randomUUID(),
      timestamp: Date.now(),
    };

    this.connectionManager.sendToClient(clientId, errorMessage);
  }
}
