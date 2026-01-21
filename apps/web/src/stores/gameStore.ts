import { create } from 'zustand';

import type { GameState, WebSocketMessage } from '@catan/shared';

interface GameStore {
  gameState: GameState | null;
  myPlayerId: string | null;
  selectedVertex: string | null;
  selectedEdge: string | null;
  sendMessage: ((message: WebSocketMessage) => void) | null;
  updateGameState: (state: GameState) => void;
  setMyPlayerId: (playerId: string | null) => void;
  selectVertex: (vertexId: string | null) => void;
  selectEdge: (edgeId: string | null) => void;
  setSendMessage: (handler: ((message: WebSocketMessage) => void) | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  myPlayerId: null,
  selectedVertex: null,
  selectedEdge: null,
  sendMessage: null,
  updateGameState: (state) => set({ gameState: state }),
  setMyPlayerId: (playerId) => set({ myPlayerId: playerId }),
  selectVertex: (vertexId) => set({ selectedVertex: vertexId }),
  selectEdge: (edgeId) => set({ selectedEdge: edgeId }),
  setSendMessage: (handler) => set({ sendMessage: handler }),
}));
