import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type {
  WebSocketMessage,
  BoardState,
  Settlement,
  Road,
  Room,
  PlayerResources,
  BuildingType,
  ResourceType,
  OwnedDevCard,
} from '@catan/shared';
import { BUILDING_COSTS } from '@catan/shared';

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

// Build mode state slice (for main game building)
interface BuildSlice {
  buildMode: BuildingType | null; // 'road' | 'settlement' | 'city' | null
  isBuildPending: boolean; // Optimistic update in progress
}

// Trade state slice
interface TradeSlice {
  // Active trade proposal (null if none)
  activeTrade: {
    proposerId: string;
    offering: Record<ResourceType, number>;
    requesting: Record<ResourceType, number>;
    responses: Record<string, 'pending' | 'accepted' | 'declined'>;
  } | null;

  // UI state
  tradeModalOpen: boolean;
}

// Robber state slice
interface RobberSlice {
  // Blocking state - blocks ALL players during discard phase
  waitingForDiscards: boolean;
  playersWhoMustDiscard: string[]; // Player IDs who still need to discard

  // Discard state (for current player's modal)
  discardRequired: boolean;
  discardTarget: number;
  discardResources: PlayerResources | null; // Current resources to discard from
  selectedForDiscard: Record<ResourceType, number>;

  // Robber placement state
  robberPlacementMode: boolean;
  robberHexId: string | null;

  // Steal state
  stealRequired: boolean;
  stealCandidates: Array<{
    playerId: string;
    nickname: string;
    cardCount: number;
  }>;
}

// Dev card state slice
interface DevCardSlice {
  // Own cards (full info for local player)
  myDevCards: OwnedDevCard[];

  // Opponent card counts (hidden info - just counts)
  opponentDevCardCounts: Record<string, number>;

  // Deck state
  deckRemaining: number;

  // Play state
  hasPlayedDevCardThisTurn: boolean;

  // Card play in progress
  devCardPlayPhase:
    | 'none'
    | 'road_building'
    | 'year_of_plenty'
    | 'monopoly'
    | null;
  cardBeingPlayed: OwnedDevCard | null;
  roadsPlacedThisCard: number; // For Road Building (0, 1, or 2)

  // Knight tracking (for Largest Army - visible to all)
  knightsPlayed: Record<string, number>;
}

// Longest road state slice
interface LongestRoadSlice {
  longestRoadHolderId: string | null;
  longestRoadLength: number;
  playerRoadLengths: Record<string, number>;
}

// Largest army state slice
interface LargestArmySlice {
  largestArmyHolderId: string | null;
  largestArmyKnights: number;
}

// Victory point breakdown type (matches VPBreakdown from shared)
interface VPBreakdown {
  settlements: number;
  cities: number;
  longestRoad: number;
  largestArmy: number;
  victoryPointCards: number;
  total: number;
}

// Victory state slice
interface VictorySlice {
  gameEnded: boolean;
  winnerId: string | null;
  winnerNickname: string | null;
  winnerVP: VPBreakdown | null;
  allPlayerVP: Record<string, VPBreakdown>;
  revealedVPCards: Array<{ playerId: string; cardCount: number }>;
  victoryPhase: 'none' | 'reveal' | 'modal' | 'dismissed';
}

