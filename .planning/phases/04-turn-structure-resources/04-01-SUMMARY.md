---
phase: 04-turn-structure-resources
plan: 01
subsystem: api
tags: [game-state, dice, resources, turn-management, zod]

# Dependency graph
requires:
  - phase: 03-initial-placement
    provides: GameManager with settlement placement and game state tracking
provides:
  - TurnState schema with phase, currentPlayerId, turnNumber, lastDiceRoll
  - WebSocket message schemas for dice rolling and turn management
  - Resource distribution module calculating yields from dice rolls
  - GameManager rollDice() and endTurn() methods
affects: [04-02-websocket-handlers, 05-building-roads, 06-robber]

# Tech tracking
tech-stack:
  added: []
  patterns: [server-authoritative-dice, resource-distribution-algorithm]

key-files:
  created:
    - apps/api/src/game/resource-distributor.ts
    - apps/api/src/game/resource-distributor.spec.ts
  modified:
    - libs/shared/src/schemas/game.ts
    - libs/shared/src/schemas/messages.ts
    - apps/api/src/game/GameManager.ts
    - apps/api/src/game/placement-validator.spec.ts

key-decisions:
  - "TurnPhase enum uses 'roll' | 'main' only - 'end' is a transition not a state"
  - 'resourcesDistributed included in DiceRolled message for client animation'
  - 'turnState nullable in GameState (null during placement phase)'
  - 'Skip robber logic for dice roll 7 until Phase 6'

patterns-established:
  - 'Server-authoritative random: all dice rolls generated server-side'
  - 'Terrain-to-resource mapping: forest→wood, hills→brick, pasture→sheep, fields→wheat, mountains→ore'
  - 'Resource distribution: settlements yield 1, cities yield 2'

# Metrics
duration: 5min
completed: 2026-01-29
---

# Phase 04 Plan 01: Turn State Foundation Summary

**Server-authoritative dice rolling with automatic resource distribution based on settlements/cities adjacent to rolled hex numbers**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-29T12:53:06Z
- **Completed:** 2026-01-29T12:58:35Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- TurnState schema with phase tracking ('roll' | 'main'), current player, turn number, and last dice roll
- Complete WebSocket message schemas for RollDice, DiceRolled, EndTurn, and TurnChanged events
- Resource distribution algorithm that correctly yields resources based on dice total matching hex numbers
- GameManager extended with rollDice() and endTurn() methods using server-authoritative logic

## Task Commits

Each task was committed atomically:

1. **Task 1: Add turn state and message schemas to shared library** - `d73b394` (feat)
2. **Task 2: Create resource distribution module** - `9ba6d7f` (feat)
3. **Task 3: Add turn state and dice rolling to GameManager** - `51114cc` (feat)

## Files Created/Modified

- `libs/shared/src/schemas/game.ts` - Added TurnPhaseSchema, DiceRollSchema, TurnStateSchema; updated GameStateSchema with turnState field
- `libs/shared/src/schemas/messages.ts` - Added RollDiceMessageSchema, DiceRolledMessageSchema, EndTurnMessageSchema, TurnChangedMessageSchema, ResourceDistributionSchema
- `apps/api/src/game/resource-distributor.ts` - Resource distribution logic with terrain-to-resource mapping
- `apps/api/src/game/resource-distributor.spec.ts` - 15 test cases covering all distribution scenarios
- `apps/api/src/game/GameManager.ts` - rollDice(), endTurn(), startMainGame(), updated getCurrentPlayerId()
- `apps/api/src/game/placement-validator.spec.ts` - Added turnState: null to test fixture

## Decisions Made

- **TurnPhase enum**: Uses 'roll' | 'main' only - 'end' is a transition triggered by endTurn(), not a discrete state
- **resourcesDistributed in DiceRolled**: Allows clients to animate resource distribution for all players, not just the local player
- **turnState nullable**: Null during placement phase, initialized when setup completes via startMainGame()
- **Robber deferred**: When dice total is 7, resources are still distributed normally - robber logic comes in Phase 6

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed placement-validator.spec.ts test fixture**

- **Found during:** Task 3 (GameManager modifications)
- **Issue:** Adding turnState to GameStateSchema broke existing test that had incomplete game state fixture
- **Fix:** Added `turnState: null` to emptyGameState test fixture
- **Files modified:** apps/api/src/game/placement-validator.spec.ts
- **Verification:** All 32 API tests pass
- **Committed in:** 51114cc (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minor test fixture update required for schema change. No scope creep.

## Issues Encountered

None - plan executed smoothly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Turn state foundation complete with schemas and GameManager logic
- Ready for Plan 04-02: WebSocket handlers to wire dice rolling and turn management to clients
- Robber logic (dice roll 7) intentionally deferred to Phase 6

---

_Phase: 04-turn-structure-resources_
_Plan: 01_
_Completed: 2026-01-29_
