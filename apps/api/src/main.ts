import express from 'express';
import * as path from 'path';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

import { handleWebSocketConnection } from './handlers/websocket';
import { RoomManager } from './managers/RoomManager';

type HeartbeatWebSocket = WebSocket & { isAlive?: boolean };

const HEARTBEAT_INTERVAL_MS = 30_000;
const WS_PATHNAME = '/ws';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to api!' });
});

const port = (process.env['PORT'] as unknown as number) || 3333;
const httpServer = createServer(app);
const roomManager = new RoomManager();
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws, request) => {
  const socket = ws as HeartbeatWebSocket;
  socket.isAlive = true;

  socket.on('pong', () => {
    socket.isAlive = true;
  });

  handleWebSocketConnection(socket, roomManager, request);
});

const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((client) => {
    const socket = client as HeartbeatWebSocket;
    if (socket.isAlive === false) {
      socket.terminate();
      return;
    }
    socket.isAlive = false;
    socket.ping();
  });
}, HEARTBEAT_INTERVAL_MS);

wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

httpServer.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url ?? '', `http://localhost:${port}`);

  if (pathname === WS_PATHNAME) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

httpServer.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  console.log(`WebSocket server listening on ws://localhost:${port}${WS_PATHNAME}`);
});

httpServer.on('error', console.error);
