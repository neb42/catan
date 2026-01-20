import { webcrypto } from 'node:crypto';

import { ROOM_ID_ALPHABET, ROOM_ID_LENGTH } from '@catan/shared';

export function generateRoomId(): string {
  const bytes = new Uint8Array(ROOM_ID_LENGTH);
  webcrypto.getRandomValues(bytes);

  let id = '';

  for (let i = 0; i < ROOM_ID_LENGTH; i += 1) {
    id += ROOM_ID_ALPHABET[bytes[i] % ROOM_ID_ALPHABET.length];
  }

  return id;
}
