---
phase: 07-robber
plan: 01
subsystem: api
tags: [websocket, zod, schemas, robber, game-state]

# Dependency graph
requires:
  - phase: 06-trading
    provides: Complete trading system with resource management
provides:
  - Robber message schemas for all robber-related WebSocket communication
  - robberHexId field in GameState for robber position tracking
  - Resource distributor robber blocking logic
affects: [07-02, 07-03, 07-04, 07-05, 07-06, 07-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Nullable field pattern for optional game state (robberHexId: null until placed)
    - Hex exclusion filter in resource distribution

key-files:
  created: []
  modified:
    - libs/shared/src/schemas/messages.ts
    - libs/shared/src/schemas/game.ts
    - apps/api/src/game/resource-distributor.ts
    - apps/api/src/game/resource-distributor.spec.ts

key-decisions:
  - 'robberHexId nullable: null during setup phase, set to desert hex ID when game starts'
  - '11 new message schemas: discard_submitted, move_robber, steal_target (client), discard_required, discard_completed, all_discards_complete, robber_move_required, robber_moved, steal_required, stolen, no_steal_possible (server)'
  - 'Robber blocking filter: hexes with matching robberHexId excluded from resource distribution'

patterns-established:
  - 'Nullable game state fields: Use z.string().nullable() for optional state like robberHexId'
  - 'Backward compatible function signatures: Add optional parameters with null defaults'

# Metrics
duration: 8min
completed: 2026-01-30
---

# Phase 7 Plan 1: Robber Foundation Summary

**Type-safe robber message schemas with robberHexId game state tracking and resource distributor blocking logic**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-01-30T15:22:19Z
- **Completed:** 2026-01-30T15:30:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Added 11 new WebSocket message schemas for complete robber communication flow
- Added robberHexId field to GameState for tracking robber position
- Implemented robber blocking in resource distributor with comprehensive test coverage
- All existing tests updated and passing (18 total)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add robber message schemas** - `b61783d` (feat)
2. **Task 2: Add robberHexId to GameState** - `98f2dbf` (feat)
3. **Task 3: Update resource distributor for robber blocking** - `741cb4a` (feat)

**Plan metadata:** (pending)

## Files Created/Modified

- `libs/shared/src/schemas/messages.ts` - Added 11 robber message schemas to discriminated union
- `libs/shared/src/schemas/game.ts` - Added robberHexId nullable field to GameStateSchema
- `apps/api/src/game/resource-distributor.ts` - Added robberHexId parameter and blocking filter
- `apps/api/src/game/resource-distributor.spec.ts` - Updated 15 existing tests + 3 new robber blocking tests

## Decisions Made

1. **robberHexId is nullable** - Starts as null during setup, set when game begins (desert hex)
2. **11 message schemas** - Covers full robber flow: discard phase, move phase, steal phase
3. **Backward compatible distributor** - Existing callers pass null to maintain behavior

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Robber schemas ready for GameManager methods (07-02)
- robberHexId field ready for state management
- Resource distributor ready to receive robber hex ID from game state
- No blockers for next plan

---

_Phase: 07-robber_
_Completed: 2026-01-30_
