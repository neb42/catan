# Phase 8: Development Cards - Research

**Researched:** 2026-01-30
**Domain:** Card game mechanics, hidden state, deck shuffling, multi-phase card effects
**Confidence:** HIGH

## Summary

This phase implements the development card system for Catan: a 25-card deck with 5 types (Knight, VP, Road Building, Year of Plenty, Monopoly), purchase mechanics, play restrictions, and card-specific effects. The existing codebase provides strong patterns to follow, particularly the robber implementation (Phase 7) which directly informs Knight card flow.

The standard approach follows the existing architecture: extend shared Zod schemas for card types, add card-related state to GameManager and gameStore, create new WebSocket messages for card actions, and build UI components using established Mantine/Motion patterns. Development cards introduce "hidden information" (VP cards) requiring server-side secret state handling - only card counts should be sent to opponents, not card types.

**Primary recommendation:** Leverage existing patterns extensively - reuse robber UI for Knight, follow BuildControls pattern for Buy Dev Card, follow DiscardModal pattern for resource picker modals, and extend the established message/handler architecture for all card actions.

## Standard Stack

No new libraries needed. The existing stack fully supports this phase:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | ^5.9.3 | Type safety | Already in use |
| Zod | ^4.3.5 | Schema validation | Pattern established for messages |
| Zustand | ^5.0.10 | State management | gameStore already structured for slices |
| Mantine | ^8.3.12 | UI components | Modal, Button, etc. already used |
| Motion | ^12.28.1 | Animations | Card reveal animations, already used in ResourceHand |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ws | ^8.19.0 | WebSocket | Already used for all real-time sync |

**Installation:** No new packages required.

## Architecture Patterns

### Recommended Project Structure

Extend existing structure rather than create new patterns:

```
libs/shared/src/
  schemas/
    game.ts              # Add DevelopmentCard, DevCardType schemas
  constants/
    index.ts             # Add DEV_CARD_COST, DECK_COMPOSITION

apps/api/src/game/
  GameManager.ts         # Add dev card methods: buyDevCard, playKnight, etc.
  dev-card-logic.ts      # NEW: Pure functions for deck shuffle, validation

apps/web/src/
  stores/gameStore.ts    # Add DevCardSlice
  hooks/
    useDevCardState.ts   # NEW: Hooks for dev card UI state
  components/
    DevCard/
      DevCardHand.tsx    # NEW: Integrated into ResourceHand area
      DevCardButton.tsx  # NEW: Individual card with grayed-out state
      BuyDevCardButton.tsx  # NEW: In BuildControls area
    CardPlay/
      ResourcePickerModal.tsx  # NEW: For Year of Plenty, Monopoly
      PlayConfirmModal.tsx     # NEW: Confirmation before playing
      RoadBuildingMode.tsx     # NEW: Sequential road placement overlay
```

### Pattern 1: Deck State Management (Server-Side Only)

**What:** Keep the full deck state on server, send only card counts to clients
**When to use:** Any hidden information in multiplayer games
**Example:**
```typescript
// In GameManager - server only sees full deck
interface DevCardDeck {
  cards: DevelopmentCardType[];  // Shuffled array
  drawn: number;  // Index of next card to draw
}

// What gets sent to clients
interface PlayerDevCardState {
  ownCards: DevelopmentCardType[];  // Full info for owner
  opponentCardCounts: Record<string, number>;  // Just counts for others
}
```

### Pattern 2: Turn-Based Restrictions via State Tracking

**What:** Track which turn a card was purchased to enforce "cannot play same turn" rule
**When to use:** Any card with delayed activation
**Example:**
```typescript
interface OwnedDevCard {
  type: DevelopmentCardType;
  purchasedOnTurn: number;  // Track when purchased
}

function canPlayCard(card: OwnedDevCard, currentTurn: number, playedThisTurn: boolean): boolean {
  if (card.purchasedOnTurn === currentTurn) return false;  // DEV-03
  if (card.type !== 'victory_point' && playedThisTurn) return false;  // DEV-04
  return true;
}
```

### Pattern 3: Multi-Phase Card Effects (State Machine)

