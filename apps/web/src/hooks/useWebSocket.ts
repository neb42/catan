import { useCallback, useEffect, useRef, useState } from 'react';

import { WebSocketMessage, WebSocketMessageSchema } from '@catan/shared';

import { WebSocketClient } from '../services/websocket';
import { useGameStore } from '../stores/gameStore';

interface UseWebSocketOptions {
  url: string;
  onMessage: (message: WebSocketMessage) => void;
}

export function useWebSocket({ url, onMessage }: UseWebSocketOptions) {
  const clientRef = useRef<WebSocketClient | null>(null);
  const onMessageRef = useRef(onMessage);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const client = new WebSocketClient(url, {
      onOpen: () => setIsConnected(true),
      onClose: () => setIsConnected(false),
      onMessage: (event) => {
        try {
          const parsed = JSON.parse(event.data, (key, value) => {
            if (key === 'createdAt' && typeof value === 'string') {
              return new Date(value);
            }
            return value;
          });

          const result = WebSocketMessageSchema.safeParse(parsed);
          if (!result.success) {
            console.error('Invalid WebSocket message', result.error);
            return;
          }

          // Log received message for debugging
          useGameStore
            .getState()
            .addDebugMessage('received', result.data.type, result.data);

          onMessageRef.current(result.data);
        } catch (error) {
          console.error('Failed to parse WebSocket message', error);
        }
      },
    });

    clientRef.current = client;
    client.connect();

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [url]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    // Log sent message for debugging
    useGameStore.getState().addDebugMessage('sent', message.type, message);
    clientRef.current?.sendMessage(message);
  }, []);

  const reconnect = useCallback(() => {
    clientRef.current?.disconnect();
    clientRef.current?.connect();
  }, []);

  return { isConnected, sendMessage, reconnect };
}
