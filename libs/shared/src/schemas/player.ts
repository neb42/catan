import { z } from 'zod';

import { PLAYER_COLORS } from '../constants';

export const PlayerIdSchema = z.string();
export const NicknameSchema = z.string().trim().min(2).max(30);
const ColorSchema = z.enum(PLAYER_COLORS);

export const PlayerSchema = z.object({
  id: PlayerIdSchema,
  nickname: NicknameSchema,
  color: ColorSchema,
  ready: z.boolean(),
});

export type Player = z.infer<typeof PlayerSchema>;
export type PlayerId = z.infer<typeof PlayerIdSchema>;
export type Nickname = z.infer<typeof NicknameSchema>;
