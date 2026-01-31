import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const LOGS_DIR = './logs';

/**
 * Log a WebSocket message to a file for debugging and replay.
 *
 * @param roomId - The room ID (used as filename)
 * @param direction - 'recv' for received from client, 'send' for sent to client
 * @param message - The message payload (will be JSON stringified)
 */
export function logMessage(
  roomId: string,
  direction: 'recv' | 'send',
  message: unknown,
): void {
  try {
    // Ensure logs directory exists
    mkdirSync(LOGS_DIR, { recursive: true });

    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${direction}] ${JSON.stringify(message)}\n`;
    const logPath = join(LOGS_DIR, `${roomId}-messages.log`);

    appendFileSync(logPath, logLine);
  } catch (error) {
    // Don't let logging failures break the application
    console.error('Failed to log message:', error);
  }
}
