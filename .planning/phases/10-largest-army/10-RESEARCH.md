# Phase 10: Largest Army - Research

**Researched:** 2026-02-02
**Domain:** Knight count tracking and special award card management (mirroring Longest Road)
**Confidence:** HIGH

## Summary

Largest Army implementation is significantly simpler than Longest Road (Phase 9) because it requires no graph traversal - only counting knights played per player. The existing codebase already tracks knight counts (`knightsPlayed` Map in GameManager, `knightsPlayed` in gameStore), so the implementation primarily involves:

1. Adding award management logic (parallel to `longest-road-logic.ts`)
2. Adding state fields to GameState schema (parallel to longestRoadHolderId/Length)
3. Triggering recalculation after knight plays
4. Adding UI display (badge, count, notifications) - following Longest Road patterns

The Phase 9 Longest Road implementation provides a proven template. Largest Army should mirror its patterns exactly for consistency: same state shape, same recalculation trigger points, same broadcast message structure, same UI component patterns.

**Primary recommendation:** Clone the Longest Road pattern exactly. Create `largest-army-logic.ts` with `recalculateLargestArmy()`, add parallel state fields, trigger after knight plays, and copy UI patterns from GamePlayerList.tsx.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Native TypeScript | - | Simple max comparison | No algorithm library needed for counting |
| Existing GameManager | - | Integration point | Already tracks knightsPlayed |
| Existing gameStore | - | Frontend state | Already has knightsPlayed in DevCardSlice |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @mantine/notifications | existing | Toast notifications | Award earned/transferred events |
| motion/react | existing | Badge animations | Animate award badge on transfer |
| vitest | existing | Unit tests | Test tie-breaking edge cases |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| New state slice | Extend DevCardSlice | Keep award state separate (LongestRoadSlice pattern) for clarity |
| Inline calculation | Separate logic file | Separate file matches Phase 9 pattern, easier testing |

**Installation:**
```bash
# No new dependencies needed
# Uses existing infrastructure from Phase 9
```

## Architecture Patterns

### Recommended File Structure
```
libs/shared/src/
  schemas/
    game.ts                    # ADD: largestArmyHolderId, largestArmyKnights, playerKnightCounts
    messages.ts                # ADD: LargestArmyUpdatedMessageSchema

apps/api/src/
  game/
    largest-army-logic.ts      # NEW: recalculateLargestArmy() - mirrors longest-road-logic.ts
    GameManager.ts             # MODIFY: call recalculateLargestArmy after playKnight
  handlers/
    websocket.ts               # MODIFY: broadcast largest_army_updated events

apps/web/src/
  stores/
    gameStore.ts               # ADD: LargestArmySlice (parallel to LongestRoadSlice)
  components/
    GamePlayerList.tsx         # MODIFY: add Largest Army badge, mirror Longest Road display
```

### Pattern 1: Award Management Logic (Mirror Longest Road)
**What:** Pure function that recalculates award holder based on knight counts
**When to use:** After any knight is played
**Example:**
```typescript
// Source: Existing longest-road-logic.ts pattern
interface LargestArmyState {
  holderId: string | null;
  knightCount: number;
}

interface LargestArmyResult {
  newState: LargestArmyState;
  playerKnightCounts: Record<string, number>;
  transferred: boolean;
  fromPlayerId?: string;
  toPlayerId?: string;
}

function recalculateLargestArmy(
  knightsPlayed: Record<string, number>,
  currentState: LargestArmyState,
): LargestArmyResult {
  // Find max knights
  const maxKnights = Math.max(...Object.values(knightsPlayed), 0);

  // No one qualifies (< 3)
  if (maxKnights < 3) {
    if (currentState.holderId) {
      return {
        newState: { holderId: null, knightCount: 0 },
        playerKnightCounts: knightsPlayed,
        transferred: true,
        fromPlayerId: currentState.holderId,
      };
    }
    return {
      newState: { holderId: null, knightCount: 0 },
      playerKnightCounts: knightsPlayed,
      transferred: false,
    };
  }

  // Find all players at max
  const playersAtMax = Object.entries(knightsPlayed)
    .filter(([_, count]) => count === maxKnights)
    .map(([id]) => id);

  // Multiple players tied at max
  if (playersAtMax.length > 1) {
    // Current holder keeps if still at max
    if (currentState.holderId && playersAtMax.includes(currentState.holderId)) {
      return {
        newState: { holderId: currentState.holderId, knightCount: maxKnights },
        playerKnightCounts: knightsPlayed,
        transferred: false,
      };
    }
    // Tie with no current holder at max - no one gets it
    // (This can't happen for Largest Army - if tie, someone must have just played a knight
    // and that person would surpass, not tie. But handle for completeness.)
    if (currentState.holderId) {
      return {
        newState: { holderId: null, knightCount: 0 },
        playerKnightCounts: knightsPlayed,
        transferred: true,
        fromPlayerId: currentState.holderId,
      };
    }
    return {
      newState: { holderId: null, knightCount: 0 },
      playerKnightCounts: knightsPlayed,
      transferred: false,
    };
  }

  // Single player has max
  const winnerId = playersAtMax[0];

  // New player must exceed (not match) current holder
  if (currentState.holderId && currentState.holderId !== winnerId) {
    if (maxKnights <= currentState.knightCount) {
      return {
        newState: currentState,
        playerKnightCounts: knightsPlayed,
        transferred: false,
      };
    }
  }

  // Award to winner
  if (winnerId !== currentState.holderId) {
    return {
      newState: { holderId: winnerId, knightCount: maxKnights },
      playerKnightCounts: knightsPlayed,
      transferred: true,
      fromPlayerId: currentState.holderId ?? undefined,
      toPlayerId: winnerId,
    };
  }

  return {
    newState: { holderId: winnerId, knightCount: maxKnights },
    playerKnightCounts: knightsPlayed,
    transferred: false,
  };
}
```