**What:** Cards like Road Building require multiple sub-actions before completion
**When to use:** Any card effect that spans multiple user interactions
**Example:**
```typescript
// Extend robber phase pattern
type DevCardPhase =
  | 'none'
  | 'confirming'      // Pre-play confirmation modal
  | 'road_building'   // Placing roads (0-2 placed)
  | 'year_of_plenty'  // Selecting resources
  | 'monopoly'        // Selecting resource type
  | 'knight_robber';  // Reuse robber flow

interface DevCardPlayState {
  phase: DevCardPhase;
  cardBeingPlayed: DevelopmentCardType | null;
  roadsPlacedThisCard: number;  // For Road Building
  playerId: string | null;
}
```

### Pattern 4: Reusing Robber UI for Knight

**What:** Knight triggers same flow as rolling 7, minus discards
**When to use:** When card effect matches existing game flow
**Example:**
```typescript
// In GameManager
playKnight(playerId: string): KnightResult {
  // Validate can play (not same turn, hasn't played card)
  // Increment knight count for Largest Army
  // Set robberPhase to 'moving' (skip 'discarding')
  // Set robberMover to playerId
  // Return success - client enters robber placement mode
}

// UI reuses RobberPlacement and StealModal components
// Only difference: entry point (Knight card click vs dice roll 7)
```

### Anti-Patterns to Avoid

- **Storing deck client-side:** Never trust client with hidden information. Deck must be server-side only.
- **Separate hand UI for dev cards:** User decided integrated row. Don't create separate panel.
- **Playing cards during opponent turns:** Validate turn ownership for all card plays.
- **Mutable deck array:** Use index pointer instead of splice/shift to avoid off-by-one errors.
- **Synchronous road placement for Road Building:** Must be async sequential mode, not both at once.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Deck shuffling | Custom random logic | Fisher-Yates algorithm | Only algorithm guaranteed uniform distribution |
| Resource picker UI | Custom form | Existing DiscardModal pattern | Already handles resource selection with +/- buttons |
| Robber placement UI | New overlay | Existing RobberPlacement component | Decision explicitly says reuse robber UI |
| Steal from player | New modal | Existing StealModal component | Same flow as robber steal |
| Card reveal animation | Custom animation | Motion library with existing card patterns | ResourceHand already has card animations |
| Modal blocking behavior | Custom overlay | Mantine Modal with closeOnClickOutside={false} | Already used in DiscardModal/StealModal |

**Key insight:** Phase 7 (Robber) and Phase 6 (Trading) established all the UI patterns needed. Development cards should compose these existing components, not recreate them.

## Common Pitfalls

### Pitfall 1: Off-By-One Shuffle Errors

**What goes wrong:** Using wrong range for random index selection produces biased shuffle
**Why it happens:** Fisher-Yates requires `j = randomInt(0, i)` inclusive, easy to get bounds wrong
**How to avoid:** Use verified implementation:
```typescript
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));  // 0 to i inclusive
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```
**Warning signs:** Cards appearing in predictable patterns during testing

### Pitfall 2: Victory Point Cards Leaking to Opponents

**What goes wrong:** Sending card types to all players instead of just owner
**Why it happens:** Reusing same serialization for owner and opponents
**How to avoid:** Create separate view functions:
```typescript
function getPlayerView(playerId: string, state: GameState): ClientGameState {
  // Own cards: full details
  // Other players: only counts
  return {
    myDevCards: state.devCards[playerId],
    opponentDevCardCounts: Object.fromEntries(
      Object.entries(state.devCards)
        .filter(([id]) => id !== playerId)
        .map(([id, cards]) => [id, cards.length])
    )
  };
}
```
**Warning signs:** Opponent VP cards visible in network inspector

### Pitfall 3: Knight Count Not Persisted for Largest Army

**What goes wrong:** Tracking played knights in local state that doesn't sync
**Why it happens:** Knight count needed for UI display (DEV-06) and future Largest Army
**How to avoid:** Add `knightsPlayed: Record<string, number>` to GameState in shared schema, broadcast on every knight play
**Warning signs:** Knight counts don't match across clients

### Pitfall 4: Road Building Edge Case - Running Out of Roads

**What goes wrong:** Player has <2 roads remaining but tries Road Building
**Why it happens:** Not checking piece limits before/during card play
**How to avoid:** Context decision: "Place what you can" - if 1 road left, place 1 and consume card
```typescript
function getRoadBuildingLimit(playerId: string): number {
  const remaining = MAX_PIECES.roads - countPlayerRoads(playerId);
  return Math.min(2, remaining);
}
```
**Warning signs:** Card consumed without placing roads, or error when player has 1 road

