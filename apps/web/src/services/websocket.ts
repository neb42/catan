type WebSocketHandlers = {
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onMessage?: (event: MessageEvent) => void;
  onError?: (event: Event) => void;
};

const INITIAL_RECONNECT_DELAY = 2000; // 2s
const MAX_RECONNECT_DELAY = 30000; // 30s

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectDelay = INITIAL_RECONNECT_DELAY;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = true;

  constructor(
    private readonly url: string,
    private handlers: WebSocketHandlers = {},
    private readonly maxReconnectAttempts = Infinity,
  ) {}

  connect(): void {
    this.shouldReconnect = true;
    this.startConnection();
  }

  updateHandlers(handlers: WebSocketHandlers): void {
    this.handlers = handlers;
  }

  sendMessage(message: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return;
    }

    console.warn('WebSocket not open; dropping message');
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.ws?.close();
    this.ws = null;
  }

  private startConnection(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.reconnectDelay = INITIAL_RECONNECT_DELAY;
      this.handlers.onOpen?.();
    };

    this.ws.onmessage = (event) => {
      this.handlers.onMessage?.(event);
    };

    this.ws.onerror = (event) => {
      console.error('WebSocket error', event);
      this.handlers.onError?.(event);
    };

    this.ws.onclose = (event) => {
      this.handlers.onClose?.(event);
      if (!this.shouldReconnect) return;
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

    const delay = Math.min(this.reconnectDelay, MAX_RECONNECT_DELAY);

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts += 1;
      this.reconnectDelay = Math.min(
        this.reconnectDelay * 2,
        MAX_RECONNECT_DELAY,
      );
      this.startConnection();
    }, delay);
  }
}
