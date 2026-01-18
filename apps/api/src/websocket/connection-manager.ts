import { WebSocket } from 'ws';
import { randomUUID } from 'crypto';
import { ClientConnection } from './types';

/**
 * ConnectionManager
 * Manages WebSocket client lifecycle with heartbeat detection and reconnection grace period
 *
 * Features:
 * - Automatic client ID generation using crypto.randomUUID()
 * - Ping/pong heartbeat every 30 seconds to detect stale connections
 * - 30-second grace period for reconnection after disconnect
 * - Message sending with readyState checks
 */
export class ConnectionManager {
  /** Active connections (clientId -> ClientConnection) */
  private connections: Map<string, ClientConnection>;

  /** Disconnected connections within grace period (clientId -> ClientConnection) */
  private disconnectedConnections: Map<string, ClientConnection>;

  /** Heartbeat interval timer (30 seconds) */
  private heartbeatInterval: NodeJS.Timeout | null;

  /** Grace period duration (milliseconds) */
  private readonly gracePeriod = 30000; // 30 seconds

  /** Heartbeat interval duration (milliseconds) */
  private readonly heartbeatDuration = 30000; // 30 seconds

  constructor() {
    this.connections = new Map();
    this.disconnectedConnections = new Map();
    this.heartbeatInterval = null;
    this.startHeartbeat();
  }

  /**
   * Add a new connection or restore a disconnected one
   * @param ws WebSocket instance
   * @param clientId Optional client ID for reconnection
   * @returns Assigned client ID (new or restored)
   */
  addConnection(ws: WebSocket, clientId?: string): string {
    let assignedId: string;
    let connection: ClientConnection;

    // Check if this is a reconnection attempt
    if (clientId) {
      const disconnected = this.disconnectedConnections.get(clientId);

      // Restore connection if within grace period
      if (disconnected) {
        const now = Date.now();
        const disconnectedAt = disconnected.disconnectedAt || 0;

        if (now - disconnectedAt <= this.gracePeriod) {
          // Within grace period - restore connection
          assignedId = clientId;
          connection = {
            ...disconnected,
            ws,
            isAlive: true,
            disconnectedAt: undefined,
          };

          // Remove from disconnected map
          this.disconnectedConnections.delete(clientId);
          console.log(`[ConnectionManager] Restored connection: ${clientId} (within grace period)`);
        } else {
          // Grace period expired - create new connection
          assignedId = randomUUID();
          connection = this.createConnection(assignedId, ws);
          console.log(`[ConnectionManager] Grace period expired for ${clientId}, assigned new ID: ${assignedId}`);
        }
      } else {
        // Client ID not found in disconnected - create new connection
        assignedId = randomUUID();
        connection = this.createConnection(assignedId, ws);
        console.log(`[ConnectionManager] Unknown clientId ${clientId}, assigned new ID: ${assignedId}`);
      }
    } else {
      // New connection - generate UUID
      assignedId = randomUUID();
      connection = this.createConnection(assignedId, ws);
      console.log(`[ConnectionManager] New connection: ${assignedId}`);
    }

    // Set up pong handler to mark connection as alive
    ws.on('pong', () => {
      const conn = this.connections.get(assignedId);
      if (conn) {
        conn.isAlive = true;
      }
    });

    // Add to active connections
    this.connections.set(assignedId, connection);

    return assignedId;
  }

  /**
   * Create a new ClientConnection object
   */
  private createConnection(id: string, ws: WebSocket): ClientConnection {
    return {
      id,
      ws,
      isAlive: true,
      joinedAt: Date.now(),
    };
  }

  /**
   * Remove a connection and move to grace period tracking
   * @param clientId Client ID to remove
   */
  removeConnection(clientId: string): void {
    const connection = this.connections.get(clientId);
    if (!connection) {
      return;
    }

    // Move to disconnected connections with timestamp
    const disconnectedConnection = {
      ...connection,
      disconnectedAt: Date.now(),
    };

    this.disconnectedConnections.set(clientId, disconnectedConnection);
    this.connections.delete(clientId);

    console.log(`[ConnectionManager] Connection moved to grace period: ${clientId}`);

    // Schedule cleanup after grace period expires
    setTimeout(() => {
      if (this.disconnectedConnections.has(clientId)) {
        this.disconnectedConnections.delete(clientId);
        console.log(`[ConnectionManager] Grace period expired, removed: ${clientId}`);
      }
    }, this.gracePeriod);
  }

  /**
   * Get a connection by client ID
   * @param clientId Client ID
   * @returns ClientConnection or undefined
   */
  getConnection(clientId: string): ClientConnection | undefined {
    return this.connections.get(clientId);
  }

  /**
   * Send a message to a specific client
   * @param clientId Client ID
   * @param message Message object to send
   * @returns true if sent, false if connection not found or not open
   */
  sendToClient(clientId: string, message: object): boolean {
    const connection = this.connections.get(clientId);

    if (!connection) {
      console.warn(`[ConnectionManager] Cannot send to ${clientId}: connection not found`);
      return false;
    }

    if (connection.ws.readyState !== WebSocket.OPEN) {
      console.warn(`[ConnectionManager] Cannot send to ${clientId}: WebSocket not OPEN (state: ${connection.ws.readyState})`);
      return false;
    }

    try {
      connection.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error(`[ConnectionManager] Error sending to ${clientId}:`, error);
      return false;
    }
  }

  /**
   * Broadcast a message to all connected clients
   * @param message Message object to send
   * @param excludeClientId Optional client ID to exclude from broadcast
   * @returns Number of clients message was sent to
   */
  broadcastToAll(message: object, excludeClientId?: string): number {
    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    this.connections.forEach((connection, clientId) => {
      if (clientId === excludeClientId) {
        return;
      }

      if (connection.ws.readyState === WebSocket.OPEN) {
        try {
          connection.ws.send(messageStr);
          sentCount++;
        } catch (error) {
          console.error(`[ConnectionManager] Error broadcasting to ${clientId}:`, error);
        }
      }
    });

    return sentCount;
  }

  /**
   * Start heartbeat monitoring
   * Pings all connections every 30 seconds and terminates unresponsive ones
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.connections.forEach((connection, clientId) => {
        if (connection.isAlive === false) {
          // No pong received since last ping - terminate connection
          console.log(`[ConnectionManager] Terminating unresponsive connection: ${clientId}`);
          connection.ws.terminate();
          this.removeConnection(clientId);
          return;
        }

        // Mark as not alive and send ping
        connection.isAlive = false;
        connection.ws.ping();
      });
    }, this.heartbeatDuration);

    console.log(`[ConnectionManager] Heartbeat started (interval: ${this.heartbeatDuration}ms)`);
  }

  /**
   * Stop heartbeat monitoring and cleanup
   */
  cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log('[ConnectionManager] Heartbeat stopped');
    }

    // Clear all connections
    this.connections.clear();
    this.disconnectedConnections.clear();
  }

  /**
   * Get the number of active connections
   */
  get connectionCount(): number {
    return this.connections.size;
  }

  /**
   * Get the number of disconnected connections in grace period
   */
  get disconnectedCount(): number {
    return this.disconnectedConnections.size;
  }
}
