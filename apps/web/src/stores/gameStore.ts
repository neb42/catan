import { create } from 'zustand';

import type { GameState, WebSocketMessage } from '@catan/shared';

interface GameStore {
  gameState: GameState | null;
  myPlayerId: string | null;
  selectedVertex: string | null;
  selectedEdge: string | null;
  lastError: string | null;
  sendMessage: ((message: WebSocketMessage) => void) | null;
  updateGameState: (state: GameState) => void;
  setMyPlayerId: (playerId: string | null) => void;
  setSelectedVertex: (vertexId: string | null) => void;
  setSelectedEdge: (edgeId: string | null) => void;
  setLastError: (message: string | null) => void;
  setSendMessage: (handler: ((message: WebSocketMessage) => void) | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  myPlayerId: null,
  selectedVertex: null,
  selectedEdge: null,
  lastError: null,
  sendMessage: null,
  updateGameState: (state) => set({ gameState: state }),
  setMyPlayerId: (playerId) => set({ myPlayerId: playerId }),
  setSelectedVertex: (vertexId) =>
    set({ selectedVertex: vertexId, selectedEdge: null }),
  setSelectedEdge: (edgeId) =>
    set({ selectedEdge: edgeId, selectedVertex: null }),
  setLastError: (message) => set({ lastError: message }),
  setSendMessage: (handler) => set({ sendMessage: handler }),
}));
