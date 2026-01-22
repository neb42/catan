import { create } from 'zustand';

import type { WebSocketMessage } from '@catan/shared';

interface GameStore {
  myPlayerId: string | null;
  lastError: string | null;
  sendMessage: ((message: WebSocketMessage) => void) | null;
  setMyPlayerId: (playerId: string | null) => void;
  setLastError: (message: string | null) => void;
  setSendMessage: (handler: ((message: WebSocketMessage) => void) | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  myPlayerId: null,
  lastError: null,
  sendMessage: null,
  setMyPlayerId: (playerId) => set({ myPlayerId: playerId }),
  setLastError: (message) => set({ lastError: message }),
  setSendMessage: (handler) => set({ sendMessage: handler }),
}));
