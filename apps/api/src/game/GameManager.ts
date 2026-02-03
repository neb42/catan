import {
  GameState,
  BoardState,
  ResourceType,
  TurnState,
  BUILDING_COSTS,
  MAX_PIECES,
  ActiveTrade,
  OwnedDevCard,
  DevelopmentCardType,
  DEV_CARD_COST,
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
import {
  mustDiscard,
  getDiscardTarget,
  validateDiscard,
  getStealCandidates,
  executeSteal,
  validateRobberPlacement,
} from './robber-logic';
import { createShuffledDeck, canBuyDevCard, drawCard } from './dev-card-logic';
import {
  recalculateLongestRoad,
  LongestRoadResult,
} from './longest-road-logic';
import {
  recalculateLargestArmy,
  LargestArmyResult,
} from './largest-army-logic';

export class GameManager {
  private gameState: GameState;
  private vertices: Vertex[];
  private edges: Edge[];
  private playerIds: string[];
  private lastPlacedSettlementId: string | null = null;

  // Robber state tracking
  private pendingDiscards: Map<string, number> = new Map(); // playerId -> targetCount
  private robberPhase: 'none' | 'discarding' | 'moving' | 'stealing' = 'none';
  private robberMover: string | null = null; // playerId who rolled 7

  // Development card state
  private devCardDeck: DevelopmentCardType[] = [];
  private deckIndex = 0;
  private playerDevCards: Map<string, OwnedDevCard[]> = new Map(); // playerId -> owned cards
  private playedDevCardThisTurn = false;
  private knightsPlayed: Map<string, number> = new Map(); // playerId -> count

  // Dev card effect pending state
  private yearOfPlentyPending = false;
  private monopolyPending = false;
  private pendingDevCardPlayerId: string | null = null;

  // Road Building state
  private roadBuildingRemaining = 0; // 0, 1, or 2 roads remaining
  private roadBuildingEdges: string[] = []; // Edges placed during Road Building

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
      robberHexId: null, // null during setup, set to desert hex when main game starts
      longestRoadHolderId: null,
      longestRoadLength: 0,
      playerRoadLengths: Object.fromEntries(playerIds.map((id) => [id, 0])),
      largestArmyHolderId: null,
      largestArmyKnights: 0,
      playerKnightCounts: Object.fromEntries(playerIds.map((id) => [id, 0])),
      gamePhase: 'setup',
      winnerId: null,
    };

    // Initialize development card deck
    this.devCardDeck = createShuffledDeck();
    this.deckIndex = 0;

    // Initialize player dev cards and knights played for each player
    for (const playerId of playerIds) {
      this.playerDevCards.set(playerId, []);
      this.knightsPlayed.set(playerId, 0);
    }
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
    longestRoadResult?: LongestRoadResult;
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

    // 7. Update longest road
    const longestRoadResult = this.updateLongestRoad();

    return { success: true, setupComplete, longestRoadResult };
  }

  /**
   * Initializes turn state when transitioning from setup to main game.
   * First player in player order starts with roll phase.
   */
  private startMainGame(): void {
    // Initialize robber position on desert hex
    const desertHex = this.gameState.board.hexes.find(
      (h) => h.terrain === 'desert',
    );
    if (desertHex) {
      this.gameState.robberHexId = `${desertHex.q},${desertHex.r}`;
    }

    this.gameState.turnState = {
      phase: 'roll',
      currentPlayerId: this.playerIds[0], // First player starts
      turnNumber: 1,
      lastDiceRoll: null,
    };
  }

  /**
   * Rolls dice for the current player.
   * Distributes resources if total is not 7, otherwise triggers robber flow.
   */
  rollDice(playerId: string): {
    success: boolean;
    error?: string;
    dice1?: number;
    dice2?: number;
    total?: number;
    resourcesDistributed?: PlayerResourceGrant[];
    robberTriggered?: boolean;
    mustDiscardPlayers?: Array<{ playerId: string; targetCount: number }>;
    proceedToRobberMove?: boolean;
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

    // Update turn state with dice roll
    this.gameState.turnState.lastDiceRoll = { dice1, dice2, total };
    this.gameState.turnState.phase = 'main';

    // Handle robber on 7
    if (total === 7) {
      // Find players who must discard (8+ cards)
      const mustDiscardPlayers: Array<{
        playerId: string;
        targetCount: number;
      }> = [];
      for (const [pId, resources] of Object.entries(
        this.gameState.playerResources,
      )) {
        if (mustDiscard(resources)) {
          const target = getDiscardTarget(resources);
          this.pendingDiscards.set(pId, target);
          mustDiscardPlayers.push({ playerId: pId, targetCount: target });
        }
      }

      this.robberMover = playerId;

      if (mustDiscardPlayers.length > 0) {
        this.robberPhase = 'discarding';
      } else {
        this.robberPhase = 'moving';
      }

      return {
        success: true,
        dice1,
        dice2,
        total,
        resourcesDistributed: [], // No resources on 7
        robberTriggered: true,
        mustDiscardPlayers,
        proceedToRobberMove: mustDiscardPlayers.length === 0,
      };
    }

    // Normal roll - distribute resources
    const resourcesDistributed = distributeResources(
      total,
      this.gameState.board.hexes,
      this.gameState.settlements,
      this.vertices,
      this.gameState.playerResources,
      this.gameState.robberHexId,
    );

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

    // Clear any active trade (auto-cancel on turn end)
    this.activeTrade = null;

    // Reset dev card played flag for next turn
    this.playedDevCardThisTurn = false;

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
    longestRoadResult?: LongestRoadResult;
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

    // 7. Update longest road
    const longestRoadResult = this.updateLongestRoad();

    return {
      success: true,
      resourcesSpent: { ...cost },
      longestRoadResult,
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
    longestRoadResult?: LongestRoadResult;
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

    // 7. Update longest road (settlement can break opponent's road)
    const longestRoadResult = this.updateLongestRoad();

    return {
      success: true,
      resourcesSpent: { ...cost },
      longestRoadResult,
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
  // TRADE METHODS
  // ============================================================================

  private activeTrade: ActiveTrade | null = null;

  /**
   * Propose a domestic trade to other players.
   * Uses validateProposeTrade from trade-validator.
   */
  proposeTrade(
    playerId: string,
    offering: Partial<Record<ResourceType, number>>,
    requesting: Partial<Record<ResourceType, number>>,
  ): {
    success: boolean;
    error?: string;
  } {
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

    // Validate using trade-validator
    const playerResources = this.gameState.playerResources[playerId];
    if (!playerResources) {
      return { success: false, error: 'Player not found' };
    }

    const validation = validateProposeTrade(
      playerId,
      offering,
      requesting,
      playerResources,
      this.getCurrentPlayerId(),
    );

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Initialize trade with empty responses (will be filled as players respond)
    this.activeTrade = {
      proposerId: playerId,
      offering: offering as Record<ResourceType, number>,
      requesting: requesting as Record<ResourceType, number>,
      responses: {},
    };

    return { success: true };
  }

  /**
   * Respond to a trade proposal (accept/decline).
   * Uses validateTradeResponse from trade-validator.
   */
  respondToTrade(
    playerId: string,
    response: 'accept' | 'decline',
  ): {
    success: boolean;
    error?: string;
    allResponded?: boolean;
  } {
    // Check if there's an active trade
    if (!this.activeTrade) {
      return { success: false, error: 'No active trade' };
    }

    // Validate using trade-validator
    const validation = validateTradeResponse(
      playerId,
      this.activeTrade.proposerId,
      this.activeTrade.responses,
    );

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // If accepting, check player has the requested resources
    if (response === 'accept') {
      const playerResources = this.gameState.playerResources[playerId];
      if (playerResources) {
        for (const [resource, amount] of Object.entries(
          this.activeTrade.requesting,
        )) {
          const resourceType = resource as ResourceType;
          const playerAmount = playerResources[resourceType] || 0;
          if (playerAmount < (amount || 0)) {
            return { success: false, error: 'Not enough resources to accept' };
          }
        }
      }
    }

    // Update response
    this.activeTrade.responses[playerId] =
      response === 'accept' ? 'accepted' : 'declined';

    // Check if all non-proposer players have responded
    const allResponded = this.playerIds
      .filter((id) => id !== this.activeTrade!.proposerId)
      .every((id) => this.activeTrade!.responses[id] !== undefined);

    return { success: true, allResponded };
  }

  /**
   * Select a trade partner who accepted, execute the trade.
   * Uses validatePartnerSelection from trade-validator.
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

    // Validate using trade-validator
    const partnerResources = this.gameState.playerResources[partnerId];
    if (!partnerResources) {
      return { success: false, error: 'Partner not found' };
    }

    const validation = validatePartnerSelection(
      this.activeTrade.proposerId,
      partnerId,
      this.activeTrade.responses,
      partnerResources,
      this.activeTrade.requesting,
    );

    if (!validation.valid) {
      return { success: false, error: validation.error };
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
   * Only the proposer should be able to cancel (validated at handler level).
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
   * Uses validateBankTrade from trade-validator and getPlayerPortAccess for port rates.
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

    // Get player resources
    const playerResources = this.gameState.playerResources[playerId];
    if (!playerResources) {
      return { success: false, error: 'Player not found' };
    }

    // Calculate port access for player
    const portAccess = getPlayerPortAccess(
      playerId,
      this.gameState.settlements,
      this.gameState.board,
    );

    // Validate using trade-validator
    const validation = validateBankTrade(
      playerId,
      giving,
      receiving,
      playerResources,
      portAccess,
    );

    if (!validation.valid) {
      return { success: false, error: validation.error };
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

  /**
   * Get the current active trade, if any.
   */
  getActiveTrade(): ActiveTrade | null {
    return this.activeTrade;
  }

  // ============================================================================
  // ROBBER METHODS
  // ============================================================================

  /**
   * Submit discards when rolling a 7 triggers discard phase.
   * Players with 8+ cards must discard half (rounded down).
   */
  submitDiscard(
    playerId: string,
    resources: Partial<Record<ResourceType, number>>,
  ): {
    success: boolean;
    error?: string;
    allDiscardsDone?: boolean;
    discarded?: Partial<Record<ResourceType, number>>;
  } {
    // Check player needs to discard
    const targetCount = this.pendingDiscards.get(playerId);
    if (targetCount === undefined) {
      return { success: false, error: 'You do not need to discard' };
    }

    // Validate discard
    const currentResources = this.gameState.playerResources[playerId];
    const validation = validateDiscard(
      resources,
      currentResources,
      targetCount,
    );
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Apply discard - deduct resources
    for (const [resource, count] of Object.entries(resources)) {
      const resType = resource as ResourceType;
      const discarding = count ?? 0;
      if (discarding > 0) {
        this.gameState.playerResources[playerId][resType] -= discarding;
      }
    }

    // Remove from pending
    this.pendingDiscards.delete(playerId);

    // Check if all done
    const allDone = this.pendingDiscards.size === 0;
    if (allDone) {
      this.robberPhase = 'moving';
    }

    return { success: true, allDiscardsDone: allDone, discarded: resources };
  }

  /**
   * Move robber to a new hex after rolling 7 (and discards complete).
   */
  moveRobber(
    playerId: string,
    hexId: string,
  ): {
    success: boolean;
    error?: string;
    stealCandidates?: Array<{ playerId: string; cardCount: number }>;
    noStealPossible?: boolean;
    autoStolen?: { victimId: string; resourceType: ResourceType | null };
  } {
    // Verify it's robber mover's turn
    if (playerId !== this.robberMover) {
      return { success: false, error: 'Not your turn to move robber' };
    }

    if (this.robberPhase !== 'moving') {
      return { success: false, error: 'Not in robber move phase' };
    }

    // Validate placement
    const validation = validateRobberPlacement(
      hexId,
      this.gameState.board.hexes,
    );
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Move robber
    this.gameState.robberHexId = hexId;

    // Get steal candidates
    const candidates = getStealCandidates(
      hexId,
      this.gameState.settlements,
      this.vertices,
      this.gameState.playerResources,
      playerId,
    );

    if (candidates.length === 0) {
      // No one to steal from - robber phase complete
      this.robberPhase = 'none';
      this.robberMover = null;
      return { success: true, noStealPossible: true };
    }

    if (candidates.length === 1) {
      // Auto-steal from single victim
      const victim = candidates[0];
      const stolen = this.executeStealInternal(playerId, victim.playerId);
      this.robberPhase = 'none';
      this.robberMover = null;
      return {
        success: true,
        stealCandidates: candidates,
        autoStolen: { victimId: victim.playerId, resourceType: stolen },
      };
    }

    // Multiple candidates - need player to choose
    this.robberPhase = 'stealing';
    return { success: true, stealCandidates: candidates };
  }

  /**
   * Choose a player to steal from after moving robber (when multiple options).
   */
  stealFrom(
    playerId: string,
    victimId: string,
  ): {
    success: boolean;
    error?: string;
    resourceType?: ResourceType | null;
  } {
    if (playerId !== this.robberMover) {
      return { success: false, error: 'Not your turn to steal' };
    }

    if (this.robberPhase !== 'stealing') {
      return { success: false, error: 'Not in steal phase' };
    }

    // Validate victim is adjacent to robber
    const candidates = getStealCandidates(
      this.gameState.robberHexId!,
      this.gameState.settlements,
      this.vertices,
      this.gameState.playerResources,
      playerId,
    );

    if (!candidates.some((c) => c.playerId === victimId)) {
      return { success: false, error: 'Invalid steal target' };
    }

    const stolen = this.executeStealInternal(playerId, victimId);
    this.robberPhase = 'none';
    this.robberMover = null;

    return { success: true, resourceType: stolen };
  }

  /**
   * Internal helper to transfer a random resource from victim to thief.
   */
  private executeStealInternal(
    thiefId: string,
    victimId: string,
  ): ResourceType | null {
    const victimResources = this.gameState.playerResources[victimId];
    const stolen = executeSteal(victimResources);

    if (stolen) {
      // Transfer resource
      this.gameState.playerResources[victimId][stolen] -= 1;
      this.gameState.playerResources[thiefId][stolen] += 1;
    }

    return stolen;
  }

  /**
   * Get map of players who still need to discard and their target counts.
   */
  getPendingDiscards(): Map<string, number> {
    return new Map(this.pendingDiscards);
  }

  /**
   * Get current robber phase.
   */
  getRobberPhase(): string {
    return this.robberPhase;
  }

  /**
   * Get the player who rolled 7 and is controlling the robber.
   */
  getRobberMover(): string | null {
    return this.robberMover;
  }

  /**
   * Get resources for a specific player.
   */
  getPlayerResources(
    playerId: string,
  ): Record<ResourceType, number> | undefined {
    return this.gameState.playerResources[playerId];
  }

  /**
   * Get the full game state (for accessing robberHexId, etc).
   */
  getGameState(): GameState {
    return this.gameState;
  }

  // ============================================================================
  // DEVELOPMENT CARD METHODS
  // ============================================================================

  /**
   * Get the number of cards remaining in the deck.
   */
  getDeckRemaining(): number {
    return this.devCardDeck.length - this.deckIndex;
  }

  /**
   * Get development cards owned by a player.
   */
  getPlayerDevCards(playerId: string): OwnedDevCard[] {
    return this.playerDevCards.get(playerId) || [];
  }

  /**
   * Get the number of knights played by a player.
   */
  getKnightsPlayed(playerId: string): number {
    return this.knightsPlayed.get(playerId) || 0;
  }

  /**
   * Get all knights played by all players (for Largest Army tracking).
   */
  getAllKnightsPlayed(): Record<string, number> {
    const result: Record<string, number> = {};
    this.knightsPlayed.forEach((count, playerId) => {
      result[playerId] = count;
    });
    return result;
  }

  /**
   * Play a Knight development card.
   * Validates card ownership, same-turn restriction, one-per-turn restriction.
   * Enters robber move phase (skipping discard).
   */
  playKnight(
    playerId: string,
    cardId: string,
  ): {
    success: boolean;
    error?: string;
    currentRobberHex?: string | null;
    largestArmyResult?: LargestArmyResult;
  } {
    // 1. Validate it's player's turn
    if (playerId !== this.getCurrentPlayerId()) {
      return { success: false, error: 'Not your turn' };
    }

    // 2. Validate not already in a robber/dev card flow
    if (this.robberPhase !== 'none') {
      return { success: false, error: 'Robber flow already in progress' };
    }

    // 3. Find and validate the card
    const playerCards = this.playerDevCards.get(playerId) || [];
    const cardIndex = playerCards.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) {
      return { success: false, error: 'Card not found' };
    }

    const card = playerCards[cardIndex];
    if (card.type !== 'knight') {
      return { success: false, error: 'Not a Knight card' };
    }

    // 4. Check play restrictions (same-turn, one-per-turn)
    const currentTurn = this.gameState.turnState?.turnNumber || 1;
    if (card.purchasedOnTurn === currentTurn) {
      return { success: false, error: 'Cannot play card purchased this turn' };
    }
    if (this.playedDevCardThisTurn) {
      return { success: false, error: 'Already played a dev card this turn' };
    }

    // 5. Remove card from player's hand
    playerCards.splice(cardIndex, 1);
    this.playerDevCards.set(playerId, playerCards);

    // 6. Increment knight count
    const currentKnights = this.knightsPlayed.get(playerId) || 0;
    this.knightsPlayed.set(playerId, currentKnights + 1);

    // 7. Update largest army
    const largestArmyResult = this.updateLargestArmy();

    // 8. Mark dev card played this turn
    this.playedDevCardThisTurn = true;

    // 9. Enter robber move phase (skip discarding)
    this.robberPhase = 'moving';
    this.robberMover = playerId;

    return {
      success: true,
      currentRobberHex: this.gameState.robberHexId,
      largestArmyResult,
    };
  }

  /**
   * Buy a development card from the deck.
   * Validates turn, phase, resources, and deck availability.
   */
  buyDevCard(playerId: string): {
    success: boolean;
    error?: string;
    card?: OwnedDevCard;
    deckRemaining?: number;
  } {
    // 1. Validate it's player's turn and main phase
    if (playerId !== this.getCurrentPlayerId()) {
      return { success: false, error: 'Not your turn' };
    }
    if (
      !this.gameState.turnState ||
      this.gameState.turnState.phase !== 'main'
    ) {
      return { success: false, error: 'Can only buy during main phase' };
    }

    // 2. Validate can buy (resources + deck)
    const resources = this.gameState.playerResources[playerId];
    const check = canBuyDevCard(playerId, resources, this.getDeckRemaining());
    if (!check.canBuy) {
      return { success: false, error: check.reason };
    }

    // 3. Draw card from deck
    const { card: cardType, newIndex } = drawCard(
      this.devCardDeck,
      this.deckIndex,
    );
    if (!cardType) {
      return { success: false, error: 'Deck is empty' };
    }
    this.deckIndex = newIndex;

    // 4. Deduct resources
    const cost = DEV_CARD_COST;
    resources.ore -= cost.ore;
    resources.sheep -= cost.sheep;
    resources.wheat -= cost.wheat;

    // 5. Create owned card with current turn
    const currentTurn = this.gameState.turnState?.turnNumber || 1;
    const ownedCard: OwnedDevCard = {
      id: crypto.randomUUID(),
      type: cardType,
      purchasedOnTurn: currentTurn,
    };

    // 6. Add to player's hand
    const playerCards = this.playerDevCards.get(playerId) || [];
    playerCards.push(ownedCard);
    this.playerDevCards.set(playerId, playerCards);

    return {
      success: true,
      card: ownedCard,
      deckRemaining: this.getDeckRemaining(),
    };
  }

  /**
   * Play a Year of Plenty development card.
   * Validates card ownership, same-turn restriction, one-per-turn restriction.
   * Enters year of plenty mode, waiting for resource selection.
   */
  playYearOfPlenty(
    playerId: string,
    cardId: string,
  ): {
    success: boolean;
    error?: string;
    bankResources?: Record<ResourceType, number>;
  } {
    // 1. Validate it's player's turn
    if (playerId !== this.getCurrentPlayerId()) {
      return { success: false, error: 'Not your turn' };
    }

    // 2. Validate main phase
    if (
      !this.gameState.turnState ||
      this.gameState.turnState.phase !== 'main'
    ) {
      return { success: false, error: 'Can only play during main phase' };
    }

    // 3. Validate not already in a dev card flow
    if (this.robberPhase !== 'none') {
      return { success: false, error: 'Robber flow already in progress' };
    }
    if (this.yearOfPlentyPending || this.monopolyPending) {
      return { success: false, error: 'Dev card effect already in progress' };
    }

    // 4. Find and validate the card
    const playerCards = this.playerDevCards.get(playerId) || [];
    const cardIndex = playerCards.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) {
      return { success: false, error: 'Card not found' };
    }

    const card = playerCards[cardIndex];
    if (card.type !== 'year_of_plenty') {
      return { success: false, error: 'Not a Year of Plenty card' };
    }

    // 5. Check play restrictions (same-turn, one-per-turn)
    const currentTurn = this.gameState.turnState?.turnNumber || 1;
    if (card.purchasedOnTurn === currentTurn) {
      return { success: false, error: 'Cannot play card purchased this turn' };
    }
    if (this.playedDevCardThisTurn) {
      return { success: false, error: 'Already played a dev card this turn' };
    }

    // 6. Remove card from player's hand
    playerCards.splice(cardIndex, 1);
    this.playerDevCards.set(playerId, playerCards);

    // 7. Mark dev card played this turn
    this.playedDevCardThisTurn = true;

    // 8. Enter Year of Plenty mode
    this.yearOfPlentyPending = true;
    this.pendingDevCardPlayerId = playerId;

    // Calculate bank resources (simplified - assume infinite bank for now)
    // In a full implementation, track bank depletion
    const bankResources: Record<ResourceType, number> = {
      wood: 19,
      brick: 19,
      sheep: 19,
      wheat: 19,
      ore: 19,
    };

    return { success: true, bankResources };
  }

  /**
   * Complete Year of Plenty by selecting 2 resources from the bank.
   */
  completeYearOfPlenty(
    playerId: string,
    resources: [ResourceType, ResourceType],
  ): {
    success: boolean;
    error?: string;
  } {
    if (!this.yearOfPlentyPending || this.pendingDevCardPlayerId !== playerId) {
      return { success: false, error: 'Not in Year of Plenty mode' };
    }

    // Grant resources
    const playerResources = this.gameState.playerResources[playerId];
    resources.forEach((resource) => {
      playerResources[resource] = (playerResources[resource] || 0) + 1;
    });

    // Clear pending state
    this.yearOfPlentyPending = false;
    this.pendingDevCardPlayerId = null;

    return { success: true };
  }

  /**
   * Play a Monopoly development card.
   * Validates card ownership, same-turn restriction, one-per-turn restriction.
   * Enters monopoly mode, waiting for resource type selection.
   */
  playMonopoly(
    playerId: string,
    cardId: string,
  ): {
    success: boolean;
    error?: string;
  } {
    // 1. Validate it's player's turn
    if (playerId !== this.getCurrentPlayerId()) {
      return { success: false, error: 'Not your turn' };
    }

    // 2. Validate main phase
    if (
      !this.gameState.turnState ||
      this.gameState.turnState.phase !== 'main'
    ) {
      return { success: false, error: 'Can only play during main phase' };
    }

    // 3. Validate not already in a dev card flow
    if (this.robberPhase !== 'none') {
      return { success: false, error: 'Robber flow already in progress' };
    }
    if (this.yearOfPlentyPending || this.monopolyPending) {
      return { success: false, error: 'Dev card effect already in progress' };
    }

    // 4. Find and validate the card
    const playerCards = this.playerDevCards.get(playerId) || [];
    const cardIndex = playerCards.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) {
      return { success: false, error: 'Card not found' };
    }

    const card = playerCards[cardIndex];
    if (card.type !== 'monopoly') {
      return { success: false, error: 'Not a Monopoly card' };
    }

    // 5. Check play restrictions (same-turn, one-per-turn)
    const currentTurn = this.gameState.turnState?.turnNumber || 1;
    if (card.purchasedOnTurn === currentTurn) {
      return { success: false, error: 'Cannot play card purchased this turn' };
    }
    if (this.playedDevCardThisTurn) {
      return { success: false, error: 'Already played a dev card this turn' };
    }

    // 6. Remove card from player's hand
    playerCards.splice(cardIndex, 1);
    this.playerDevCards.set(playerId, playerCards);

    // 7. Mark dev card played this turn
    this.playedDevCardThisTurn = true;

    // 8. Enter Monopoly mode
    this.monopolyPending = true;
    this.pendingDevCardPlayerId = playerId;

    return { success: true };
  }

  /**
   * Complete Monopoly by selecting a resource type to take from all players.
   */
  completeMonopoly(
    playerId: string,
    resourceType: ResourceType,
  ): {
    success: boolean;
    error?: string;
    totalCollected?: number;
    fromPlayers?: Record<string, number>;
  } {
    if (!this.monopolyPending || this.pendingDevCardPlayerId !== playerId) {
      return { success: false, error: 'Not in Monopoly mode' };
    }

    let totalCollected = 0;
    const fromPlayers: Record<string, number> = {};

    // Take from all other players
    this.playerIds.forEach((otherId) => {
      if (otherId === playerId) return;

      const otherResources = this.gameState.playerResources[otherId];
      const amount = otherResources[resourceType] || 0;

      if (amount > 0) {
        otherResources[resourceType] = 0;
        totalCollected += amount;
        fromPlayers[otherId] = amount;
      }
    });

    // Give to monopoly player
    const playerResources = this.gameState.playerResources[playerId];
    playerResources[resourceType] =
      (playerResources[resourceType] || 0) + totalCollected;

    // Clear pending state
    this.monopolyPending = false;
    this.pendingDevCardPlayerId = null;

    return { success: true, totalCollected, fromPlayers };
  }

  /**
   * Play a Road Building development card.
   * Validates card ownership, same-turn restriction, one-per-turn restriction.
   * Enters road building mode, allowing up to 2 free roads.
   */
  playRoadBuilding(
    playerId: string,
    cardId: string,
  ): {
    success: boolean;
    error?: string;
    roadsToPlace?: number;
  } {
    // 1. Validate it's player's turn
    if (playerId !== this.getCurrentPlayerId()) {
      return { success: false, error: 'Not your turn' };
    }

    // 2. Validate main phase
    if (
      !this.gameState.turnState ||
      this.gameState.turnState.phase !== 'main'
    ) {
      return { success: false, error: 'Can only play during main phase' };
    }

    // 3. Validate not already in a dev card flow
    if (this.robberPhase !== 'none') {
      return { success: false, error: 'Robber flow already in progress' };
    }
    if (
      this.yearOfPlentyPending ||
      this.monopolyPending ||
      this.roadBuildingRemaining > 0
    ) {
      return { success: false, error: 'Dev card effect already in progress' };
    }

    // 4. Find and validate the card
    const playerCards = this.playerDevCards.get(playerId) || [];
    const cardIndex = playerCards.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) {
      return { success: false, error: 'Card not found' };
    }

    const card = playerCards[cardIndex];
    if (card.type !== 'road_building') {
      return { success: false, error: 'Not a Road Building card' };
    }

    // 5. Check play restrictions (same-turn, one-per-turn)
    const currentTurn = this.gameState.turnState?.turnNumber || 1;
    if (card.purchasedOnTurn === currentTurn) {
      return { success: false, error: 'Cannot play card purchased this turn' };
    }
    if (this.playedDevCardThisTurn) {
      return { success: false, error: 'Already played a dev card this turn' };
    }

    // 6. Calculate how many roads player can place (up to 2, limited by remaining pieces)
    const playerRoads = this.gameState.roads.filter(
      (r) => r.playerId === playerId,
    ).length;
    const roadsRemaining = MAX_PIECES.roads - playerRoads;
    const roadsToPlace = Math.min(2, roadsRemaining);

    if (roadsToPlace === 0) {
      return { success: false, error: 'No road pieces remaining' };
    }

    // 7. Remove card from player's hand
    playerCards.splice(cardIndex, 1);
    this.playerDevCards.set(playerId, playerCards);

    // 8. Mark dev card played this turn
    this.playedDevCardThisTurn = true;

    // 9. Enter Road Building mode
    this.roadBuildingRemaining = roadsToPlace;
    this.roadBuildingEdges = [];
    this.pendingDevCardPlayerId = playerId;

    return { success: true, roadsToPlace };
  }

  /**
   * Place a road during Road Building card effect.
   * Uses main-game road placement rules but costs no resources.
   */
  placeRoadBuildingRoad(
    playerId: string,
    edgeId: string,
  ): {
    success: boolean;
    error?: string;
    roadsRemaining?: number;
    complete?: boolean;
    edgesPlaced?: string[];
    longestRoadResult?: LongestRoadResult;
  } {
    // 1. Validate player and mode
    if (playerId !== this.pendingDevCardPlayerId) {
      return { success: false, error: 'Not your turn' };
    }
    if (this.roadBuildingRemaining <= 0) {
      return { success: false, error: 'Not in Road Building mode' };
    }

    // 2. Validate placement using main-game road rules
    const errorReason = getInvalidMainGameRoadReason(
      edgeId,
      this.gameState,
      playerId,
      this.edges,
    );
    if (errorReason) {
      return { success: false, error: errorReason };
    }

    // 3. Place road (no resource cost)
    this.gameState.roads.push({ edgeId, playerId });
    this.roadBuildingEdges.push(edgeId);
    this.roadBuildingRemaining--;

    // 4. Update longest road
    const longestRoadResult = this.updateLongestRoad();

    // 5. Check if complete
    const complete = this.roadBuildingRemaining === 0;

    if (complete) {
      // Reset Road Building state
      const edgesPlaced = [...this.roadBuildingEdges];
      this.roadBuildingEdges = [];
      this.pendingDevCardPlayerId = null;
      return {
        success: true,
        roadsRemaining: 0,
        complete: true,
        edgesPlaced,
        longestRoadResult,
      };
    }

    return {
      success: true,
      roadsRemaining: this.roadBuildingRemaining,
      complete: false,
      longestRoadResult,
    };
  }

  /**
   * Check if the game is in Road Building mode.
   */
  isInRoadBuildingMode(): boolean {
    return this.roadBuildingRemaining > 0;
  }

  /**
   * Get the number of roads remaining to place in Road Building mode.
   */
  getRoadBuildingRemaining(): number {
    return this.roadBuildingRemaining;
  }

  // ============================================================================
  // LONGEST ROAD METHODS
  // ============================================================================

  /**
   * Recalculate longest road and update game state.
   * Returns the result for broadcasting transfer events.
   */
  private updateLongestRoad(): LongestRoadResult {
    const currentState = {
      holderId: this.gameState.longestRoadHolderId,
      length: this.gameState.longestRoadLength,
    };

    const result = recalculateLongestRoad(
      this.gameState.roads,
      this.gameState.settlements,
      this.playerIds,
      currentState,
    );

    // Update game state
    this.gameState.longestRoadHolderId = result.newState.holderId;
    this.gameState.longestRoadLength = result.newState.length;
    this.gameState.playerRoadLengths = result.playerLengths;

    return result;
  }

  // ============================================================================
  // LARGEST ARMY METHODS
  // ============================================================================

  /**
   * Recalculate largest army and update game state.
   * Returns the result for broadcasting transfer events.
   */
  private updateLargestArmy(): LargestArmyResult {
    const knightCounts: Record<string, number> = {};
    this.knightsPlayed.forEach((count, playerId) => {
      knightCounts[playerId] = count;
    });

    const currentState = {
      holderId: this.gameState.largestArmyHolderId,
      knights: this.gameState.largestArmyKnights,
    };

    const result = recalculateLargestArmy(knightCounts, currentState);

    // Update game state
    this.gameState.largestArmyHolderId = result.newState.holderId;
    this.gameState.largestArmyKnights = result.newState.knights;
    this.gameState.playerKnightCounts = result.knightCounts;

    return result;
  }
}