### Pattern 2: State Integration (GameState Schema)
**What:** Add Largest Army fields parallel to Longest Road fields
**When to use:** Extend GameStateSchema in game.ts
**Example:**
```typescript
// Source: Existing GameStateSchema pattern
export const GameStateSchema = z.object({
  // ... existing fields ...

  // Longest road tracking (existing)
  longestRoadHolderId: z.string().nullable(),
  longestRoadLength: z.number(),
  playerRoadLengths: z.record(z.string(), z.number()),

  // Largest army tracking (NEW - parallel structure)
  largestArmyHolderId: z.string().nullable(),
  largestArmyKnights: z.number(),
  playerKnightCounts: z.record(z.string(), z.number()),
});
```

### Pattern 3: WebSocket Message (Mirror Longest Road)
**What:** Broadcast message when award transfers
**When to use:** After recalculateLargestArmy returns transferred=true
**Example:**
```typescript
// Source: Existing LongestRoadUpdatedMessageSchema pattern
export const LargestArmyUpdatedMessageSchema = z.object({
  type: z.literal('largest_army_updated'),
  holderId: z.string().nullable(),
  holderKnights: z.number(),
  playerKnightCounts: z.record(z.string(), z.number()),
  transferredFrom: z.string().nullable(),
});
```

### Pattern 4: Frontend State (Zustand Slice)
**What:** Store state parallel to LongestRoadSlice
**When to use:** Add to gameStore.ts
**Example:**
```typescript
// Source: Existing LongestRoadSlice pattern
interface LargestArmySlice {
  largestArmyHolderId: string | null;
  largestArmyKnights: number;
  // Note: playerKnightCounts already exists as knightsPlayed in DevCardSlice
}

// Selector hooks (parallel to useLongestRoadHolder)
export const useLargestArmyHolder = () =>
  useGameStore((s) => s.largestArmyHolderId);
```

### Pattern 5: UI Display (Mirror Longest Road Badge)
**What:** Badge in player list showing Largest Army holder
**When to use:** Update GamePlayerList.tsx
**Example:**
```typescript
// Source: Existing Longest Road badge pattern in GamePlayerList.tsx
const hasLargestArmy = player.id === largestArmyHolderId;

// In player card JSX:
{hasLargestArmy && (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
  >
    <Tooltip label="Largest Army (2 VP)" position="top">
      <Badge size="sm" color="red" variant="filled">
        Shield Largest
      </Badge>
    </Tooltip>
  </motion.div>
)}
```

### Anti-Patterns to Avoid
- **Separate knight count display:** Knight counts already shown via the existing knights badge. Don't duplicate.
- **Complex transfer logic:** Keep it simple - just compare counts. No graph algorithms needed.
- **Different tie rules than Longest Road:** Use identical tie-breaking rules for consistency.
- **Separate notification component:** Use existing `showGameNotification()` helper.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Award transfer logic | Custom state machine | Clone longest-road-logic.ts pattern | Same problem, proven solution |
| Notification toasts | Custom toast system | @mantine/notifications + showGameNotification | Already integrated |
| Badge animations | Custom CSS animations | motion/react with existing pattern | Matches Longest Road badge |
| Knight count tracking | New tracking system | Existing knightsPlayed Map | Already implemented and working |

