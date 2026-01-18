/**
 * WebSocket React Context - Global WebSocket connection state
 *
 * Provides:
 * - WebSocket instance access
 * - Connection status tracking
 * - Client ID from server
 * - Message sending helper
 *
 * Usage:
 *   const { status, clientId, sendMessage } = useWebSocket();
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ReconnectingWebSocket, WebSocketStatus } from './websocket';

interface WebSocketContextValue {
  ws: ReconnectingWebSocket | null;
  status: WebSocketStatus;
  clientId: string | null;
  sendMessage: (message: object) => void;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  ws: null,
  status: 'disconnected',
  clientId: null,
  sendMessage: () => console.warn('[WebSocket] WebSocket not initialized')
});

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [ws, setWs] = useState<ReconnectingWebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    // Create WebSocket instance on mount
    const wsInstance = new ReconnectingWebSocket({
      url: 'ws://localhost:3000',
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
      },
      onMessage: (message) => {
        // Handle CLIENT_ID message to update clientId state
        if (message.type === 'CLIENT_ID') {
          setClientId(message.payload.clientId);
        }
      }
    });

    setWs(wsInstance);

    // Cleanup on unmount
    return () => {
      wsInstance.disconnect();
    };
  }, []);

  const sendMessage = useCallback((message: object) => {
    ws?.send(message);
  }, [ws]);

  const value: WebSocketContextValue = {
    ws,
    status,
    clientId,
    sendMessage
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}
