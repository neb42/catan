import {
  GameState,
  BoardState,
  ResourceType,
  TurnState,
  BUILDING_COSTS,
  MAX_PIECES,
  ActiveTrade,
} from '@catan/shared';
import { calculateDraftPosition, isSetupComplete } from '@catan/shared';
import { getUniqueVertices, getUniqueEdges, Vertex, Edge } from '@catan/shared';
import {
  isValidSettlementPlacement,
  isValidRoadPlacement,
  getInvalidSettlementReason,
  getInvalidRoadReason,
  isValidMainGameSettlement,
  isValidMainGameRoad,
  isValidCityUpgrade,
  getInvalidMainGameSettlementReason,
  getInvalidMainGameRoadReason,
  getInvalidCityUpgradeReason,
} from './placement-validator';
import { getAdjacentVertexIds } from './geometry-utils';
import {
  distributeResources,
  PlayerResourceGrant,
} from './resource-distributor';
import {
  validateProposeTrade,
  validateTradeResponse,
  validatePartnerSelection,
  validateBankTrade,
} from './trade-validator';
import { getPlayerPortAccess } from './port-access';

export class GameManager {
  private gameState: GameState;
  private vertices: Vertex[];
  private edges: Edge[];
  private playerIds: string[];
  private lastPlacedSettlementId: string | null = null;

  constructor(board: BoardState, playerIds: string[]) {
    this.playerIds = playerIds;
    // Assuming size {x: 10, y: 10} matching default in shared library
    this.vertices = getUniqueVertices(board.hexes);
    this.edges = getUniqueEdges(board.hexes);

    const initialDraft = calculateDraftPosition(0, playerIds.length);

    this.gameState = {
      board,
      settlements: [],
      roads: [],
      placement: {
        currentPlayerIndex: initialDraft.playerIndex,
        draftRound: initialDraft.round,
        phase:
          initialDraft.phase === 'settlement'
            ? 'setup_settlement1'
            : 'setup_road1',
        turnNumber: 0,
      },
      playerResources: Object.fromEntries(
        playerIds.map((id) => [
          id,
          { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 },
        ]),
      ),
      turnState: null, // null during setup, initialized when main game starts
    };
  }

  getCurrentPlayerId(): string {
    // During placement phase
    if (this.gameState.placement) {
      return this.playerIds[this.gameState.placement.currentPlayerIndex];
    }
    // During main game
    if (this.gameState.turnState) {
      return this.gameState.turnState.currentPlayerId;
    }
    return '';
  }

  getPlacementPhase(): 'settlement' | 'road' | null {
    if (!this.gameState.placement) return null;
    const phase = this.gameState.placement.phase;
    if (phase.includes('settlement')) return 'settlement';
    if (phase.includes('road')) return 'road';
    return null;
  }