**Key insight:** This feature is almost entirely copying and adapting existing patterns. The only new code is the recalculateLargestArmy() function, which is a much simpler version of recalculateLongestRoad().

## Common Pitfalls

### Pitfall 1: Forgetting to Initialize State
**What goes wrong:** largestArmyHolderId is undefined, causing null reference errors
**Why it happens:** New fields added to GameState but not initialized in GameManager constructor
**How to avoid:** Initialize in GameManager constructor alongside longestRoad fields
**Warning signs:** "Cannot read property of undefined" errors on game start

### Pitfall 2: Wrong Minimum Threshold
**What goes wrong:** Award given with only 2 knights
**Why it happens:** Using 2 or 0 as minimum instead of 3
**How to avoid:** Use constant `MIN_KNIGHTS_FOR_ARMY = 3`, test edge case
**Warning signs:** Award appears too early in games

### Pitfall 3: Transfer Instead of Retain on Tie
**What goes wrong:** New player with equal knights takes award from current holder
**Why it happens:** Using `>=` instead of `>` in comparison
**How to avoid:** Copy exact tie logic from longest-road-logic.ts
**Warning signs:** Award bounces back and forth when counts are equal

### Pitfall 4: Not Triggering Recalculation
**What goes wrong:** Knight played but award not updated
**Why it happens:** Forgetting to call recalculateLargestArmy() in playKnight()
**How to avoid:** Add recalculation call in playKnight() after incrementing count
**Warning signs:** Players have 3+ knights but no one has award

### Pitfall 5: Missing WebSocket Broadcast
**What goes wrong:** Award transfers but other clients don't see update
**Why it happens:** Server updates state but doesn't broadcast
**How to avoid:** Add broadcastLargestArmyIfTransferred() helper (mirror longest road)
**Warning signs:** UI out of sync between players

### Pitfall 6: Double-Counting Knights
**What goes wrong:** Knight count increases by 2 instead of 1
**Why it happens:** Incrementing in both playKnight() and recalculate function
**How to avoid:** Only increment in playKnight(), recalculate reads existing counts
**Warning signs:** Knight counts don't match actual cards played

## Code Examples

### Complete Logic File
```typescript
// Source: Derived from longest-road-logic.ts
// File: apps/api/src/game/largest-army-logic.ts

export const MIN_KNIGHTS_FOR_ARMY = 3;

interface LargestArmyState {
  holderId: string | null;
  knightCount: number;
}

export interface LargestArmyResult {
  newState: LargestArmyState;
  playerKnightCounts: Record<string, number>;
  transferred: boolean;
  fromPlayerId?: string;
  toPlayerId?: string;
}

export function recalculateLargestArmy(
  knightsPlayed: Map<string, number> | Record<string, number>,
  currentState: LargestArmyState,
): LargestArmyResult {
  // Convert Map to Record if needed
  const playerKnightCounts: Record<string, number> =
    knightsPlayed instanceof Map
      ? Object.fromEntries(knightsPlayed)
      : { ...knightsPlayed };

  const counts = Object.values(playerKnightCounts);
  const maxKnights = counts.length > 0 ? Math.max(...counts) : 0;

  // No one qualifies
  if (maxKnights < MIN_KNIGHTS_FOR_ARMY) {
    if (currentState.holderId) {
      return {
        newState: { holderId: null, knightCount: 0 },
        playerKnightCounts,
        transferred: true,
        fromPlayerId: currentState.holderId,
      };
    }
    return {
      newState: { holderId: null, knightCount: 0 },
      playerKnightCounts,
      transferred: false,
    };
  }

  // Find players at max
  const playersAtMax = Object.entries(playerKnightCounts)
    .filter(([_, count]) => count === maxKnights)
    .map(([id]) => id);

  // Tie handling
  if (playersAtMax.length > 1) {
    if (currentState.holderId && playersAtMax.includes(currentState.holderId)) {
      return {
        newState: { holderId: currentState.holderId, knightCount: maxKnights },
        playerKnightCounts,
        transferred: false,
      };
    }
    if (currentState.holderId) {
      return {
        newState: { holderId: null, knightCount: 0 },
        playerKnightCounts,
        transferred: true,
        fromPlayerId: currentState.holderId,
      };
    }
    return {
      newState: { holderId: null, knightCount: 0 },
      playerKnightCounts,
      transferred: false,
    };
  }

  const winnerId = playersAtMax[0];

  // Must exceed, not match
  if (currentState.holderId && currentState.holderId !== winnerId) {
    if (maxKnights <= currentState.knightCount) {
      return {
        newState: currentState,
        playerKnightCounts,
        transferred: false,
      };
    }
  }

  // Award to winner
  if (winnerId !== currentState.holderId) {
    return {
      newState: { holderId: winnerId, knightCount: maxKnights },
      playerKnightCounts,
      transferred: true,
      fromPlayerId: currentState.holderId ?? undefined,
      toPlayerId: winnerId,
    };
  }

  return {
    newState: { holderId: winnerId, knightCount: maxKnights },
    playerKnightCounts,
    transferred: false,
  };
}
```

