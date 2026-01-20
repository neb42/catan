import { z } from 'zod';

export const PlayerIdSchema = z.string();
export const NicknameSchema = z.string().trim().min(2).max(30);
const ColorSchema = z.enum(['red', 'blue', 'white', 'orange']);

export const PlayerSchema = z.object({
  id: PlayerIdSchema,
  nickname: NicknameSchema,
  color: ColorSchema,
  ready: z.boolean(),
});

export type Player = z.infer<typeof PlayerSchema>;
export type PlayerId = z.infer<typeof PlayerIdSchema>;
export type Nickname = z.infer<typeof NicknameSchema>;