  placeSettlement(
    vertexId: string,
    playerId: string,
  ): {
    success: boolean;
    error?: string;
    resourcesGranted?: Array<{ type: ResourceType; count: number }>;
    isSecondSettlement: boolean;
  } {
    // 1. Validate current player
    if (playerId !== this.getCurrentPlayerId()) {
      return {
        success: false,
        error: 'Not your turn',
        isSecondSettlement: false,
      };
    }

    // 2. Validate phase
    const currentPhase = this.getPlacementPhase();
    if (currentPhase !== 'settlement') {
      return {
        success: false,
        error: 'Not settlement placement phase',
        isSecondSettlement: false,
      };
    }

    // 3. Validate placement
    const errorReason = getInvalidSettlementReason(
      vertexId,
      this.gameState,
      this.vertices,
      this.edges,
    );
    if (errorReason) {
      return { success: false, error: errorReason, isSecondSettlement: false };
    }

    // 4. Update state
    const isSecondSettlement = this.gameState.placement?.draftRound === 2;

    // Add settlement
    this.gameState.settlements.push({
      vertexId,
      playerId,
      isCity: false,
    });
    this.lastPlacedSettlementId = vertexId;

    // 5. Grant resources if second settlement
    let resourcesGranted: Array<{ type: ResourceType; count: number }> = [];
    if (isSecondSettlement) {
      // Find adjacent hexes
      const vertex = this.vertices.find((v) => v.id === vertexId);
      if (vertex) {
        // Find hexes from vertex.adjacentHexes (format "q,r")
        vertex.adjacentHexes.forEach((hexId) => {
          const [q, r] = hexId.split(',').map(Number);
          const hex = this.gameState.board.hexes.find(
            (h) => h.q === q && h.r === r,
          );

          if (hex && hex.terrain !== 'desert' && hex.number !== null) {
            // Map terrain to resource
            const terrainToResource: Record<string, ResourceType> = {
              forest: 'wood',
              hills: 'brick',
              pasture: 'sheep',
              fields: 'wheat',
              mountains: 'ore',
            };

            const resourceType = terrainToResource[hex.terrain];
            if (resourceType) {
              // Add to player resources
              this.gameState.playerResources[playerId][resourceType]++;

              // Add to granted list (aggregate if multiple of same type)
              const existing = resourcesGranted.find(
                (r) => r.type === resourceType,
              );
              if (existing) {
                existing.count++;
              } else {
                resourcesGranted.push({ type: resourceType, count: 1 });
              }
            }
          }
        });
      }
    }

    // 6. Advance turn (settlement -> road)
    // Increment turn number and update phase
    if (this.gameState.placement) {
      const nextTurnNumber = this.gameState.placement.turnNumber + 1;
      const nextDraft = calculateDraftPosition(
        nextTurnNumber,
        this.playerIds.length,
      );

      this.gameState.placement.turnNumber = nextTurnNumber;
      this.gameState.placement.currentPlayerIndex = nextDraft.playerIndex;
      this.gameState.placement.draftRound = nextDraft.round;

      // Map draft phase to specific setup phase string
      if (nextDraft.phase === 'settlement') {
        this.gameState.placement.phase =
          nextDraft.round === 1 ? 'setup_settlement1' : 'setup_settlement2';
        // Reset lastPlacedSettlementId if moving to next player
        this.lastPlacedSettlementId = null;
      } else {
        this.gameState.placement.phase =
          nextDraft.round === 1 ? 'setup_road1' : 'setup_road2';
      }
    }

    return {
      success: true,
      resourcesGranted:
        resourcesGranted.length > 0 ? resourcesGranted : undefined,
      isSecondSettlement,
    };
  }

  placeRoad(
    edgeId: string,
    playerId: string,
  ): {
    success: boolean;
    error?: string;
    setupComplete: boolean;
  } {
    // 1. Validate current player
    if (playerId !== this.getCurrentPlayerId()) {
      return { success: false, error: 'Not your turn', setupComplete: false };
    }

    // 2. Validate phase
    const currentPhase = this.getPlacementPhase();
    if (currentPhase !== 'road') {
      return {
        success: false,
        error: 'Not road placement phase',
        setupComplete: false,
      };
    }

    // 3. Validate placement
    const errorReason = getInvalidRoadReason(
      edgeId,
      this.gameState,
      playerId,
      this.lastPlacedSettlementId,
      this.edges,
    );
    if (errorReason) {
      return { success: false, error: errorReason, setupComplete: false };
    }

    // 4. Update state
    this.gameState.roads.push({
      edgeId,
      playerId,
    });

    // 5. Advance turn
    if (this.gameState.placement) {
      const nextTurnNumber = this.gameState.placement.turnNumber + 1;
      const nextDraft = calculateDraftPosition(
        nextTurnNumber,
        this.playerIds.length,
      );

      this.gameState.placement.turnNumber = nextTurnNumber;
      this.gameState.placement.currentPlayerIndex = nextDraft.playerIndex;
      this.gameState.placement.draftRound = nextDraft.round;

      // Map draft phase to specific setup phase string
      if (nextDraft.phase === 'settlement') {
        this.gameState.placement.phase =
          nextDraft.round === 1 ? 'setup_settlement1' : 'setup_settlement2';
        // Reset lastPlacedSettlementId for new turn
        this.lastPlacedSettlementId = null;
      } else {
        // This shouldn't happen based on snake draft logic (always S->R->S->R...),
        // but for completeness:
        this.gameState.placement.phase =
          nextDraft.round === 1 ? 'setup_road1' : 'setup_road2';
      }
    }

    // 6. Check if setup complete
    const setupComplete = isSetupComplete(
      this.gameState.placement!.turnNumber,
      this.playerIds.length,
    );
    if (setupComplete) {
      this.gameState.placement = null; // Clear placement state to indicate game start
      this.startMainGame(); // Initialize turn state for main game
    }

    return { success: true, setupComplete };
  }

