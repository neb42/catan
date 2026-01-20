import { z } from 'zod';

import { MAX_PLAYERS, ROOM_ID_ALPHABET, ROOM_ID_LENGTH } from '../constants';
import { PlayerSchema } from './player';

const ROOM_ID_REGEX = new RegExp(`^[${ROOM_ID_ALPHABET}]{${ROOM_ID_LENGTH}}$`);

export const RoomIdSchema = z
  .string()
  .length(ROOM_ID_LENGTH)
  .regex(ROOM_ID_REGEX);

export const RoomSchema = z.object({
  id: RoomIdSchema,
  players: z.array(PlayerSchema).min(1).max(MAX_PLAYERS),
  createdAt: z.date(),
});

export type Room = z.infer<typeof RoomSchema>;
export type RoomId = z.infer<typeof RoomIdSchema>;
