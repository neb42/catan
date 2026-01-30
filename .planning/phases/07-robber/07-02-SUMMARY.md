---
phase: 07-robber
plan: 02
subsystem: game-logic
tags: [robber, validation, gamemanager, state-machine]

# Dependency graph
requires:
  - phase: 07-01
    provides: GameState.robberHexId field, robber message schemas, resource blocking
provides:
  - Robber validation functions (mustDiscard, validateDiscard, getStealCandidates, executeSteal, validateRobberPlacement)
  - GameManager robber methods (submitDiscard, moveRobber, stealFrom)
  - Robber phase state machine (none -> discarding -> moving -> stealing -> none)
affects: [07-03, 07-04, 07-05, 07-06, 07-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Validator module pattern (robber-logic.ts like trade-validator.ts)
    - State machine for multi-step flows
    - Internal helper methods for resource transfers

key-files:
  created:
    - apps/api/src/game/robber-logic.ts
  modified:
    - apps/api/src/game/GameManager.ts
    - apps/api/src/game/placement-validator.spec.ts

key-decisions:
  - 'Robber phase state machine with 4 states: none, discarding, moving, stealing'
  - 'Auto-steal when only one candidate adjacent to robber hex'
  - 'Random weighted selection for steal (proportional to card count)'

patterns-established:
  - 'Robber logic separated into robber-logic.ts for validation/helpers'
  - 'GameManager orchestrates robber flow with phase tracking'

# Metrics
duration: 4min
completed: 2026-01-30
---

# Phase 7 Plan 2: GameManager Robber Methods Summary

**Complete robber flow implementation: discard validation, robber movement, and random steal mechanics in GameManager**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-30T15:30:05Z
- **Completed:** 2026-01-30T15:34:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created robber-logic.ts with 6 validation/helper functions
- Implemented GameManager robber methods: submitDiscard, moveRobber, stealFrom
- Robber phase state machine tracks flow from discarding through stealing
- Auto-steal from single adjacent player when no choice needed

## Task Commits

1. **Task 1: Create robber-logic.ts** - `adc3671` (feat)
2. **Task 2: Add robber methods to GameManager** - `b25b562` (feat)

## Files Created/Modified

- `apps/api/src/game/robber-logic.ts` - Validation and helper functions for robber mechanics
- `apps/api/src/game/GameManager.ts` - Robber state properties and methods
- `apps/api/src/game/placement-validator.spec.ts` - Added robberHexId to test GameState objects (blocking fix)

## Decisions Made

- Robber phase uses 4-state machine: none -> discarding -> moving -> stealing -> none
- Auto-steal when only one adjacent player (no choice needed)
- Random steal uses weighted selection proportional to resource counts

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed missing robberHexId in test GameState objects**

- **Found during:** Task 1 verification (build failed)
- **Issue:** placement-validator.spec.ts had GameState objects missing the new robberHexId field from 07-01
- **Fix:** Added `robberHexId: null` to both emptyGameState and mainGameState test fixtures
- **Files modified:** apps/api/src/game/placement-validator.spec.ts
- **Verification:** npx nx build api succeeds
- **Committed in:** adc3671 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Fix was necessary for build to succeed. Pre-existing issue from 07-01.

## Issues Encountered

None

## Next Phase Readiness

- Robber logic and GameManager methods ready for WebSocket handler integration (07-03)
- All validation functions exported and tested via build
- Phase state machine ready for client sync

---

_Phase: 07-robber_
_Completed: 2026-01-30_