### Pitfall 5: Year of Plenty Bank Depletion

**What goes wrong:** Player selects resource with 0 in bank
**Why it happens:** Not checking bank availability
**How to avoid:** Context decision: Gray out resources with 0 in bank. Send bank counts with year_of_plenty_required message
**Warning signs:** Resources created from empty bank

### Pitfall 6: Playing Dev Card Before Rolling

**What goes wrong:** Catan rules allow Knight before roll, but other cards require rolled first
**Why it happens:** Applying same restriction to all cards
**How to avoid:** Knight follows standard Catan rules - can be played before OR after rolling. Other dev cards require main phase (after roll).
```typescript
function canPlayDevCard(cardType: DevCardType, turnPhase: TurnPhase): boolean {
  if (cardType === 'knight') return true;  // Any time during your turn
  return turnPhase === 'main';  // Others require having rolled
}
```
**Warning signs:** Unable to play Knight when logically should be allowed

## Code Examples

### Development Card Types (Zod Schema)

```typescript
// Source: Extend libs/shared/src/schemas/game.ts
export const DevelopmentCardTypeSchema = z.enum([
  'knight',
  'victory_point',
  'road_building',
  'year_of_plenty',
  'monopoly',
]);
export type DevelopmentCardType = z.infer<typeof DevelopmentCardTypeSchema>;

export const OwnedDevCardSchema = z.object({
  type: DevelopmentCardTypeSchema,
  purchasedOnTurn: z.number(),
  id: z.string(),  // Unique ID for tracking
});
export type OwnedDevCard = z.infer<typeof OwnedDevCardSchema>;
```

### Deck Composition and Cost Constants

```typescript
// Source: Extend libs/shared/src/constants/index.ts
export const DEV_CARD_COST = { ore: 1, sheep: 1, wheat: 1 } as const;

export const DEV_DECK_COMPOSITION: Record<DevelopmentCardType, number> = {
  knight: 14,
  victory_point: 5,
  road_building: 2,
  year_of_plenty: 2,
  monopoly: 2,
} as const;

export const DEV_DECK_SIZE = 25;
```

### Fisher-Yates Deck Initialization

```typescript
// Source: apps/api/src/game/dev-card-logic.ts
import { DevelopmentCardType, DEV_DECK_COMPOSITION } from '@catan/shared';

export function createShuffledDeck(): DevelopmentCardType[] {
  const deck: DevelopmentCardType[] = [];

  for (const [type, count] of Object.entries(DEV_DECK_COMPOSITION)) {
    for (let i = 0; i < count; i++) {
      deck.push(type as DevelopmentCardType);
    }
  }

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}
```

### WebSocket Messages for Dev Cards

```typescript
// Source: Extend libs/shared/src/schemas/messages.ts

// Client -> Server
export const BuyDevCardMessageSchema = z.object({
  type: z.literal('buy_dev_card'),
});

export const PlayDevCardMessageSchema = z.object({
  type: z.literal('play_dev_card'),
  cardId: z.string(),
});

export const YearOfPlentySelectMessageSchema = z.object({
  type: z.literal('year_of_plenty_select'),
  resources: z.array(ResourceTypeSchema).length(2),  // Exactly 2
});

export const MonopolySelectMessageSchema = z.object({
  type: z.literal('monopoly_select'),
  resourceType: ResourceTypeSchema,
});

// Server -> Client
export const DevCardPurchasedMessageSchema = z.object({
  type: z.literal('dev_card_purchased'),
  playerId: z.string(),
  cardType: DevelopmentCardTypeSchema,  // Only sent to purchaser
  deckRemaining: z.number(),
});

export const DevCardPlayedMessageSchema = z.object({
  type: z.literal('dev_card_played'),
  playerId: z.string(),
  cardType: DevelopmentCardTypeSchema,
});

export const MonopolyExecutedMessageSchema = z.object({
  type: z.literal('monopoly_executed'),
  playerId: z.string(),
  resourceType: ResourceTypeSchema,
  totalCollected: z.number(),
});
```

### Zustand Dev Card Slice

