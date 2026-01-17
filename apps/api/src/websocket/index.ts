import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { config } from '../config';

let wss: WebSocketServer | null = null;

/**
 * Initialize WebSocket server
 * Can attach to existing HTTP server (upgrade pattern) or create standalone on WS_PORT
 */
export function initializeWebSocket(httpServer?: HttpServer): WebSocketServer {
  if (wss) {
    return wss;
  }

  // Use HTTP server upgrade pattern if provided, otherwise use separate WS_PORT
  if (httpServer) {
    wss = new WebSocketServer({ server: httpServer });
    console.log(`WebSocket server attached to HTTP server`);
  } else if (config.wsPort) {
    wss = new WebSocketServer({ port: config.wsPort });
    console.log(`WebSocket server listening on port ${config.wsPort}`);
  } else {
    throw new Error('No HTTP server provided and WS_PORT not configured');
  }

  setupConnectionHandlers(wss);

  return wss;
}

/**
 * Set up connection and disconnection handlers with logging
 */
function setupConnectionHandlers(server: WebSocketServer): void {
  let connectionCount = 0;

  server.on('connection', (ws: WebSocket) => {
    connectionCount++;
    const connectionId = connectionCount;
    console.log(`[WebSocket] Client connected (id: ${connectionId}, total: ${server.clients.size})`);

    ws.on('close', (code: number, reason: Buffer) => {
      console.log(`[WebSocket] Client disconnected (id: ${connectionId}, code: ${code}, reason: ${reason.toString() || 'none'}, remaining: ${server.clients.size})`);
    });

    ws.on('error', (error: Error) => {
      console.error(`[WebSocket] Client error (id: ${connectionId}):`, error.message);
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
