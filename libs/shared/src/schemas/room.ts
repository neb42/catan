import { z } from 'zod';
import { MAX_PLAYERS, ROOM_ID_LENGTH } from '../constants';
import { PlayerSchema } from './player';

const roomIdPattern = /^[0-9A-Z]{6}$/;

export const RoomSchema = z.object({
  id: z.string().length(ROOM_ID_LENGTH).regex(roomIdPattern),
  players: z.array(PlayerSchema).min(1).max(MAX_PLAYERS),
  createdAt: z.date(),
});

export type Room = z.infer<typeof RoomSchema>;
