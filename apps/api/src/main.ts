import { createServer } from 'http';
import { config } from './config';
import { createApp } from './app';
import { initializeWebSocket } from './websocket';

const app = createApp();
const httpServer = createServer(app);

// Initialize WebSocket server attached to HTTP server
initializeWebSocket(httpServer);

httpServer.listen(config.port, () => {
  console.log(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
});