```typescript
// Source: Extend apps/web/src/stores/gameStore.ts
interface DevCardSlice {
  // My cards (full info)
  myDevCards: OwnedDevCard[];

  // Opponent counts (hidden info)
  opponentDevCardCounts: Record<string, number>;

  // Deck state
  deckRemaining: number;

  // Play state
  devCardPlayPhase: 'none' | 'confirming' | 'road_building' | 'year_of_plenty' | 'monopoly' | 'knight_robber';
  cardBeingPlayed: OwnedDevCard | null;
  roadsPlacedThisCard: number;

  // Turn tracking
  hasPlayedDevCardThisTurn: boolean;

  // Knight tracking for Largest Army
  knightsPlayed: Record<string, number>;
}

// Selector hooks
export const useMyDevCards = () => useGameStore((s) => s.myDevCards);
export const useCanBuyDevCard = () => useGameStore((s) => {
  const myId = s.myPlayerId;
  if (!myId) return false;
  const resources = s.playerResources[myId];
  if (!resources) return false;
  if (s.deckRemaining === 0) return false;
  return resources.ore >= 1 && resources.sheep >= 1 && resources.wheat >= 1;
});
```

### Resource Picker Modal (Reusable Pattern)

```typescript
// Source: apps/web/src/components/CardPlay/ResourcePickerModal.tsx
// Follow DiscardModal pattern with modifications

interface ResourcePickerModalProps {
  title: string;
  count: number;  // How many to select (1 for Monopoly, 2 for Year of Plenty)
  allowDuplicates: boolean;  // Year of Plenty allows same resource twice
  bankCounts?: Record<ResourceType, number>;  // Optional bank limit
  onSubmit: (resources: ResourceType[]) => void;
}

export function ResourcePickerModal({
  title,
  count,
  allowDuplicates,
  bankCounts,
  onSubmit
}: ResourcePickerModalProps) {
  const [selected, setSelected] = useState<ResourceType[]>([]);

  const canSelect = (resource: ResourceType) => {
    if (selected.length >= count) return false;
    if (!allowDuplicates && selected.includes(resource)) return false;
    if (bankCounts && bankCounts[resource] === 0) return false;
    if (bankCounts && !allowDuplicates) return true;
    // For Year of Plenty with bank check and duplicates
    if (bankCounts) {
      const alreadySelected = selected.filter(r => r === resource).length;
      return alreadySelected < bankCounts[resource];
    }
    return true;
  };

  // ... Mantine Modal with resource buttons, submit when selected.length === count
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side deck shuffle | Server-side only with hidden state | Always for multiplayer | Prevents cheating |
| Modal for each card type | Reusable ResourcePickerModal | Pattern standardization | Less code duplication |
| Separate dev card panel | Integrated hand view | User decision (Phase 8) | Better UX |

**Deprecated/outdated:**
- Client-side deck state: Security concern, never appropriate for hidden information

## Open Questions

1. **Bank tracking for Year of Plenty**
   - What we know: Context says gray out resources with 0 in bank
   - What's unclear: Does current GameState track bank totals? Need to verify.
   - Recommendation: Check if resource bank tracking exists; if not, add simple calculation (starting totals - distributed)

2. **Knight timing relative to dice roll**
   - What we know: Standard Catan rules allow Knight before OR after rolling
   - What's unclear: Context says "Claude follows standard Catan rules" - confirm this interpretation
   - Recommendation: Implement Knight as playable during roll phase or main phase

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis (GameManager.ts, gameStore.ts, messages.ts)
- User decisions from CONTEXT.md (08-CONTEXT.md)

### Secondary (MEDIUM confidence)
- [Fisher-Yates Shuffle - Wikipedia](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle) - Algorithm verification
- [Fisher-Yates Shuffle TypeScript](https://github.com/lemmski/fisher-yates-shuffle) - Implementation reference
- [boardgame.io Secret State](https://github.com/boardgameio/boardgame.io/blob/main/docs/documentation/secret-state.md) - Hidden information patterns

### Tertiary (LOW confidence)
- [Catan Wiki - Development Cards](https://catan.fandom.com/wiki/Development_card) - Rule verification
- [Various GitHub Catan implementations](https://github.com/ShayGali/catan) - Pattern reference

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries, extending existing patterns
- Architecture: HIGH - Clear patterns from Phase 7 (Robber) and existing code
- Pitfalls: HIGH - Based on verified algorithm requirements and codebase analysis

**Research date:** 2026-01-30
**Valid until:** 2026-02-28 (30 days - stable patterns)
