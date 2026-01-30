import {
  DevelopmentCardType,
  OwnedDevCard,
  PlayerResources,
  DEV_DECK_COMPOSITION,
  DEV_CARD_COST,
} from '@catan/shared';

/**
 * Create a shuffled deck of development cards.
 * Uses Fisher-Yates algorithm for uniform distribution.
 */
export function createShuffledDeck(): DevelopmentCardType[] {
  const deck: DevelopmentCardType[] = [];

  // Build deck from composition
  for (const [type, count] of Object.entries(DEV_DECK_COMPOSITION)) {
    for (let i = 0; i < count; i++) {
      deck.push(type as DevelopmentCardType);
    }
  }

  // Fisher-Yates shuffle (CRITICAL: correct bounds)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 0 to i inclusive
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

/**
 * Check if player can buy a development card.
 * Validates deck availability and resource requirements.
 */
export function canBuyDevCard(
  playerId: string,
  playerResources: PlayerResources,
  deckRemaining: number,
): { canBuy: boolean; reason?: string } {
  // Check if deck has cards remaining
  if (deckRemaining <= 0) {
    return { canBuy: false, reason: 'No development cards remaining in deck' };
  }

  // Check resource requirements (1 ore, 1 sheep, 1 wheat)
  if (playerResources.ore < DEV_CARD_COST.ore) {
    return { canBuy: false, reason: 'Not enough ore' };
  }
  if (playerResources.sheep < DEV_CARD_COST.sheep) {
    return { canBuy: false, reason: 'Not enough sheep' };
  }
  if (playerResources.wheat < DEV_CARD_COST.wheat) {
    return { canBuy: false, reason: 'Not enough wheat' };
  }

  return { canBuy: true };
}

/**
 * Check if player can play a development card.
 * Validates same-turn restriction and one-card-per-turn rule.
 */
export function canPlayDevCard(
  card: OwnedDevCard,
  currentTurn: number,
  hasPlayedThisTurn: boolean,
): { canPlay: boolean; reason?: string } {
  // DEV-03: Cannot play card purchased this turn
  if (card.purchasedOnTurn === currentTurn) {
    return {
      canPlay: false,
      reason:
        'Cannot play a development card on the same turn it was purchased',
    };
  }

  // VP cards can always be "played" (they're auto-counted for victory)
  if (card.type === 'victory_point') {
    return { canPlay: true };
  }

  // DEV-04: Only one non-VP development card per turn
  if (hasPlayedThisTurn) {
    return {
      canPlay: false,
      reason: 'Already played a development card this turn',
    };
  }

  return { canPlay: true };
}

/**
 * Draw a card from the deck using index pointer.
 * Returns null if deck is exhausted.
 */
export function drawCard(
  deck: DevelopmentCardType[],
  deckIndex: number,
): { card: DevelopmentCardType | null; newIndex: number } {
  if (deckIndex >= deck.length) {
    return { card: null, newIndex: deckIndex };
  }

  return {
    card: deck[deckIndex],
    newIndex: deckIndex + 1,
  };
}
