import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../stores/gameStore';
import { DEV_CARD_COST } from '@catan/shared';

/**
 * Check if current player can buy a dev card.
 * Validates turn, phase, resources (ore, sheep, wheat), and deck availability.
 */
export function useCanBuyDevCard(): { canBuy: boolean; reason?: string } {
  return useGameStore(
    useShallow((s) => {
      const myId = s.myPlayerId;
      if (!myId) return { canBuy: false, reason: 'Not in game' };

      // Must be our turn
      if (s.turnCurrentPlayerId !== myId) {
        return { canBuy: false, reason: 'Not your turn' };
      }

      // Must be in main phase
      if (s.turnPhase !== 'main') {
        return { canBuy: false, reason: 'Must roll dice first' };
      }

      // Check deck has cards
      if (s.deckRemaining === 0) {
        return { canBuy: false, reason: 'Deck is empty' };
      }

      // Check resources
      const resources = s.playerResources[myId];
      if (!resources) return { canBuy: false, reason: 'No resources' };

      if (resources.ore < DEV_CARD_COST.ore) {
        return { canBuy: false, reason: 'Need 1 ore' };
      }
      if (resources.sheep < DEV_CARD_COST.sheep) {
        return { canBuy: false, reason: 'Need 1 sheep' };
      }
      if (resources.wheat < DEV_CARD_COST.wheat) {
        return { canBuy: false, reason: 'Need 1 wheat' };
      }

      return { canBuy: true };
    }),
  );
}

/**
 * Get my dev cards.
 */
export function useMyDevCards() {
  return useGameStore((s) => s.myDevCards);
}

/**
 * Get deck remaining count.
 */
export function useDeckRemaining() {
  return useGameStore((s) => s.deckRemaining);
}

/**
 * Check if a specific card can be played.
 * Validates turn, phase, same-turn restriction, and one-per-turn rule.
 */
export function useCanPlayCard(cardId: string): {
  canPlay: boolean;
  reason?: string;
} {
  return useGameStore(
    useShallow((s) => {
      const myId = s.myPlayerId;
      if (!myId) return { canPlay: false, reason: 'Not in game' };

      // Find the card
      const card = s.myDevCards.find((c) => c.id === cardId);
      if (!card) return { canPlay: false, reason: 'Card not found' };

      // VP cards are never "played" - they're automatic
      if (card.type === 'victory_point') {
        return {
          canPlay: false,
          reason: 'Victory Point cards score automatically',
        };
      }

      // Must be our turn
      if (s.turnCurrentPlayerId !== myId) {
        return { canPlay: false, reason: 'Not your turn' };
      }

      // Knight can be played before or after rolling
      // Other cards require main phase
      if (card.type !== 'knight' && s.turnPhase !== 'main') {
        return { canPlay: false, reason: 'Must roll dice first' };
      }

      // Can't play card bought this turn
      const currentTurn = s.turnNumber;
      if (card.purchasedOnTurn === currentTurn) {
        return {
          canPlay: false,
          reason: 'Cannot play card purchased this turn',
        };
      }

      // Can only play one dev card per turn (except VP)
      if (s.hasPlayedDevCardThisTurn) {
        return {
          canPlay: false,
          reason: 'Already played a dev card this turn',
        };
      }

      return { canPlay: true };
    }),
  );
}

/**
 * Get knights played for a player.
 */
export function useKnightsPlayed(playerId: string) {
  return useGameStore((s) => s.knightsPlayed[playerId] || 0);
}

/**
 * Get dev card play phase.
 */
export function useDevCardPlayPhase() {
  return useGameStore((s) => s.devCardPlayPhase);
}

/**
 * Check if currently in a dev card play phase.
 */
export function useIsInDevCardPlayPhase() {
  return useGameStore(
    (s) => s.devCardPlayPhase !== null && s.devCardPlayPhase !== 'none',
  );
}

/**
 * Get the card currently being played.
 */
export function useCardBeingPlayed() {
  return useGameStore((s) => s.cardBeingPlayed);
}

/**
 * Get opponent dev card counts.
 */
export function useOpponentDevCardCounts() {
  return useGameStore((s) => s.opponentDevCardCounts);
}

/**
 * Get if player has played a dev card this turn.
 */
export function useHasPlayedDevCardThisTurn() {
  return useGameStore((s) => s.hasPlayedDevCardThisTurn);
}

/**
 * Get roads placed during current Road Building card.
 */
export function useRoadsPlacedThisCard() {
  return useGameStore((s) => s.roadsPlacedThisCard);
}
