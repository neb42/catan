import { WebSocket } from 'ws';

/**
 * Client connection state
 * Tracks active WebSocket connections with lifecycle metadata
 */
export interface ClientConnection {
  /** Unique client identifier (UUID v4) */
  id: string;

  /** WebSocket instance */
  ws: WebSocket;

  /** Heartbeat liveness flag (ping/pong detection) */
  isAlive: boolean;

  /** Timestamp when connection was established (milliseconds since epoch) */
  joinedAt: number;

  /** Room ID if client has joined a room */
  roomId?: string;

  /** Timestamp when connection was disconnected (for grace period tracking) */
  disconnectedAt?: number;
}

/**
 * Room metadata
 * Configuration and state for a room
 */
export interface RoomMetadata {
  /** Maximum number of players allowed in room */
  capacity: number;

  /** Current room state */
  state: 'waiting' | 'active' | 'finished';
}

/**
 * Room state
 * Represents a game room with client membership
 */
export interface Room {
  /** Unique room identifier */
  id: string;

  /** Set of client IDs in this room */
  clients: Set<string>;

  /** Nickname registry (clientId -> nickname mapping) */
  nicknames: Map<string, string>;

  /** Timestamp when room was created (milliseconds since epoch) */
  createdAt: number;

  /** Room configuration and state */
  metadata: RoomMetadata;
}
