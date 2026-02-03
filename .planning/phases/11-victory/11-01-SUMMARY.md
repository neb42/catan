---
phase: 11-victory
plan: 01
status: complete
completed: 2026-02-03
---

# Plan 11-01 Summary: VP Calculation Logic and Victory Message Schemas

## What Was Built

Created victory point calculation system using TDD approach, plus WebSocket message schemas for victory announcements.

## Deliverables

| Artifact                                  | Description                                                                      |
| ----------------------------------------- | -------------------------------------------------------------------------------- |
| `apps/api/src/game/victory-logic.ts`      | Pure functions `calculateVictoryPoints()` and `checkForVictory()`                |
| `apps/api/src/game/victory-logic.spec.ts` | 19 TDD tests covering all VP calculation edge cases                              |
| `libs/shared/src/schemas/game.ts`         | Added `VPBreakdownSchema`, `GameLifecyclePhaseSchema`, gamePhase/winnerId fields |
| `libs/shared/src/schemas/messages.ts`     | Added `VictoryMessageSchema` to WebSocket message union                          |

## Key Implementation Details

### VP Calculation Algorithm

- Settlements: 1 VP each (non-city)
- Cities: 2 VP each
- Longest Road: 2 VP (if holder)
- Largest Army: 2 VP (if holder)
- Victory Point dev cards: 1 VP each
- Victory threshold: 10 VP

### VPBreakdown Interface

```typescript
{
  settlements: number; // Count of non-city settlements
  cities: number; // Count * 2
  longestRoad: number; // 2 if holder, 0 otherwise
  largestArmy: number; // 2 if holder, 0 otherwise
  victoryPointCards: number; // Count of VP dev cards
  total: number;
}
```

### Test Coverage (19 tests)

**calculateVictoryPoints (13 tests):**

- Empty player = 0 VP
- Multiple settlements = correct VP
- Single city = 2 VP
- Mixed settlements and cities
- Longest road holder = +2 VP
- Largest army holder = +2 VP
- Both awards = +4 VP
- Victory point cards counted
- Full combination test

**checkForVictory (6 tests):**

- No winner when all below 10 VP
- Detects winner at exactly 10 VP
- Detects winner above 10 VP
- First player wins on tie at 10
- Returns VP breakdown for all players
- Reveals VP cards on victory

## Commits

| Task                             | Commit    | Files                                   |
| -------------------------------- | --------- | --------------------------------------- |
| Task 1: TDD tests + logic        | `0caeb89` | victory-logic.ts, victory-logic.spec.ts |
| Task 2: Message/GameState schema | `3951659` | game.ts, messages.ts                    |

## Decisions

| Decision                          | Rationale                                                      |
| --------------------------------- | -------------------------------------------------------------- |
| Named `GameLifecyclePhaseSchema`  | Distinguish from existing `GamePhaseSchema` (placement phases) |
| Follow longest-road-logic pattern | Consistent pure function approach with TDD                     |
| VP breakdown in VictoryResult     | Enables detailed end-game score display                        |
| revealedVPCards array             | VP cards are hidden until victory, need reveal on game end     |

## Verification

- All 19 TDD tests pass
- Shared library typechecks successfully
- API typechecks successfully
- Web typechecks successfully
