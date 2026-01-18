import { Room } from './types';
import { ConnectionManager } from './connection-manager';

/**
 * RoomManager
 * Manages room-based architecture with capacity enforcement and targeted broadcasts
 *
 * Features:
 * - Create rooms with configurable capacity (default 4 players)
 * - Enforce capacity limits when clients join
 * - Maintain reverse lookup for client-to-room mapping
 * - Broadcast messages to specific rooms
 * - Automatic cleanup of empty rooms
 * - Delegates message sending to ConnectionManager
 */
export class RoomManager {
  /** Room registry (roomId -> Room) */
  private rooms: Map<string, Room>;

  /** Reverse lookup (clientId -> roomId) */
  private clientRooms: Map<string, string>;

  /** Connection manager dependency */
  private connectionManager: ConnectionManager;

  constructor(connectionManager: ConnectionManager) {
    this.rooms = new Map();
    this.clientRooms = new Map();
    this.connectionManager = connectionManager;
  }

  /**
   * Create a new room
   * @param roomId Unique room identifier
   * @param capacity Maximum number of players (default 4)
   * @returns Created room
   */
  createRoom(roomId: string, capacity: number = 4): Room {
    const room: Room = {
      id: roomId,
      clients: new Set(),
      createdAt: Date.now(),
      metadata: {
        capacity,
        state: 'waiting',
      },
    };

    this.rooms.set(roomId, room);
    console.log(`[RoomManager] Created room: ${roomId} (capacity: ${capacity})`);

    return room;
  }

  /**
   * Join a client to a room
   * Creates room if it doesn't exist
   * @param clientId Client ID
   * @param roomId Room ID
   * @returns true if joined successfully, false if room is full
   */
  joinRoom(clientId: string, roomId: string): boolean {
    // Get or create room
    let room = this.rooms.get(roomId);

    if (!room) {
      room = this.createRoom(roomId);
    }

    // Check capacity
    if (room.clients.size >= room.metadata.capacity) {
      console.log(`[RoomManager] Room ${roomId} is full (${room.clients.size}/${room.metadata.capacity})`);
      return false;
    }

    // Add client to room
    room.clients.add(clientId);
    this.clientRooms.set(clientId, roomId);

    // Update connection's roomId field
    const connection = this.connectionManager.getConnection(clientId);
    if (connection) {
      connection.roomId = roomId;
    }

    console.log(`[RoomManager] Client ${clientId} joined room ${roomId} (${room.clients.size}/${room.metadata.capacity})`);

    return true;
  }

  /**
   * Remove a client from their current room
   * Deletes room if empty after client leaves
   * @param clientId Client ID
   */
  leaveRoom(clientId: string): void {
    const roomId = this.clientRooms.get(clientId);

    if (!roomId) {
      console.log(`[RoomManager] Client ${clientId} is not in any room`);
      return;
    }

    const room = this.rooms.get(roomId);

    if (room) {
      // Remove client from room
      room.clients.delete(clientId);

      console.log(`[RoomManager] Client ${clientId} left room ${roomId} (${room.clients.size}/${room.metadata.capacity} remaining)`);

      // Cleanup empty room immediately
      if (room.clients.size === 0) {
        this.rooms.delete(roomId);
        console.log(`[RoomManager] Deleted empty room: ${roomId}`);
      }
    }

    // Remove from reverse lookup
    this.clientRooms.delete(clientId);

    // Clear connection's roomId field
    const connection = this.connectionManager.getConnection(clientId);
    if (connection) {
      connection.roomId = undefined;
    }
  }

  /**
   * Get a room by ID
   * @param roomId Room ID
   * @returns Room or undefined
   */
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Get the room a client is in
   * @param clientId Client ID
   * @returns Room or undefined
   */
  getClientRoom(clientId: string): Room | undefined {
    const roomId = this.clientRooms.get(clientId);
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  /**
   * Broadcast a message to all clients in a room
   * Delegates to ConnectionManager for actual sending
   * @param roomId Room ID
   * @param message Message object to send
   * @param excludeClientId Optional client ID to exclude from broadcast
   * @returns Number of clients message was sent to
   */
  broadcastToRoom(roomId: string, message: object, excludeClientId?: string): number {
    const room = this.rooms.get(roomId);

    if (!room) {
      console.warn(`[RoomManager] Cannot broadcast to ${roomId}: room not found`);
      return 0;
    }

    let sentCount = 0;

    room.clients.forEach((clientId) => {
      if (clientId === excludeClientId) {
        return;
      }

      const sent = this.connectionManager.sendToClient(clientId, message);
      if (sent) {
        sentCount++;
      }
    });

    return sentCount;
  }

  /**
   * Get array of client IDs in a room
   * @param roomId Room ID
   * @returns Array of client IDs, or empty array if room not found
   */
  getRoomClients(roomId: string): string[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.clients) : [];
  }

  /**
   * Get room state information
   * @param roomId Room ID
   * @returns Room state object or undefined
   */
  getRoomState(roomId: string): { capacity: number; state: string; clientCount: number } | undefined {
    const room = this.rooms.get(roomId);

    if (!room) {
      return undefined;
    }

    return {
      capacity: room.metadata.capacity,
      state: room.metadata.state,
      clientCount: room.clients.size,
    };
  }

  /**
   * Get the number of active rooms
   */
  get roomCount(): number {
    return this.rooms.size;
  }

  /**
   * Get all room IDs
   */
  getAllRoomIds(): string[] {
    return Array.from(this.rooms.keys());
  }
}
