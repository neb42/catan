import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { config } from '../config';
import { ConnectionManager } from './connection-manager';
import { RoomManager } from './room-manager';
import { MessageRouter } from './message-router';

let wss: WebSocketServer | null = null;
let connectionManager: ConnectionManager | null = null;
let roomManager: RoomManager | null = null;
let messageRouter: MessageRouter | null = null;

/**
 * Initialize WebSocket server
 * Can attach to existing HTTP server (upgrade pattern) or create standalone on WS_PORT
 */
export function initializeWebSocket(httpServer?: HttpServer): WebSocketServer {
  if (wss) {
    return wss;
  }

  // Create WebSocket server with maxPayload limit for DoS prevention
  if (httpServer) {
    wss = new WebSocketServer({
      server: httpServer,
      maxPayload: 1024 * 1024, // 1MB limit (prevents DoS, sufficient for text messages)
      clientTracking: true,
    });
    console.log(`WebSocket server attached to HTTP server`);
  } else if (config.wsPort) {
    wss = new WebSocketServer({
      port: config.wsPort,
      maxPayload: 1024 * 1024, // 1MB limit
      clientTracking: true,
    });
    console.log(`WebSocket server listening on port ${config.wsPort}`);
  } else {
    throw new Error('No HTTP server provided and WS_PORT not configured');
  }

  // Initialize infrastructure managers
  connectionManager = new ConnectionManager();
  roomManager = new RoomManager(connectionManager);
  messageRouter = new MessageRouter(connectionManager, roomManager);

  setupConnectionHandlers(wss);

  console.log('[WebSocket] Server initialized with connection/room management');

  return wss;
}

/**
 * Set up connection and disconnection handlers with logging
 */
function setupConnectionHandlers(server: WebSocketServer): void {
  server.on('connection', (ws: WebSocket) => {
    // Add connection and get assigned client ID
    const clientId = connectionManager!.addConnection(ws);

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      messageRouter!.routeMessage(clientId, data);
    });

    // Handle disconnection
    ws.on('close', (code: number, reason: Buffer) => {
      console.log(`[WebSocket] Client disconnected (id: ${clientId}, code: ${code}, reason: ${reason.toString() || 'none'})`);
      connectionManager!.removeConnection(clientId);
      roomManager!.leaveRoom(clientId);
    });

    // Handle errors
    ws.on('error', (error: Error) => {
      console.error(`[WebSocket] Client ${clientId} error:`, error.message);
    });
  });

  server.on('error', (error: Error) => {
    console.error('[WebSocket] Server error:', error.message);
  });
}

/**
 * Get the WebSocket server instance
 */
export function getWebSocketServer(): WebSocketServer | null {
  return wss;
}

/**
 * Close the WebSocket server
 */
export function closeWebSocket(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!wss) {
      resolve();
      return;
    }

    // Cleanup managers first
    connectionManager?.cleanup();
    connectionManager = null;
    roomManager = null;
    messageRouter = null;

    wss.close((err) => {
      if (err) {
        reject(err);
      } else {
        wss = null;
        console.log('[WebSocket] Server closed');
        resolve();
      }
    });
  });
}
