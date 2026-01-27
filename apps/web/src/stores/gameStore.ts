import { create } from 'zustand';

import type { WebSocketMessage, BoardState } from '@catan/shared';

interface GameStore {
  board: BoardState | null;
  gameStarted: boolean;
  myPlayerId: string | null;
  lastError: string | null;
  sendMessage: ((message: WebSocketMessage) => void) | null;
  setBoard: (board: BoardState) => void;
  setGameStarted: (started: boolean) => void;
  setMyPlayerId: (playerId: string | null) => void;
  setLastError: (message: string | null) => void;
  setSendMessage: (handler: ((message: WebSocketMessage) => void) | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  board: null,
  gameStarted: false,
  myPlayerId: null,
  lastError: null,
  sendMessage: null,
  setBoard: (board) => set({ board }),
  setGameStarted: (started) => set({ gameStarted: started }),
  setMyPlayerId: (playerId) => set({ myPlayerId: playerId }),
  setLastError: (message) => set({ lastError: message }),
  setSendMessage: (handler) => set({ sendMessage: handler }),
}));
