import { create } from 'zustand';
import type {
  WebSocketMessage,
  BoardState,
  Settlement,
  Road,
} from '@catan/shared';

// Placement state slice
interface PlacementSlice {
  currentPlayerIndex: number | null;
  currentPlayerId: string | null;
  placementPhase: 'settlement' | 'road' | null;
  draftRound: 1 | 2 | null;
  turnNumber: number;

  // Placed pieces
  settlements: Settlement[];
  roads: Road[];

  // Selection state (for preview)
  selectedLocationId: string | null;

  // Last placed (for road connection)
  lastPlacedSettlementId: string | null;
}

interface GameStore extends PlacementSlice {
  board: BoardState | null;
  gameStarted: boolean;
  myPlayerId: string | null;
  nickname: string | null; // Added nickname
  lastError: string | null;
  sendMessage: ((message: WebSocketMessage) => void) | null;

  // Actions
  setBoard: (board: BoardState) => void;
  setGameStarted: (started: boolean) => void;
  setMyPlayerId: (playerId: string | null) => void;
  setNickname: (nickname: string | null) => void; // Added action
  setLastError: (message: string | null) => void;
  setSendMessage: (
    handler: ((message: WebSocketMessage) => void) | null,
  ) => void;

  // Placement actions
  setPlacementTurn: (turn: {
    currentPlayerIndex: number;
    currentPlayerId: string;
    phase: 'settlement' | 'road';
    round: 1 | 2;
    turnNumber: number;
  }) => void;
  addSettlement: (settlement: Settlement) => void;
  addRoad: (road: Road) => void;
  setSelectedLocation: (id: string | null) => void;
  setLastPlacedSettlement: (id: string | null) => void;
  clearPlacementState: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  // Existing state
  board: null,
  gameStarted: false,
  myPlayerId: null,
  nickname: null, // Initial value
  lastError: null,
  sendMessage: null,

  // Placement state
  currentPlayerIndex: null,
  currentPlayerId: null,
  placementPhase: null,
  draftRound: null,
  turnNumber: 0,
  settlements: [],
  roads: [],
  selectedLocationId: null,
  lastPlacedSettlementId: null,

  // Existing actions
  setBoard: (board) => set({ board }),
  setGameStarted: (started) => set({ gameStarted: started }),
  setMyPlayerId: (playerId) => set({ myPlayerId: playerId }),
  setNickname: (nickname) => set({ nickname }), // Action implementation
  setLastError: (message) => set({ lastError: message }),
  setSendMessage: (handler) => set({ sendMessage: handler }),

  // Placement actions
  setPlacementTurn: (turn) =>
    set({
      currentPlayerIndex: turn.currentPlayerIndex,
      currentPlayerId: turn.currentPlayerId,
      placementPhase: turn.phase,
      draftRound: turn.round,
      turnNumber: turn.turnNumber,
    }),

  addSettlement: (settlement) =>
    set((state) => ({
      settlements: [...state.settlements, settlement],
      lastPlacedSettlementId: settlement.vertexId,
    })),

  addRoad: (road) =>
    set((state) => ({
      roads: [...state.roads, road],
    })),

  setSelectedLocation: (id) => set({ selectedLocationId: id }),

  setLastPlacedSettlement: (id) => set({ lastPlacedSettlementId: id }),

  clearPlacementState: () =>
    set({
      currentPlayerIndex: null,
      currentPlayerId: null,
      placementPhase: null,
      draftRound: null,
      selectedLocationId: null,
    }),
}));

// CUSTOM HOOKS - prevent selector anti-pattern

export const usePlacementPhase = () =>
  useGameStore((state) => state.placementPhase);

export const useCurrentPlayer = () =>
  useGameStore((state) => ({
    index: state.currentPlayerIndex,
    id: state.currentPlayerId,
  }));

export const useIsMyTurn = () =>
  useGameStore((state) => state.currentPlayerId === state.myPlayerId);

export const useSelectedLocation = () =>
  useGameStore((state) => state.selectedLocationId);

export const usePlacementActions = () =>
  useGameStore((state) => ({
    setSelected: state.setSelectedLocation,
    addSettlement: state.addSettlement,
    addRoad: state.addRoad,
  }));

export const useSettlements = () => useGameStore((state) => state.settlements);

export const useRoads = () => useGameStore((state) => state.roads);