### GameManager Integration
```typescript
// Source: Existing playKnight() method pattern
// In GameManager.ts - modify playKnight() return and add call

playKnight(
  playerId: string,
  cardId: string,
): {
  success: boolean;
  error?: string;
  currentRobberHex?: string | null;
  largestArmyResult?: LargestArmyResult;  // ADD
} {
  // ... existing validation and execution ...

  // After incrementing knight count:
  const largestArmyResult = this.updateLargestArmy();

  return {
    success: true,
    currentRobberHex: this.gameState.robberHexId,
    largestArmyResult,  // ADD
  };
}

private updateLargestArmy(): LargestArmyResult {
  const currentState = {
    holderId: this.gameState.largestArmyHolderId,
    knightCount: this.gameState.largestArmyKnights,
  };

  const result = recalculateLargestArmy(
    Object.fromEntries(this.knightsPlayed),
    currentState,
  );

  // Update game state
  this.gameState.largestArmyHolderId = result.newState.holderId;
  this.gameState.largestArmyKnights = result.newState.knightCount;
  this.gameState.playerKnightCounts = result.playerKnightCounts;

  return result;
}
```

### WebSocket Broadcast Helper
```typescript
// Source: Existing broadcastLongestRoadIfTransferred pattern
// In websocket.ts

function broadcastLargestArmyIfTransferred(
  roomManager: RoomManager,
  roomId: string,
  result: LargestArmyResult | undefined,
): void {
  if (!result?.transferred) return;

  roomManager.broadcastToRoom(roomId, {
    type: 'largest_army_updated',
    holderId: result.newState.holderId,
    holderKnights: result.newState.knightCount,
    playerKnightCounts: result.playerKnightCounts,
    transferredFrom: result.fromPlayerId ?? null,
  });
}
```

### Notification Handling
```typescript
// Source: Existing notification pattern
// In frontend message handler

case 'largest_army_updated': {
  store.setLargestArmyState({
    holderId: msg.holderId,
    holderKnights: msg.holderKnights,
    playerKnightCounts: msg.playerKnightCounts,
  });

  // Get player name for notification
  const room = store.room;
  const holder = room?.players.find(p => p.id === msg.holderId);
  const holderName = holder?.nickname || 'Unknown';

  if (msg.holderId) {
    showGameNotification(
      `${holderName} earned Largest Army (${msg.holderKnights} knights)`,
      'success'
    );
  }
  break;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| N/A - first implementation | Clone Longest Road pattern | Phase 10 | Consistency, less new code |

**Deprecated/outdated:**
- None - this is new implementation following established patterns

## Open Questions

1. **Should knight count always be visible?**
   - What we know: CONTEXT.md says "always show count even for players with 0 knights"
   - What's unclear: Resolved - show always
   - Recommendation: Follow CONTEXT.md decision

2. **Icon choice for badge**
   - What we know: CONTEXT.md says "shield icon"
   - What's unclear: Exact emoji or icon component
   - Recommendation: Use shield emoji or @tabler/icons shield, defer to implementation

## Sources

### Primary (HIGH confidence)
- Existing codebase: `longest-road-logic.ts`, `GameManager.ts`, `GamePlayerList.tsx`
- Phase 9 research: `.planning/phases/09-longest-road/09-RESEARCH.md`
- Official Catan rules: Minimum 3 knights, current holder keeps on tie

### Secondary (MEDIUM confidence)
- CONTEXT.md decisions: UI placement, notification format, visibility rules

### Tertiary (LOW confidence)
- None - implementation is straightforward clone of existing patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing libraries and patterns
- Architecture: HIGH - Direct clone of Longest Road architecture
- Pitfalls: HIGH - Identified from Longest Road implementation and standard Catan rules

**Research date:** 2026-02-02
**Valid until:** Indefinite - Catan rules are stable; pattern is proven
