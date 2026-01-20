import { z } from 'zod';
import { PLAYER_COLORS } from '../constants';

export const PlayerSchema = z.object({
  id: z.string(),
  nickname: z.string().trim().min(2).max(30),
  color: z.enum(PLAYER_COLORS),
  ready: z.boolean(),
});

export type Player = z.infer<typeof PlayerSchema>;
