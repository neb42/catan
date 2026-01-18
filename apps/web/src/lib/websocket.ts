/**
 * ReconnectingWebSocket - Client-side WebSocket with automatic reconnection
 *
 * Features:
 * - Exponential backoff reconnection (1s base, 30s max)
 * - Client ID persistence for session recovery
 * - Jitter to prevent thundering herd
 * - Status tracking (connecting, connected, reconnecting, disconnected)
 * - Message handler registration
 */

export type WebSocketStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export type MessageHandler = (message: any) => void;

export interface ReconnectingWebSocketConfig {
  url: string;
  baseDelay?: number;  // Default: 1000ms
  maxDelay?: number;   // Default: 30000ms
  onStatusChange?: (status: WebSocketStatus) => void;
  onMessage?: MessageHandler;
}

export class ReconnectingWebSocket {
  private ws: WebSocket | null = null;
  private clientId: string | null = null;
  private reconnectAttempts = 0;
  private status: WebSocketStatus = 'disconnected';
  private config: Required<ReconnectingWebSocketConfig>;
  private messageHandlers: Set<MessageHandler> = new Set();
  private reconnectTimeout: number | null = null;

  constructor(config: ReconnectingWebSocketConfig) {
    this.config = {
      url: config.url,
      baseDelay: config.baseDelay ?? 1000,
      maxDelay: config.maxDelay ?? 30000,
      onStatusChange: config.onStatusChange ?? (() => {}),
      onMessage: config.onMessage ?? (() => {}),
    };

    this.connect();
  }

  private connect(): void {
    // Set status: connecting for first connection, reconnecting for subsequent attempts
    const newStatus = this.reconnectAttempts === 0 ? 'connecting' : 'reconnecting';
    this.setStatus(newStatus);

    this.ws = new WebSocket(this.config.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.setStatus('connected');
      this.sendHandshake();
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);

        // Handle CLIENT_ID message specially - store for reconnection
        if (message.type === 'CLIENT_ID') {
          this.clientId = message.payload.clientId;
        }

        // Notify all registered handlers
        this.messageHandlers.forEach(handler => {
          try {
            handler(message);
          } catch (err) {
            console.error('[WebSocket] Message handler error:', err);
          }
        });

        // Notify config handler
        this.config.onMessage(message);
      } catch (err) {
        console.error('[WebSocket] Failed to parse message:', err);
      }
    };

    this.ws.onclose = () => {
      this.setStatus('disconnected');
      this.scheduleReconnect();
    };

    this.ws.onerror = (err) => {
      console.error('[WebSocket] Error:', err);
    };
  }

  private sendHandshake(): void {
    // Send HANDSHAKE with clientId if we have one (reconnection)
    // or null if this is first connection (server will generate new ID)
    this.send({
      type: 'HANDSHAKE',
      payload: { clientId: this.clientId }
    });
  }

  private scheduleReconnect(): void {
    // Calculate exponential backoff delay with jitter
    const exponentialDelay = Math.min(
      this.config.baseDelay * Math.pow(2, this.reconnectAttempts),
      this.config.maxDelay
    );

    // Add 0-25% jitter to prevent thundering herd
    const jitter = Math.random() * 0.25 * exponentialDelay;
    const delay = Math.floor(exponentialDelay + jitter);

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.setStatus('reconnecting');

    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  public send(message: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Cannot send message - connection not open', message);
    }
  }

  public addMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.add(handler);
  }

  public removeMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.delete(handler);
  }

  public disconnect(): void {
    // Clear any pending reconnection
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Close WebSocket connection
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.setStatus('disconnected');
  }

  private setStatus(status: WebSocketStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.config.onStatusChange(status);
    }
  }

  public getStatus(): WebSocketStatus {
    return this.status;
  }

  public getClientId(): string | null {
    return this.clientId;
  }
}
