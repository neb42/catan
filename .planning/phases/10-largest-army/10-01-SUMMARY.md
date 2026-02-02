---
phase: 10-largest-army
plan: 01
status: complete
completed: 2026-02-02
---

# Plan 10-01 Summary: Backend Logic (TDD) and GameState Schema

## What Was Built

Created the largest army calculation system using TDD approach, mirroring the longest road pattern.

## Deliverables

| Artifact                                       | Description                                                                    |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| `apps/api/src/game/largest-army-logic.ts`      | Pure function `recalculateLargestArmy()` with full edge case handling          |
| `apps/api/src/game/largest-army-logic.spec.ts` | 14 TDD tests covering all edge cases                                           |
| `libs/shared/src/schemas/game.ts`              | Added `largestArmyHolderId`, `largestArmyKnights`, `playerKnightCounts` fields |
| `apps/api/src/game/GameManager.ts`             | Added `updateLargestArmy()` method, integrated into `playKnight()`             |

## Key Implementation Details

### Largest Army Algorithm Rules

- Minimum 3 knights required to qualify
- Ties favor current holder (challenger must EXCEED, not match)
- Award transfers when surpassed
- If holder drops below 3 and no one else qualifies, no holder

### Test Coverage (14 tests)

- No holder when no one has 3+ knights
- Awards to first player reaching exactly 3 knights
- Current holder keeps on tie
- Transfers when challenger exceeds current holder
- Holder loses if they drop below minimum
- Does not transfer if challenger only matches
- Multiple tie scenarios

## Commits

| Task                            | Commit    | Files                                             |
| ------------------------------- | --------- | ------------------------------------------------- |
| Task 1: TDD tests + logic       | `e1a09af` | largest-army-logic.ts, largest-army-logic.spec.ts |
| Task 2: GameState schema        | `b9c9e42` | game.ts, placement-validator.spec.ts              |
| Task 3: GameManager integration | `365ecf5` | GameManager.ts                                    |

## Decisions

| Decision                                   | Rationale                                       |
| ------------------------------------------ | ----------------------------------------------- |
| Mirror longest-road-logic pattern          | Consistent code organization, same TDD approach |
| Pure function with state input/output      | Testable, predictable, no side effects          |
| Return `LargestArmyResult` from playKnight | Enables WebSocket broadcasting of transfers     |

## Verification

- All 14 TDD tests pass
- Shared library builds successfully
- API builds successfully
- All 73 existing tests pass
