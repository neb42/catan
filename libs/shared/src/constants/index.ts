export const PLAYER_COLORS = [
  'red',
  'blue',
  'white',
  'orange',
  'green',
  'yellow',
  'purple',
  'brown',
] as const;
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
export const MAX_PLAYERS = 4;
export const MIN_PLAYERS = 2;
export const GRACE_PERIOD_MS = 3 * 60 * 1000; // 3 minutes
export const ROOM_ID_LENGTH = 6;
export const ROOM_ID_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Building costs for roads, settlements, and cities
export const BUILDING_COSTS = {
  road: { wood: 1, brick: 1 },
  settlement: { wood: 1, brick: 1, sheep: 1, wheat: 1 },
  city: { ore: 3, wheat: 2 },
} as const;

export type BuildingType = keyof typeof BUILDING_COSTS;

// Maximum pieces each player can have
export const MAX_PIECES = {
  roads: 15,
  settlements: 5,
  cities: 4,
} as const;

// Development card cost (1 ore, 1 sheep, 1 wheat)
export const DEV_CARD_COST = {
  ore: 1,
  sheep: 1,
  wheat: 1,
} as const;

// Development card deck composition (25 total cards - matches Catan rules)
export const DEV_DECK_COMPOSITION = {
  knight: 14,
  victory_point: 5,
  road_building: 2,
  year_of_plenty: 2,
  monopoly: 2,
} as const;

// Total number of development cards in deck
export const DEV_DECK_SIZE = 25;
