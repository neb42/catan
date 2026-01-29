import { z } from 'zod';
import { BoardStateSchema } from './board';

export const ResourceTypeSchema = z.enum([
  'wood',
  'brick',
  'sheep',
  'wheat',
  'ore',
]);
export type ResourceType = z.infer<typeof ResourceTypeSchema>;

export const SettlementSchema = z.object({
  vertexId: z.string(), // Unique vertex ID from hexGeometry
  playerId: z.string(), // Owner player ID
  isCity: z.boolean(), // false for settlement, true for city (future)
});
export type Settlement = z.infer<typeof SettlementSchema>;

export const RoadSchema = z.object({
  edgeId: z.string(), // Unique edge ID from hexGeometry
  playerId: z.string(), // Owner player ID
});
export type Road = z.infer<typeof RoadSchema>;

export const GamePhaseSchema = z.enum([
  'setup_settlement1', // First settlement placement
  'setup_road1', // First road placement
  'setup_settlement2', // Second settlement (resources granted)
  'setup_road2', // Second road placement
  'playing', // Normal gameplay (future phases)
]);
export type GamePhase = z.infer<typeof GamePhaseSchema>;

export const PlacementStateSchema = z.object({
  currentPlayerIndex: z.number(), // 0-based index in player array
  draftRound: z.union([z.literal(1), z.literal(2)]), // Round 1 or 2
  phase: GamePhaseSchema,
  turnNumber: z.number(), // 0-15 for 4 players
});
export type PlacementState = z.infer<typeof PlacementStateSchema>;

export const PlayerResourcesSchema = z
  .record(ResourceTypeSchema, z.number())
  .default({ wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 });
export type PlayerResources = z.infer<typeof PlayerResourcesSchema>;

// Turn phase for main gameplay (after setup)
export const TurnPhaseSchema = z.enum(['roll', 'main']);
export type TurnPhase = z.infer<typeof TurnPhaseSchema>;

// Last dice roll result
export const DiceRollSchema = z.object({
  dice1: z.number().min(1).max(6),
  dice2: z.number().min(1).max(6),
  total: z.number().min(2).max(12),
});
export type DiceRoll = z.infer<typeof DiceRollSchema>;

// Turn state for main gameplay
export const TurnStateSchema = z.object({
  phase: TurnPhaseSchema,
  currentPlayerId: z.string(),
  turnNumber: z.number().min(1), // Starts at 1 for first turn
  lastDiceRoll: DiceRollSchema.nullable(), // null before first roll of turn
});
export type TurnState = z.infer<typeof TurnStateSchema>;

export const GameStateSchema = z.object({
  board: BoardStateSchema,
  settlements: z.array(SettlementSchema),
  roads: z.array(RoadSchema),
  placement: PlacementStateSchema.nullable(), // null when not in setup
  playerResources: z.record(z.string(), PlayerResourcesSchema), // playerId -> resources
  turnState: TurnStateSchema.nullable(), // null during setup, populated during main game
});
export type GameState = z.infer<typeof GameStateSchema>;
