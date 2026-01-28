export const PLAYER_COLORS = ['red', 'blue', 'white', 'orange', 'green', 'yellow', 'purple', 'brown'] as const;
export const PLAYER_COLOR_HEX: Record<string, string> = {
  red: '#E53935',
  blue: '#1E88E5',
  white: '#F5F5F5',
  orange: '#FB8C00',
  green: '#43A047',
  yellow: '#FDD835',
  purple: '#8E24AA',
  brown: '#6D4C41',
};
export const MAX_PLAYERS = 8;
export const MIN_PLAYERS = 3;
export const GRACE_PERIOD_MS = 3 * 60 * 1000; // 3 minutes
export const ROOM_ID_LENGTH = 6;
export const ROOM_ID_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