  /**
   * Initializes turn state when transitioning from setup to main game.
   * First player in player order starts with roll phase.
   */
  private startMainGame(): void {
    this.gameState.turnState = {
      phase: 'roll',
      currentPlayerId: this.playerIds[0], // First player starts
      turnNumber: 1,
      lastDiceRoll: null,
    };
  }

  /**
   * Rolls dice for the current player.
   * Distributes resources if total is not 7 (robber handling is Phase 6).
   */
  rollDice(playerId: string): {
    success: boolean;
    error?: string;
    dice1?: number;
    dice2?: number;
    total?: number;
    resourcesDistributed?: PlayerResourceGrant[];
  } {
    // Validate it's the player's turn
    if (playerId !== this.getCurrentPlayerId()) {
      return { success: false, error: 'Not your turn' };
    }

    // Validate we're in main game and roll phase
    if (!this.gameState.turnState) {
      return { success: false, error: 'Game not in main phase' };
    }

    if (this.gameState.turnState.phase !== 'roll') {
      return { success: false, error: 'Not in roll phase' };
    }

    // Generate dice values
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;

    // Distribute resources (skip robber logic for now - Phase 6)
    let resourcesDistributed: PlayerResourceGrant[] = [];
    if (total !== 7) {
      resourcesDistributed = distributeResources(
        total,
        this.gameState.board.hexes,
        this.gameState.settlements,
        this.vertices,
        this.gameState.playerResources,
      );
    }
    // Note: When total === 7, robber logic will be added in Phase 6

    // Update turn state
    this.gameState.turnState.lastDiceRoll = { dice1, dice2, total };
    this.gameState.turnState.phase = 'main';

    return {
      success: true,
      dice1,
      dice2,
      total,
      resourcesDistributed,
    };
  }

  /**
   * Ends the current player's turn and advances to the next player.
   */
  endTurn(playerId: string): {
    success: boolean;
    error?: string;
    nextPlayerId?: string;
    turnNumber?: number;
  } {
    // Validate it's the player's turn
    if (playerId !== this.getCurrentPlayerId()) {
      return { success: false, error: 'Not your turn' };
    }

    // Validate we're in main game and main phase
    if (!this.gameState.turnState) {
      return { success: false, error: 'Game not in main phase' };
    }

    if (this.gameState.turnState.phase !== 'main') {
      return { success: false, error: 'Cannot end turn during roll phase' };
    }

    // Advance to next player
    const currentIndex = this.playerIds.indexOf(
      this.gameState.turnState.currentPlayerId,
    );
    const nextIndex = (currentIndex + 1) % this.playerIds.length;
    const nextPlayerId = this.playerIds[nextIndex];
    const nextTurnNumber = this.gameState.turnState.turnNumber + 1;

    // Update turn state
    this.gameState.turnState = {
      phase: 'roll',
      currentPlayerId: nextPlayerId,
      turnNumber: nextTurnNumber,
      lastDiceRoll: null,
    };

    return {
      success: true,
      nextPlayerId,
      turnNumber: nextTurnNumber,
    };
  }

  getState(): GameState {
    return this.gameState;
  }

  // ============================================================================
  // BUILDING HELPERS
  // ============================================================================

