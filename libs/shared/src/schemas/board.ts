import { z } from 'zod';

export const TerrainTypeSchema = z.enum(['forest', 'hills', 'fields', 'pasture', 'mountains', 'desert']);

export const PortTypeSchema = z.enum(['generic', 'wood', 'brick', 'sheep', 'wheat', 'ore']);

export const HexSchema = z.object({
  q: z.number(),
  r: z.number(),
  terrain: TerrainTypeSchema,
  number: z.number().nullable(),
});

export const PortSchema = z.object({
  type: PortTypeSchema,
  hexQ: z.number(),
  hexR: z.number(),
  edge: z.number().min(0).max(5), // 0-5 for 6 hex edges
});

export const BoardStateSchema = z.object({
  hexes: z.array(HexSchema).length(19), // Catan always has 19 hexes
  ports: z.array(PortSchema).length(9),  // Catan always has 9 ports
});

export type TerrainType = z.infer<typeof TerrainTypeSchema>;
export type PortType = z.infer<typeof PortTypeSchema>;
export type Hex = z.infer<typeof HexSchema>;
export type Port = z.infer<typeof PortSchema>;
export type BoardState = z.infer<typeof BoardStateSchema>;