// Game log state slice
interface GameLogEntry {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

interface GameLogSlice {
  gameLog: GameLogEntry[];
}

// Debug state slice
interface DebugMessage {
  direction: 'sent' | 'received';
  type: string;
  data: unknown;
  timestamp: Date;
}

interface DebugSlice {
  debugMessages: DebugMessage[];
  debugPanelOpen: boolean;
}

interface GameStore
  extends PlacementSlice,
    TurnSlice,
    BuildSlice,
    TradeSlice,
    RobberSlice,
    DevCardSlice,
    LongestRoadSlice,
    LargestArmySlice,
    VictorySlice,
    GameLogSlice,
    DebugSlice {
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
  upgradeToCity: (vertexId: string) => void;
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

  // Build actions
  setBuildMode: (mode: BuildingType | null) => void;
  setBuildPending: (pending: boolean) => void;

  // Trade actions
  setActiveTrade: (trade: TradeSlice['activeTrade']) => void;
  updateTradeResponse: (
    playerId: string,
    response: 'accepted' | 'declined',
  ) => void;
  clearTrade: () => void;
  setTradeModalOpen: (open: boolean) => void;

  // Robber actions
  setWaitingForDiscards: (waiting: boolean, playerIds: string[]) => void;
  removePlayerFromDiscard: (playerId: string) => void;
  setDiscardRequired: (
    required: boolean,
    target: number,
    resources: PlayerResources | null,
  ) => void;
  toggleDiscardSelection: (resource: ResourceType, delta: number) => void;
  clearDiscardSelection: () => void;
  setRobberPlacementMode: (mode: boolean) => void;
  setRobberHexId: (hexId: string | null) => void;
  setStealRequired: (
    required: boolean,
    candidates: Array<{
      playerId: string;
      nickname: string;
      cardCount: number;
    }>,
  ) => void;
  clearRobberState: () => void;

  // Dev card actions
  setMyDevCards: (cards: OwnedDevCard[]) => void;
  addMyDevCard: (card: OwnedDevCard) => void;
  removeMyDevCard: (cardId: string) => void;
  setDeckRemaining: (count: number) => void;
  setOpponentDevCardCount: (playerId: string, count: number) => void;
  incrementOpponentDevCardCount: (playerId: string) => void;
  setHasPlayedDevCardThisTurn: (value: boolean) => void;
  setDevCardPlayPhase: (phase: DevCardSlice['devCardPlayPhase']) => void;
  setCardBeingPlayed: (card: OwnedDevCard | null) => void;
  setRoadsPlacedThisCard: (count: number) => void;
  setKnightsPlayed: (playerId: string, count: number) => void;
  incrementKnightsPlayed: (playerId: string) => void;
  clearDevCardState: () => void;

  // Longest road actions
  setLongestRoadState: (state: {
    holderId: string | null;
    holderLength: number;
    playerLengths: Record<string, number>;
  }) => void;

  // Largest army actions
  setLargestArmyState: (state: {
    holderId: string | null;
    holderKnights: number;
    playerKnightCounts: Record<string, number>;
  }) => void;

  // Victory actions
  setVictoryState: (data: {
    winnerId: string;
    winnerNickname: string;
    winnerVP: VPBreakdown;
    allPlayerVP: Record<string, VPBreakdown>;
    revealedVPCards: Array<{ playerId: string; cardCount: number }>;
  }) => void;
  setVictoryPhase: (phase: 'none' | 'reveal' | 'modal' | 'dismissed') => void;

  // Game log actions
  addLogEntry: (
    message: string,
    type?: 'info' | 'success' | 'warning' | 'error',
  ) => void;
  clearGameLog: () => void;

  // Debug actions
  addDebugMessage: (
    direction: 'sent' | 'received',
    type: string,
    data: unknown,
  ) => void;
  setDebugPanelOpen: (open: boolean) => void;
  clearDebugMessages: () => void;
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

  // Build state
  buildMode: null,
  isBuildPending: false,

  // Trade state
  activeTrade: null,
  tradeModalOpen: false,

  // Robber state
  waitingForDiscards: false,
  playersWhoMustDiscard: [],
  discardRequired: false,
  discardTarget: 0,
  discardResources: null,
  selectedForDiscard: { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 },
  robberPlacementMode: false,
  robberHexId: null,
  stealRequired: false,
  stealCandidates: [],

  // Dev card state
  myDevCards: [],
  opponentDevCardCounts: {},
  deckRemaining: 25,
  hasPlayedDevCardThisTurn: false,
  devCardPlayPhase: null,
  cardBeingPlayed: null,
  roadsPlacedThisCard: 0,
  knightsPlayed: {},

  // Longest road initial state
  longestRoadHolderId: null,
  longestRoadLength: 0,
  playerRoadLengths: {},

  // Largest army initial state
  largestArmyHolderId: null,
  largestArmyKnights: 0,

  // Victory initial state
  gameEnded: false,
  winnerId: null,
  winnerNickname: null,
  winnerVP: null,
  allPlayerVP: {},
  revealedVPCards: [],
  victoryPhase: 'none',

  // Game log state
  gameLog: [],

  // Debug state
  debugMessages: [],
  debugPanelOpen: false,

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

  upgradeToCity: (vertexId) =>
    set((state) => ({
      settlements: state.settlements.map((s) =>
        s.vertexId === vertexId ? { ...s, isCity: true } : s,
      ),
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

  // Build actions
  setBuildMode: (mode) => set({ buildMode: mode }),
  setBuildPending: (pending) => set({ isBuildPending: pending }),

  // Trade actions
  setActiveTrade: (trade) => set({ activeTrade: trade }),
  updateTradeResponse: (playerId, response) =>
    set((state) => ({
      activeTrade: state.activeTrade
        ? {
            ...state.activeTrade,
            responses: { ...state.activeTrade.responses, [playerId]: response },
          }
        : null,
    })),
  clearTrade: () => set({ activeTrade: null }),
  setTradeModalOpen: (open) => set({ tradeModalOpen: open }),

  // Robber actions
  setWaitingForDiscards: (waiting, playerIds) =>
    set({
      waitingForDiscards: waiting,
      playersWhoMustDiscard: playerIds,
    }),

  removePlayerFromDiscard: (playerId) =>
    set((state) => {
      const remaining = state.playersWhoMustDiscard.filter(
        (id) => id !== playerId,
      );
      // If no more players need to discard, clear waiting state
      return {
        playersWhoMustDiscard: remaining,
        waitingForDiscards: remaining.length > 0,
      };
    }),

  setDiscardRequired: (required, target, resources) =>
    set({
      discardRequired: required,
      discardTarget: target,
      discardResources: resources,
      selectedForDiscard: { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 },
    }),

  toggleDiscardSelection: (resource, delta) =>
    set((state) => {
      const current = state.selectedForDiscard[resource] || 0;
      const newVal = Math.max(0, current + delta);
      // Don't exceed what player has
      const max = state.discardResources?.[resource] || 0;
      return {
        selectedForDiscard: {
          ...state.selectedForDiscard,
          [resource]: Math.min(newVal, max),
        },
      };
    }),

  clearDiscardSelection: () =>
    set({
      selectedForDiscard: { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 },
    }),

  setRobberPlacementMode: (mode) => set({ robberPlacementMode: mode }),

  setRobberHexId: (hexId) => set({ robberHexId: hexId }),

  setStealRequired: (required, candidates) =>
    set({
      stealRequired: required,
      stealCandidates: candidates,
    }),

  clearRobberState: () =>
    set({
      waitingForDiscards: false,
      playersWhoMustDiscard: [],
      discardRequired: false,
      discardTarget: 0,
      discardResources: null,
      selectedForDiscard: { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 },
      robberPlacementMode: false,
      stealRequired: false,
      stealCandidates: [],
    }),

  // Dev card actions
  setMyDevCards: (cards) => set({ myDevCards: cards }),
  addMyDevCard: (card) =>
    set((state) => ({
      myDevCards: [...state.myDevCards, card],
    })),
  removeMyDevCard: (cardId) =>
    set((state) => ({
      myDevCards: state.myDevCards.filter((c) => c.id !== cardId),
    })),
  setDeckRemaining: (count) => set({ deckRemaining: count }),
  setOpponentDevCardCount: (playerId, count) =>
    set((state) => ({
      opponentDevCardCounts: {
        ...state.opponentDevCardCounts,
        [playerId]: count,
      },
    })),
  incrementOpponentDevCardCount: (playerId) =>
    set((state) => ({
      opponentDevCardCounts: {
        ...state.opponentDevCardCounts,
        [playerId]: (state.opponentDevCardCounts[playerId] || 0) + 1,
      },
    })),
  setHasPlayedDevCardThisTurn: (value) =>
    set({ hasPlayedDevCardThisTurn: value }),
  setDevCardPlayPhase: (phase) => set({ devCardPlayPhase: phase }),
  setCardBeingPlayed: (card) => set({ cardBeingPlayed: card }),
  setRoadsPlacedThisCard: (count) => set({ roadsPlacedThisCard: count }),
  setKnightsPlayed: (playerId, count) =>
    set((state) => ({
      knightsPlayed: { ...state.knightsPlayed, [playerId]: count },
    })),
  incrementKnightsPlayed: (playerId) =>
    set((state) => ({
      knightsPlayed: {
        ...state.knightsPlayed,
        [playerId]: (state.knightsPlayed[playerId] || 0) + 1,
      },
    })),
  clearDevCardState: () =>
    set({
      myDevCards: [],
      opponentDevCardCounts: {},
      deckRemaining: 25,
      hasPlayedDevCardThisTurn: false,
      devCardPlayPhase: null,
      cardBeingPlayed: null,
      roadsPlacedThisCard: 0,
      knightsPlayed: {},
    }),

  // Longest road actions
  setLongestRoadState: (state) =>
    set({
      longestRoadHolderId: state.holderId,
      longestRoadLength: state.holderLength,
      playerRoadLengths: state.playerLengths,
    }),

  // Largest army actions
  setLargestArmyState: (state) =>
    set((prev) => ({
      largestArmyHolderId: state.holderId,
      largestArmyKnights: state.holderKnights,
      knightsPlayed: { ...prev.knightsPlayed, ...state.playerKnightCounts },
    })),

  // Victory actions
  setVictoryState: (data) =>
    set({
      gameEnded: true,
      winnerId: data.winnerId,
      winnerNickname: data.winnerNickname,
      winnerVP: data.winnerVP,
      allPlayerVP: data.allPlayerVP,
      revealedVPCards: data.revealedVPCards,
      victoryPhase: data.revealedVPCards.length > 0 ? 'reveal' : 'modal',
    }),
  setVictoryPhase: (phase) => set({ victoryPhase: phase }),

  // Game log actions
  addLogEntry: (message, type = 'info') =>
    set((state) => ({
      gameLog: [
        ...state.gameLog.slice(-99), // Keep last 100 entries
        {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          message,
          type,
          timestamp: new Date(),
        },
      ],
    })),
  clearGameLog: () => set({ gameLog: [] }),

  // Debug actions
  addDebugMessage: (direction, type, data) =>
    set((state) => ({
      debugMessages: [
        { direction, type, data, timestamp: new Date() },
        ...state.debugMessages,
      ].slice(0, 100), // Limit to 100 messages
    })),
  setDebugPanelOpen: (open) => set({ debugPanelOpen: open }),
  clearDebugMessages: () => set({ debugMessages: [] }),
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
      !state.isAnimating &&
      !state.waitingForDiscards,
  );

export const useCanEndTurn = () =>
  useGameStore(
    (state) =>
      state.turnPhase === 'main' &&
      state.turnCurrentPlayerId === state.myPlayerId &&
      !state.isAnimating &&
      !state.waitingForDiscards &&
      !state.robberPlacementMode &&
      !state.stealRequired &&
      // Block during dev card play phases (road building, year of plenty, monopoly)
      (state.devCardPlayPhase === null || state.devCardPlayPhase === 'none'),
  );

export const useLastResourcesDistributed = () =>
  useGameStore((state) => state.lastResourcesDistributed);

// Build state selector hooks
export const useBuildMode = () => useGameStore((state) => state.buildMode);

export const useIsBuildPending = () =>
  useGameStore((state) => state.isBuildPending);

export const useCanAfford = (buildingType: BuildingType) => {
  return useGameStore((state) => {
    const myId = state.myPlayerId;
    if (!myId) return false;
    const resources = state.playerResources[myId];
    if (!resources) return false;
    const cost = BUILDING_COSTS[buildingType];
    return Object.entries(cost).every(
      ([resource, amount]) =>
        (resources[resource as keyof typeof resources] || 0) >= amount,
    );
  });
};

// Debug state selector hooks
export const useDebugMessages = () =>
  useGameStore((state) => state.debugMessages);

export const useDebugPanelOpen = () =>
  useGameStore((state) => state.debugPanelOpen);

// Game log selector hook
export const useGameLog = () => useGameStore((state) => state.gameLog);

// Robber state selector hooks
export const useWaitingForDiscards = () =>
  useGameStore((state) => state.waitingForDiscards);
export const usePlayersWhoMustDiscard = () =>
  useGameStore((state) => state.playersWhoMustDiscard);
export const useDiscardRequired = () =>
  useGameStore((state) => state.discardRequired);
export const useDiscardTarget = () =>
  useGameStore((state) => state.discardTarget);
export const useDiscardResources = () =>
  useGameStore((state) => state.discardResources);
export const useSelectedForDiscard = () =>
  useGameStore((state) => state.selectedForDiscard);
export const useRobberPlacementMode = () =>
  useGameStore((state) => state.robberPlacementMode);
export const useRobberHexId = () => useGameStore((state) => state.robberHexId);
export const useStealRequired = () =>
  useGameStore((state) => state.stealRequired);
export const useStealCandidates = () =>
  useGameStore((state) => state.stealCandidates);

// Combined hook for discard modal
export const useDiscardState = () =>
  useGameStore(
    useShallow((state) => ({
      required: state.discardRequired,
      target: state.discardTarget,
      resources: state.discardResources,
      selected: state.selectedForDiscard,
    })),
  );

// Dev card state selector hooks
export const useMyDevCards = () => useGameStore((state) => state.myDevCards);
export const useOpponentDevCardCounts = () =>
  useGameStore((state) => state.opponentDevCardCounts);
export const useDeckRemaining = () =>
  useGameStore((state) => state.deckRemaining);
export const useHasPlayedDevCardThisTurn = () =>
  useGameStore((state) => state.hasPlayedDevCardThisTurn);
export const useDevCardPlayPhase = () =>
  useGameStore((state) => state.devCardPlayPhase);
export const useCardBeingPlayed = () =>
  useGameStore((state) => state.cardBeingPlayed);
export const useRoadsPlacedThisCard = () =>
  useGameStore((state) => state.roadsPlacedThisCard);
export const useKnightsPlayed = (playerId: string) =>
  useGameStore((state) => state.knightsPlayed[playerId] || 0);

// Longest road state selector hooks
export const useLongestRoadHolder = () =>
  useGameStore((s) => s.longestRoadHolderId);

export const usePlayerRoadLengths = () =>
  useGameStore(useShallow((s) => s.playerRoadLengths));

// Largest army state selector hooks
export const useLargestArmyHolder = () =>
  useGameStore((s) => s.largestArmyHolderId);

// Victory state selector hooks
export const useGameEnded = () => useGameStore((s) => s.gameEnded);
export const useWinnerId = () => useGameStore((s) => s.winnerId);
export const useVictoryState = () =>
  useGameStore(
    useShallow((s) => ({
      winnerId: s.winnerId,
      winnerNickname: s.winnerNickname,
      winnerVP: s.winnerVP,
      allPlayerVP: s.allPlayerVP,
      revealedVPCards: s.revealedVPCards,
      victoryPhase: s.victoryPhase,
    })),
  );

/**
 * Calculate public victory points for a player.
 * Note: VP cards are hidden from opponents and NOT included in public VP.
 * They are only revealed when a player wins.
 */
export function usePlayerPublicVP(playerId: string): {
  settlements: number;
  cities: number;
  longestRoad: number;
  largestArmy: number;
  total: number;
} {
  return useGameStore(
    useShallow((state) => {
      const playerSettlements = state.settlements.filter(
        (s) => s.playerId === playerId,
      );
      const settlementCount = playerSettlements.filter((s) => !s.isCity).length;
      const cityCount = playerSettlements.filter((s) => s.isCity).length;
      const longestRoad = state.longestRoadHolderId === playerId ? 2 : 0;
      const largestArmy = state.largestArmyHolderId === playerId ? 2 : 0;

      // Note: VP cards are hidden until game ends, so NOT included in public VP
      return {
        settlements: settlementCount,
        cities: cityCount * 2,
        longestRoad,
        largestArmy,
        total: settlementCount + cityCount * 2 + longestRoad + largestArmy,
      };
    }),
  );
}
