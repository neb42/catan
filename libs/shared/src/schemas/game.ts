import { z } from 'zod';
import { PlayerSchema } from './player';

export const HexCoordSchema = z.object({
  q: z.number().int(),
  r: z.number().int(),
});

export type HexCoord = z.infer<typeof HexCoordSchema>;

export const TerrainSchema = z.enum([
  'wood',
  'wheat',
  'sheep',
  'brick',
  'ore',
  'desert',
]);

export type Terrain = z.infer<typeof TerrainSchema>;

export const HexTileSchema = z.object({
  coord: HexCoordSchema,
  terrain: TerrainSchema,
  number: z.number().int().min(2).max(12).nullable(),
  hasRobber: z.boolean(),
});

export type HexTile = z.infer<typeof HexTileSchema>;

export const PortSchema = z.object({
  position: z.string(),
  type: z.enum([
    '3:1',
    '2:1-wood',
    '2:1-wheat',
    '2:1-sheep',
    '2:1-brick',
    '2:1-ore',
  ]),
});

export type Port = z.infer<typeof PortSchema>;

export const BoardSchema = z.object({
  hexes: z.array(HexTileSchema).length(19),
  ports: z.array(PortSchema).length(9),
});

export type Board = z.infer<typeof BoardSchema>;

export const PlayerResourcesSchema = z.object({
  wood: z.number().int().min(0),
  wheat: z.number().int().min(0),
  sheep: z.number().int().min(0),
  brick: z.number().int().min(0),
  ore: z.number().int().min(0),
});

export type PlayerResources = z.infer<typeof PlayerResourcesSchema>;

export const GamePlayerSchema = PlayerSchema.extend({
  resources: PlayerResourcesSchema,
  settlements: z.array(z.string()),
  cities: z.array(z.string()),
  roads: z.array(z.string()),
  victoryPoints: z.number().int().min(0),
});

export type GamePlayer = z.infer<typeof GamePlayerSchema>;

export const GameStateSchema = z.object({
  roomId: z.string(),
  phase: z.enum(['initial_placement', 'gameplay', 'game_over']),
  turnPhase: z.enum(['roll', 'main', 'end']).nullable(),
  currentPlayer: z.string(),
  board: BoardSchema,
  players: z.array(GamePlayerSchema),
  placementRound: z.number().int().min(1).max(8).nullable(),
  lastDiceRoll: z
    .tuple([
      z.number().int().min(1).max(6),
      z.number().int().min(1).max(6),
    ])
    .nullable(),
});

export type GameState = z.infer<typeof GameStateSchema>;