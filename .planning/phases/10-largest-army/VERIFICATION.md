---
phase: 10-largest-army
verification: complete
verified: 2026-02-02
result: PASS
---

# Phase 10 Verification: Largest Army

## Phase Goal

Track largest army and award bonus points

## Requirements Verification

### SCORE-04: Game calculates Largest Army (minimum 3 knights played)

**Status:** ✅ PASS

**Evidence:**

- `apps/api/src/game/largest-army-logic.ts` lines 31-46:

  ```typescript
  // No one qualifies (< 3 knights)
  if (maxKnights < 3) {
    if (currentState.holderId) {
      return {
        newState: { holderId: null, knights: 0 },
        knightCounts,
        transferred: true,
        fromPlayerId: currentState.holderId,
      };
    }
    return {
      newState: { holderId: null, knights: 0 },
      knightCounts,
      transferred: false,
    };
  }
  ```

- Test coverage in `largest-army-logic.spec.ts`:
  - `"returns no holder when no player has 3 knights"` - knightCounts { p1: 2, p2: 1, p3: 0 } returns null holder
  - `"awards to first player reaching 3 knights"` - knightCounts { p1: 3, p2: 2, p3: 1 } awards to p1
  - `"awards to player exactly at 3 knights when others below"` - confirms 3-knight threshold

### SCORE-05: Game awards Largest Army card (2 VP) to player with most knights played

**Status:** ✅ PASS

**Evidence:**

- `apps/api/src/game/largest-army-logic.ts` lines 79-102:

  ```typescript
  // Single player has max
  const winnerId = playersAtMax[0];
  // ...
  // Award to winner
  if (winnerId !== currentState.holderId) {
    return {
      newState: { holderId: winnerId, knights: maxKnights },
      knightCounts,
      transferred: true,
      fromPlayerId: currentState.holderId ?? undefined,
      toPlayerId: winnerId,
    };
  }
  ```

- GameManager integration (`GameManager.ts` lines 1386-1407):
  - Knight count incremented on each `playKnight()` call
  - `updateLargestArmy()` called after increment
  - `largestArmyResult` returned for WebSocket broadcasting

- UI display (`GamePlayerList.tsx` lines 196-213):

  ```tsx
  {
    hasLargestArmy && (
      <Tooltip label="Largest Army (2 VP)" position="top">
        <Badge size="sm" color="red" variant="filled">
          🛡️ Largest
        </Badge>
      </Tooltip>
    );
  }
  ```

- GameState schema (`libs/shared/src/schemas/game.ts` lines 114-117):
  ```typescript
  largestArmyHolderId: z.string().nullable(),
  largestArmyKnights: z.number(),
  playerKnightCounts: z.record(z.string(), z.number()),
  ```

### SCORE-06: Game transfers Largest Army card when another player surpasses count (ties favor current holder)

**Status:** ✅ PASS

**Evidence:**

- Transfer logic (`largest-army-logic.ts` lines 82-91):

  ```typescript
  // New player must exceed (not match) current holder
  if (currentState.holderId && currentState.holderId !== winnerId) {
    if (maxKnights <= currentState.knights) {
      // Current holder retains
      return {
        newState: currentState,
        knightCounts,
        transferred: false,
      };
    }
  }
  ```

- Tie-handling (`largest-army-logic.ts` lines 54-62):

  ```typescript
  // Multiple players tied at max
  if (playersAtMax.length > 1) {
    // Current holder keeps if still at max
    if (currentState.holderId && playersAtMax.includes(currentState.holderId)) {
      return {
        newState: { holderId: currentState.holderId, knights: maxKnights },
        knightCounts,
        transferred: false,
      };
    }
  ```

- Test coverage:
  - `"current holder retains when tied with challenger"` - { p1: 4, p2: 4 } with p1 holder → p1 keeps
  - `"current holder retains when matched by challenger (not exceeded)"` - { p1: 3, p2: 3 } → p1 keeps
  - `"transfers when challenger exceeds current holder"` - { p1: 4, p2: 5 } → transfers to p2
  - `"no one gets award when multiple players tie at 3+ and no current holder"` - tie with no holder → no award

