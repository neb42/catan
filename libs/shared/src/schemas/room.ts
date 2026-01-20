import { z } from 'zod';

import { PlayerSchema } from './player';

export const RoomIdSchema = z
  .string()
  .length(6)
  .regex(/^[0-9A-Z]{6}$/);

export const RoomSchema = z.object({
  id: RoomIdSchema,
  players: z.array(PlayerSchema).min(1).max(4),
  createdAt: z.date(),
});

export type Room = z.infer<typeof RoomSchema>;
export type RoomId = z.infer<typeof RoomIdSchema>;
