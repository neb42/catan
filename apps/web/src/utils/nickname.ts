const ADJECTIVES = [
  'Swift',
  'Brave',
  'Clever',
  'Bold',
  'Mighty',
  'Noble',
  'Wise',
  'Lucky',
  'Quick',
  'Strong',
  'Silent',
  'Fierce',
  'Eager',
  'Keen',
  'Bright',
  'Steady',
];

const NOUNS = [
  'Settler',
  'Builder',
  'Trader',
  'Explorer',
  'Pioneer',
  'Merchant',
  'Voyager',
  'Navigator',
  'Adventurer',
  'Wanderer',
  'Pathfinder',
  'Scout',
  'Captain',
  'Founder',
  'Colonist',
  'Traveler',
];

/**
 * Generates a random nickname in the format "Adjective Noun"
 * Example: "Swift Settler", "Brave Builder"
 */
export function generateRandomNickname(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective} ${noun}`;
}

/**
 * Gets a nickname from localStorage or generates a new random one.
 * Saves the generated nickname to localStorage for future use.
 */
export function getNickname(): string {
  const stored = localStorage.getItem('catan_nickname');
  if (stored && stored.trim().length >= 2) {
    return stored.trim();
  }

  const generated = generateRandomNickname();
  localStorage.setItem('catan_nickname', generated);
  return generated;
}