- WebSocket broadcast (`websocket.ts` lines 100-116):
  ```typescript
  function broadcastLargestArmyIfTransferred(
    roomManager: RoomManager,
    roomId: string,
    result: LargestArmyResult | undefined,
  ): void {
    if (!result?.transferred) return;
    roomManager.broadcastToRoom(roomId, {
      type: 'largest_army_updated',
      holderId: result.newState.holderId,
      holderKnights: result.newState.knights,
      playerKnightCounts: result.knightCounts,
      transferredFrom: result.fromPlayerId ?? null,
    });
  }
  ```

## Success Criteria Verification

### 1. Largest army calculates correctly

| Criterion                 | Status | Evidence                                        |
| ------------------------- | ------ | ----------------------------------------------- |
| Award at 3+ knights       | ✅     | Tests verify 3-knight threshold, no award below |
| Transfers when surpassed  | ✅     | Must EXCEED (not match) current holder          |
| Ties favor current holder | ✅     | Multiple tied players don't take from holder    |

## Test Results

```
 ✓ apps/api/src/game/largest-army-logic.spec.ts (14 tests)
   ✓ minimum threshold (3 tests)
     ✓ returns no holder when no player has 3 knights
     ✓ awards to first player reaching 3 knights
     ✓ awards to player exactly at 3 knights when others below
   ✓ tie-breaking (4 tests)
     ✓ current holder retains when tied with challenger
     ✓ current holder retains when matched by challenger (not exceeded)
     ✓ no one gets award when multiple players tie at 3+ and no current holder
     ✓ holder loses to tied players when holder drops below
   ✓ award transfer (3 tests)
     ✓ transfers when challenger exceeds current holder
     ✓ holder retains when challengers below holder count
     ✓ holder retains and updates count when increasing own knights
   ✓ edge cases (4 tests)
     ✓ handles empty knight counts
     ✓ handles single player with 3+ knights
     ✓ removes holder when they drop below minimum (3)
     ✓ returns knight counts for all players

Test Files  1 passed (1)
Tests       14 passed (14)
```

## Implementation Artifacts

| Artifact                                       | Purpose                                      |
| ---------------------------------------------- | -------------------------------------------- |
| `apps/api/src/game/largest-army-logic.ts`      | Pure calculation function                    |
| `apps/api/src/game/largest-army-logic.spec.ts` | 14 TDD tests                                 |
| `libs/shared/src/schemas/game.ts`              | GameState schema fields                      |
| `libs/shared/src/schemas/messages.ts`          | `LargestArmyUpdatedMessageSchema`            |
| `apps/api/src/game/GameManager.ts`             | `updateLargestArmy()` integration            |
| `apps/api/src/handlers/websocket.ts`           | `broadcastLargestArmyIfTransferred()`        |
| `apps/web/src/stores/gameStore.ts`             | `LargestArmySlice`, `useLargestArmyHolder()` |
| `apps/web/src/components/Lobby.tsx`            | WebSocket handler + toast notifications      |
| `apps/web/src/components/GamePlayerList.tsx`   | Largest Army badge display                   |

## Human Verification (Plan 10-03)

**Status:** ✅ Approved

Verified during human testing:

- Knight count badge updates after each knight play
- Largest Army badge appears at 3 knights with animation
- Toast notification shows on earn
- Badge transfers with animation when exceeded
- Visual consistency with Longest Road styling

## Summary

**Phase 10 Result: PASS**

All three requirements (SCORE-04, SCORE-05, SCORE-06) are fully implemented:

1. **Calculation** - Pure function with 3-knight minimum threshold
2. **Award** - Tracks holder in GameState, displays badge with 2 VP tooltip
3. **Transfer** - Must exceed (not match), ties favor holder, broadcasts via WebSocket

Note: The actual 2 VP contribution to victory points will be calculated in Phase 11 (Victory Points). Phase 10 provides the tracking and display infrastructure.
