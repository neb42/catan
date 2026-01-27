import { create } from 'zustand';

import type { WebSocketMessage, BoardState } from '@catan/shared';

interface GameStore {
  board: BoardState | null;
  myPlayerId: string | null;
  lastError: string | null;
  sendMessage: ((message: WebSocketMessage) => void) | null;
  setBoard: (board: BoardState) => void;
  setMyPlayerId: (playerId: string | null) => void;
  setLastError: (message: string | null) => void;
  setSendMessage: (handler: ((message: WebSocketMessage) => void) | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  board: null,
  myPlayerId: null,
  lastError: null,
  sendMessage: null,
  setBoard: (board) => set({ board }),
  setMyPlayerId: (playerId) => set({ myPlayerId: playerId }),
  setLastError: (message) => set({ lastError: message }),
  setSendMessage: (handler) => set({ sendMessage: handler }),
}));
