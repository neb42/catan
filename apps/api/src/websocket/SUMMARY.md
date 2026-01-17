# WebSocket Directory

This directory contains WebSocket server initialization and management.

## Purpose

Real-time bidirectional communication between server and clients using the WebSocket protocol. The WebSocket server can either attach to the HTTP server (sharing the same port via upgrade pattern) or run on a separate port configured via `WS_PORT`.

## Key Files

- `index.ts` - WebSocket server initialization and connection handlers

## Functions

### `initializeWebSocket(httpServer?: HttpServer)`
Initializes the WebSocket server. If an HTTP server is provided, attaches to it using the upgrade pattern. Otherwise, creates a standalone server on `WS_PORT`.

### `getWebSocketServer()`
Returns the current WebSocket server instance, or null if not initialized.

### `closeWebSocket()`
Gracefully closes the WebSocket server and all connections.

## Connection Lifecycle

1. Client connects via WebSocket upgrade
2. Server logs connection with unique ID and total client count
3. On disconnect, server logs the close code, reason, and remaining clients
4. Errors are logged for both individual clients and the server

## Configuration

WebSocket port is configured via environment variable:
- `WS_PORT` - Optional separate port for WebSocket server
- If not set and HTTP server is provided, WebSocket shares the HTTP port

## Usage Example

```typescript
import { createServer } from 'http';
import { initializeWebSocket } from './websocket';

const httpServer = createServer(app);
initializeWebSocket(httpServer);  // Attach to HTTP server

// Or use separate port (WS_PORT must be configured)
initializeWebSocket();
```
