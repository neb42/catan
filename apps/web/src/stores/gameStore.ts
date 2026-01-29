import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type {
  WebSocketMessage,
  BoardState,
  Settlement,
  Road,
  Room,
  PlayerResources,
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

// Turn state slice (for main game phase)
interface TurnSlice {
  turnPhase: 'roll' | 'main' | null; // null = not in main game yet
  turnCurrentPlayerId: string | null;
  turnNumber: number;
  lastDiceRoll: { dice1: number; dice2: number; total: number } | null;
  isAnimating: boolean; // Prevent actions during animations
  lastResourcesDistributed: Array<{
    playerId: string;
    resources: Array<{
      type: 'wood' | 'brick' | 'sheep' | 'wheat' | 'ore';
      count: number;
    }>;
  }> | null;
}

interface GameStore extends PlacementSlice, TurnSlice {
  board: BoardState | null;
  room: Room | null; // Add room state
  gameStarted: boolean;
  myPlayerId: string | null;
  nickname: string | null;
  lastError: string | null;
  sendMessage: ((message: WebSocketMessage) => void) | null;
  playerResources: Record<string, PlayerResources>;

  // Actions
  setBoard: (board: BoardState) => void;
  setRoom: (room: Room) => void; // Add setRoom
  setGameStarted: (started: boolean) => void;
  setMyPlayerId: (playerId: string | null) => void;
  setNickname: (nickname: string | null) => void;
  setLastError: (message: string | null) => void;
  setSendMessage: (
    handler: ((message: WebSocketMessage) => void) | null,
  ) => void;
  updatePlayerResources: (
    playerId: string,
    resources: Array<{
      type: 'wood' | 'brick' | 'sheep' | 'wheat' | 'ore';
      count: number;
    }>,
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

  // Turn actions
  setTurnState: (state: {
    phase: 'roll' | 'main';
    currentPlayerId: string;
    turnNumber: number;
  }) => void;
  setDiceRoll: (roll: { dice1: number; dice2: number; total: number }) => void;
  setAnimating: (animating: boolean) => void;
  setLastResourcesDistributed: (
    distribution: Array<{
      playerId: string;
      resources: Array<{
        type: 'wood' | 'brick' | 'sheep' | 'wheat' | 'ore';
        count: number;
      }>;
    }> | null,
  ) => void;
  clearTurnState: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  // Existing state
  board: null,
  room: null, // Initialize room
  gameStarted: false,
  myPlayerId: null,
  nickname: null,
  lastError: null,
  sendMessage: null,
  playerResources: {},

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

  // Turn state (main game phase)
  turnPhase: null,
  turnCurrentPlayerId: null,
  lastDiceRoll: null,
  isAnimating: false,
  lastResourcesDistributed: null,

  // Existing actions
  setBoard: (board) => set({ board }),
  setRoom: (room) => set({ room }), // Implement setRoom
  setGameStarted: (started) => set({ gameStarted: started }),
  setMyPlayerId: (playerId) => set({ myPlayerId: playerId }),
  setNickname: (nickname) => set({ nickname }),
  setLastError: (message) => set({ lastError: message }),
  setSendMessage: (handler) => set({ sendMessage: handler }),
  updatePlayerResources: (playerId, resources) =>
    set((state) => {
      const currentResources = state.playerResources[playerId] || {
        wood: 0,
        brick: 0,
        sheep: 0,
        wheat: 0,
        ore: 0,
      };

      const updatedResources = { ...currentResources };
      for (const resource of resources) {
        updatedResources[resource.type] += resource.count;
      }

      return {
        playerResources: {
          ...state.playerResources,
          [playerId]: updatedResources,
        },
      };
    }),

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

  // Turn actions
  setTurnState: (state) =>
    set({
      turnPhase: state.phase,
      turnCurrentPlayerId: state.currentPlayerId,
      turnNumber: state.turnNumber,
      lastDiceRoll: null, // Clear dice roll when turn state changes
    }),

  setDiceRoll: (roll) => set({ lastDiceRoll: roll }),

  setAnimating: (animating) => set({ isAnimating: animating }),

  setLastResourcesDistributed: (distribution) =>
    set({ lastResourcesDistributed: distribution }),

  clearTurnState: () =>
    set({
      turnPhase: null,
      turnCurrentPlayerId: null,
      turnNumber: 0,
      lastDiceRoll: null,
      isAnimating: false,
      lastResourcesDistributed: null,
    }),
}));

// CUSTOM HOOKS - prevent selector anti-pattern

export const usePlacementPhase = () =>
  useGameStore((state) => state.placementPhase);

export const useCurrentPlayer = () =>
  useGameStore(
    useShallow((state) => ({
      index: state.currentPlayerIndex,
      id: state.currentPlayerId,
    })),
  );

export const useIsMyTurn = () =>
  useGameStore((state) => state.currentPlayerId === state.myPlayerId);

export const useSelectedLocation = () =>
  useGameStore((state) => state.selectedLocationId);

export const usePlacementActions = () =>
  useGameStore(
    useShallow((state) => ({
      setSelected: state.setSelectedLocation,
      addSettlement: state.addSettlement,
      addRoad: state.addRoad,
    })),
  );

export const useSettlements = () => useGameStore((state) => state.settlements);

export const useRoads = () => useGameStore((state) => state.roads);

export const useSocket = () => useGameStore((state) => state.sendMessage); // Export useSocket hook

export const usePlayerResources = (playerId: string) =>
  useGameStore(
    useShallow(
      (state) =>
        state.playerResources[playerId] || {
          wood: 0,
          brick: 0,
          sheep: 0,
          wheat: 0,
          ore: 0,
        },
    ),
  );

// Turn state selector hooks
export const useTurnPhase = () => useGameStore((state) => state.turnPhase);

export const useTurnCurrentPlayer = () =>
  useGameStore((state) => state.turnCurrentPlayerId);

export const useTurnNumber = () => useGameStore((state) => state.turnNumber);

export const useLastDiceRoll = () =>
  useGameStore((state) => state.lastDiceRoll);

export const useIsAnimating = () => useGameStore((state) => state.isAnimating);

export const useIsMyTurnInMainGame = () =>
  useGameStore(
    (state) =>
      state.turnCurrentPlayerId === state.myPlayerId &&
      state.turnPhase !== null,
  );

export const useCanRollDice = () =>
  useGameStore(
    (state) =>
      state.turnPhase === 'roll' &&
      state.turnCurrentPlayerId === state.myPlayerId &&
      !state.isAnimating,
  );

export const useCanEndTurn = () =>
  useGameStore(
    (state) =>
      state.turnPhase === 'main' &&
      state.turnCurrentPlayerId === state.myPlayerId &&
      !state.isAnimating,
  );

export const useLastResourcesDistributed = () =>
  useGameStore((state) => state.lastResourcesDistributed);
