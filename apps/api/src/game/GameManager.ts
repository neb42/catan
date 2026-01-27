import { GameState, BoardState, ResourceType } from '@catan/shared';
import { calculateDraftPosition, isSetupComplete } from '@catan/shared';
import { getUniqueVertices, getUniqueEdges, Vertex, Edge } from '@catan/shared';
import {
  isValidSettlementPlacement,
  isValidRoadPlacement,
  getInvalidSettlementReason,
  getInvalidRoadReason,
} from './placement-validator';
import { getAdjacentVertexIds } from './geometry-utils';

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
    };
  }

  getCurrentPlayerId(): string {
    if (!this.gameState.placement) return '';
    return this.playerIds[this.gameState.placement.currentPlayerIndex];
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

    // 6. Advance phase (settlement -> road)
    // Same player, same turn number, just phase change
    if (this.gameState.placement) {
      const isRound1 = this.gameState.placement.draftRound === 1;
      this.gameState.placement.phase = isRound1 ? 'setup_road1' : 'setup_road2';
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
      // Initialize first turn of main game (Phase 4)
      // For now just leave it null or set to main game state if defined
    }

    return { success: true, setupComplete };
  }

  getState(): GameState {
    return this.gameState;
  }
}