  /**
   * Check if player has at least the required resources for a building cost.
   */
  hasResources(
    playerId: string,
    cost: Partial<Record<ResourceType, number>>,
  ): boolean {
    const playerResources = this.gameState.playerResources[playerId];
    if (!playerResources) return false;

    for (const [resource, amount] of Object.entries(cost)) {
      const resourceType = resource as ResourceType;
      if ((playerResources[resourceType] || 0) < (amount || 0)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Deduct resources from player. Assumes hasResources was already checked.
   */
  deductResources(
    playerId: string,
    cost: Partial<Record<ResourceType, number>>,
  ): void {
    const playerResources = this.gameState.playerResources[playerId];
    if (!playerResources) return;

    for (const [resource, amount] of Object.entries(cost)) {
      const resourceType = resource as ResourceType;
      playerResources[resourceType] =
        (playerResources[resourceType] || 0) - (amount || 0);
    }
  }

  /**
   * Count pieces owned by a player (roads, settlements, cities).
   */
  countPlayerPieces(playerId: string): {
    roads: number;
    settlements: number;
    cities: number;
  } {
    const roads = this.gameState.roads.filter(
      (r) => r.playerId === playerId,
    ).length;

    let settlements = 0;
    let cities = 0;
    for (const s of this.gameState.settlements) {
      if (s.playerId === playerId) {
        if (s.isCity) {
          cities++;
        } else {
          settlements++;
        }
      }
    }

    return { roads, settlements, cities };
  }

  // ============================================================================
  // BUILD METHODS (Main Game)
  // ============================================================================

  /**
   * Build a road during main game phase.
   * Validates: turn, phase, piece limit, resources, placement.
   */
  buildRoad(
    edgeId: string,
    playerId: string,
  ): {
    success: boolean;
    error?: string;
    resourcesSpent?: Partial<Record<ResourceType, number>>;
  } {
    // 1. Validate it's player's turn
    if (playerId !== this.getCurrentPlayerId()) {
      return { success: false, error: 'Not your turn' };
    }

    // 2. Validate we're in main game and main phase
    if (!this.gameState.turnState) {
      return { success: false, error: 'Game not in main phase' };
    }

    if (this.gameState.turnState.phase !== 'main') {
      return { success: false, error: 'Must roll dice first' };
    }

    // 3. Validate piece limit
    const pieces = this.countPlayerPieces(playerId);
    if (pieces.roads >= MAX_PIECES.roads) {
      return { success: false, error: 'No more roads available' };
    }

    // 4. Validate resources
    const cost = BUILDING_COSTS.road;
    if (!this.hasResources(playerId, cost)) {
      return { success: false, error: 'Not enough resources' };
    }

    // 5. Validate placement
    const placementError = getInvalidMainGameRoadReason(
      edgeId,
      this.gameState,
      playerId,
      this.edges,
    );
    if (placementError) {
      return { success: false, error: placementError };
    }

    // 6. All valid - deduct resources and place road
    this.deductResources(playerId, cost);
    this.gameState.roads.push({
      edgeId,
      playerId,
    });

    return {
      success: true,
      resourcesSpent: { ...cost },
    };
  }

  /**
   * Build a settlement during main game phase.
   * Validates: turn, phase, piece limit, resources, placement.
   */
  buildSettlement(
    vertexId: string,
    playerId: string,
  ): {
    success: boolean;
    error?: string;
    resourcesSpent?: Partial<Record<ResourceType, number>>;
  } {
    // 1. Validate it's player's turn
    if (playerId !== this.getCurrentPlayerId()) {
      return { success: false, error: 'Not your turn' };
    }

    // 2. Validate we're in main game and main phase
    if (!this.gameState.turnState) {
      return { success: false, error: 'Game not in main phase' };
    }

    if (this.gameState.turnState.phase !== 'main') {
      return { success: false, error: 'Must roll dice first' };
    }

    // 3. Validate piece limit
    const pieces = this.countPlayerPieces(playerId);
    if (pieces.settlements >= MAX_PIECES.settlements) {
      return { success: false, error: 'No more settlements available' };
    }

    // 4. Validate resources
    const cost = BUILDING_COSTS.settlement;
    if (!this.hasResources(playerId, cost)) {
      return { success: false, error: 'Not enough resources' };
    }

    // 5. Validate placement
    const placementError = getInvalidMainGameSettlementReason(
      vertexId,
      this.gameState,
      playerId,
      this.vertices,
      this.edges,
    );
    if (placementError) {
      return { success: false, error: placementError };
    }

    // 6. All valid - deduct resources and place settlement
    this.deductResources(playerId, cost);
    this.gameState.settlements.push({
      vertexId,
      playerId,
      isCity: false,
    });

    return {
      success: true,
      resourcesSpent: { ...cost },
    };
  }

  /**
   * Upgrade a settlement to a city during main game phase.
   * Validates: turn, phase, piece limit, resources, placement (must be own settlement).
   */
  buildCity(
    vertexId: string,
    playerId: string,
  ): {
    success: boolean;
    error?: string;
    resourcesSpent?: Partial<Record<ResourceType, number>>;
  } {
    // 1. Validate it's player's turn
    if (playerId !== this.getCurrentPlayerId()) {
      return { success: false, error: 'Not your turn' };
    }

    // 2. Validate we're in main game and main phase
    if (!this.gameState.turnState) {
      return { success: false, error: 'Game not in main phase' };
    }

    if (this.gameState.turnState.phase !== 'main') {
      return { success: false, error: 'Must roll dice first' };
    }

    // 3. Validate piece limit
    const pieces = this.countPlayerPieces(playerId);
    if (pieces.cities >= MAX_PIECES.cities) {
      return { success: false, error: 'No more cities available' };
    }

    // 4. Validate resources
    const cost = BUILDING_COSTS.city;
    if (!this.hasResources(playerId, cost)) {
      return { success: false, error: 'Not enough resources' };
    }

    // 5. Validate placement (must be own settlement that's not already a city)
    const placementError = getInvalidCityUpgradeReason(
      vertexId,
      this.gameState,
      playerId,
    );
    if (placementError) {
      return { success: false, error: placementError };
    }

    // 6. All valid - deduct resources and upgrade settlement to city
    this.deductResources(playerId, cost);

    // Find the settlement and set isCity to true
    const settlement = this.gameState.settlements.find(
      (s) => s.vertexId === vertexId && s.playerId === playerId,
    );
    if (settlement) {
      settlement.isCity = true;
    }

    return {
      success: true,
      resourcesSpent: { ...cost },
    };
  }

  // ============================================================================
  // TRADE METHODS (Stubs - implemented in 06-02)
  // ============================================================================

  private activeTrade: ActiveTrade | null = null;

  /**
   * Propose a domestic trade to other players.
   * Stub implementation - full logic in 06-02.
   */
  proposeTrade(
    playerId: string,
    offering: Partial<Record<ResourceType, number>>,
    requesting: Partial<Record<ResourceType, number>>,
  ): {
    success: boolean;
    error?: string;
  } {
    // Validate it's player's turn
    if (playerId !== this.getCurrentPlayerId()) {
      return { success: false, error: 'Not your turn' };
    }

    // Validate we're in main game and main phase
    if (!this.gameState.turnState) {
      return { success: false, error: 'Game not in main phase' };
    }

    if (this.gameState.turnState.phase !== 'main') {
      return { success: false, error: 'Must roll dice first' };
    }

    // Check if already trading
    if (this.activeTrade) {
      return { success: false, error: 'Trade already in progress' };
    }

    // Check player has the resources they're offering
    for (const [resource, amount] of Object.entries(offering)) {
      const resourceType = resource as ResourceType;
      const playerAmount =
        this.gameState.playerResources[playerId]?.[resourceType] || 0;
      if (playerAmount < (amount || 0)) {
        return { success: false, error: 'Not enough resources to offer' };
      }
    }

    // Initialize trade with all other players as pending
    const responses: Record<string, 'pending' | 'accepted' | 'declined'> = {};
    for (const pid of this.playerIds) {
      if (pid !== playerId) {
        responses[pid] = 'pending';
      }
    }

    this.activeTrade = {
      proposerId: playerId,
      offering: offering as Record<ResourceType, number>,
      requesting: requesting as Record<ResourceType, number>,
      responses,
    };

    return { success: true };
  }

  /**
   * Respond to a trade proposal (accept/decline).
   * Stub implementation - full logic in 06-02.
   */
  respondToTrade(
    playerId: string,
    response: 'accept' | 'decline',
  ): {
    success: boolean;
    error?: string;
  } {
    // Check if there's an active trade
    if (!this.activeTrade) {
      return { success: false, error: 'No active trade' };
    }

    // Can't respond to your own trade
    if (this.activeTrade.proposerId === playerId) {
      return { success: false, error: 'Cannot respond to your own trade' };
    }

    // Check if player has already responded
    if (this.activeTrade.responses[playerId] !== 'pending') {
      return { success: false, error: 'Already responded to trade' };
    }

    // If accepting, check player has the requested resources
    if (response === 'accept') {
      for (const [resource, amount] of Object.entries(
        this.activeTrade.requesting,
      )) {
        const resourceType = resource as ResourceType;
        const playerAmount =
          this.gameState.playerResources[playerId]?.[resourceType] || 0;
        if (playerAmount < (amount || 0)) {
          return { success: false, error: 'Not enough resources to accept' };
        }
      }
    }

    this.activeTrade.responses[playerId] =
      response === 'accept' ? 'accepted' : 'declined';
    return { success: true };
  }

  /**
   * Select a trade partner who accepted, execute the trade.
   * Stub implementation - full logic in 06-02.
   */
  selectTradePartner(partnerId: string): {
    success: boolean;
    error?: string;
    proposerId?: string;
    proposerGave?: Partial<Record<ResourceType, number>>;
    partnerGave?: Partial<Record<ResourceType, number>>;
  } {
    // Check if there's an active trade
    if (!this.activeTrade) {
      return { success: false, error: 'No active trade' };
    }

    // Check if partner accepted
    if (this.activeTrade.responses[partnerId] !== 'accepted') {
      return { success: false, error: 'Partner has not accepted trade' };
    }

    const proposerId = this.activeTrade.proposerId;
    const proposerGave = { ...this.activeTrade.offering };
    const partnerGave = { ...this.activeTrade.requesting };

    // Execute the trade - transfer resources
    // Deduct from proposer (offering), add to partner
    for (const [resource, amount] of Object.entries(proposerGave)) {
      const resourceType = resource as ResourceType;
      this.gameState.playerResources[proposerId][resourceType] -= amount || 0;
      this.gameState.playerResources[partnerId][resourceType] += amount || 0;
    }

    // Deduct from partner (requesting), add to proposer
    for (const [resource, amount] of Object.entries(partnerGave)) {
      const resourceType = resource as ResourceType;
      this.gameState.playerResources[partnerId][resourceType] -= amount || 0;
      this.gameState.playerResources[proposerId][resourceType] += amount || 0;
    }

    // Clear active trade
    this.activeTrade = null;

    return {
      success: true,
      proposerId,
      proposerGave,
      partnerGave,
    };
  }

  /**
   * Cancel the current trade proposal.
   * Stub implementation - full logic in 06-02.
   */
  cancelTrade(): {
    success: boolean;
    error?: string;
  } {
    if (!this.activeTrade) {
      return { success: false, error: 'No active trade' };
    }

    this.activeTrade = null;
    return { success: true };
  }

  /**
   * Execute a bank/port trade.
   * Stub implementation - full logic in 06-02.
   */
  executeBankTrade(
    playerId: string,
    giving: Partial<Record<ResourceType, number>>,
    receiving: Partial<Record<ResourceType, number>>,
  ): {
    success: boolean;
    error?: string;
    gave?: Partial<Record<ResourceType, number>>;
    received?: Partial<Record<ResourceType, number>>;
  } {
    // Validate it's player's turn
    if (playerId !== this.getCurrentPlayerId()) {
      return { success: false, error: 'Not your turn' };
    }

    // Validate we're in main game and main phase
    if (!this.gameState.turnState) {
      return { success: false, error: 'Game not in main phase' };
    }

    if (this.gameState.turnState.phase !== 'main') {
      return { success: false, error: 'Must roll dice first' };
    }

    // Check player has the resources they're giving
    for (const [resource, amount] of Object.entries(giving)) {
      const resourceType = resource as ResourceType;
      const playerAmount =
        this.gameState.playerResources[playerId]?.[resourceType] || 0;
      if (playerAmount < (amount || 0)) {
        return { success: false, error: 'Not enough resources' };
      }
    }

    // Basic 4:1 bank trade validation
    // Port logic will be added in 06-02
    const totalGiving = Object.values(giving).reduce(
      (sum, val) => sum + (val || 0),
      0,
    );
    const totalReceiving = Object.values(receiving).reduce(
      (sum, val) => sum + (val || 0),
      0,
    );

    if (totalGiving !== totalReceiving * 4) {
      return { success: false, error: 'Invalid bank trade ratio (4:1)' };
    }

    // Execute trade
    for (const [resource, amount] of Object.entries(giving)) {
      const resourceType = resource as ResourceType;
      this.gameState.playerResources[playerId][resourceType] -= amount || 0;
    }

    for (const [resource, amount] of Object.entries(receiving)) {
      const resourceType = resource as ResourceType;
      this.gameState.playerResources[playerId][resourceType] += amount || 0;
    }

    return {
      success: true,
      gave: giving,
      received: receiving,
    };
  }
}
