---
phase: 08-development-cards
plan: 02
subsystem: api
tags: [development-cards, gamemanager, deck-shuffle, fisher-yates]

# Dependency graph
requires:
  - phase: 08-01
    provides: DevelopmentCardType, OwnedDevCard schemas, DEV_CARD_COST, DEV_DECK_COMPOSITION constants
provides:
  - dev-card-logic.ts with Fisher-Yates shuffle and validation functions
  - GameManager deck state and buyDevCard method
  - Knight count tracking per player
affects: [08-03, 08-04, 08-05, 08-06]

# Tech tracking
tech-stack:
  added: []
  patterns: [index-pointer-deck-access, pure-function-logic-extraction]

key-files:
  created:
    - apps/api/src/game/dev-card-logic.ts
  modified:
    - apps/api/src/game/GameManager.ts

key-decisions:
  - 'Index pointer for deck access - immutable deck array, track position with deckIndex'
  - 'Pure function extraction - dev card validation in separate module following robber-logic pattern'
  - 'Knight tracking initialized to 0 for all players at game start'

patterns-established:
  - 'Index pointer pattern: Use deckIndex instead of mutating deck array with splice/shift'
  - 'Logic extraction: Pure validation functions in *-logic.ts files for testability'

# Metrics
duration: 2min
completed: 2026-01-30
---

# Phase 8 Plan 2: Deck Management and Purchase System Summary

**Fisher-Yates shuffled dev card deck with index pointer access, purchase validation, and knight count tracking in GameManager**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-30T20:29:23Z
- **Completed:** 2026-01-30T20:31:53Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created dev-card-logic.ts with pure functions for deck creation, shuffle, and validation
- Fisher-Yates shuffle implementation with correct bounds (Math.random() \* (i + 1))
- GameManager tracks deck state with index pointer pattern (immutable deck array)
- buyDevCard validates turn, phase, resources, and deck availability
- Purchased cards include unique ID and purchasedOnTurn for same-turn restriction
- Knight count tracking initialized for all players (ready for Largest Army)
- endTurn resets playedDevCardThisTurn flag

## Task Commits

Each task was committed atomically:

1. **Task 1: Create dev-card-logic.ts with deck and validation functions** - `171f1cc` (feat)
2. **Task 2: Add dev card state and methods to GameManager** - `8607998` (feat)

## Files Created/Modified

- `apps/api/src/game/dev-card-logic.ts` - New file with createShuffledDeck, canBuyDevCard, canPlayDevCard, drawCard functions
- `apps/api/src/game/GameManager.ts` - Added dev card state, initialization, and buyDevCard method

## Decisions Made

1. **Index pointer for deck access** - Use deckIndex instead of mutating deck array with splice/shift to avoid off-by-one errors and maintain immutability
2. **Pure function extraction** - Dev card validation functions extracted to dev-card-logic.ts following established robber-logic.ts pattern
3. **Knight tracking at game start** - Initialize knightsPlayed map with 0 for all players in constructor (ready for Largest Army calculation)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Deck management and purchase system complete
- Ready for 08-03-PLAN.md: Knight card play and robber integration
- buyDevCard method returns OwnedDevCard for WebSocket handlers to broadcast
- canPlayDevCard function ready for use in play card validation

---

_Phase: 08-development-cards_
_Completed: 2026-01-30_
