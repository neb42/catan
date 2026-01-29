---
phase: 05-building
plan: 02
subsystem: game-logic
tags: [websocket, building, resource-validation, catan]

# Dependency graph
requires:
  - phase: 05-01
    provides: BUILDING_COSTS, MAX_PIECES constants, main-game placement validators, build message schemas
  - phase: 04-turn-structure
    provides: Turn state, resource tracking, main phase infrastructure
provides:
  - GameManager build methods (buildRoad, buildSettlement, buildCity)
  - Resource validation helpers (hasResources, deductResources)
  - Piece counting helper (countPlayerPieces)
  - WebSocket handlers for build_road, build_settlement, build_city messages
affects:
  - 05-03: Frontend will call build methods via WebSocket
  - 05-04: Build overlay will use these handlers for placement

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Build validation chain (turn → phase → limit → resources → placement)
    - Broadcast success, send failure to requester pattern

key-files:
  created: []
  modified:
    - apps/api/src/game/GameManager.ts
    - apps/api/src/handlers/websocket.ts

key-decisions:
  - 'Validation order: turn, phase, piece limit, resources, placement for clear error messages'
  - 'Return resourcesSpent in success response for client animation'
  - 'Send build_failed to requester only, not broadcast'

patterns-established:
  - 'Build validation chain: 5-step validation before modifying state'
  - 'Resource helper pattern: hasResources check before deductResources call'

# Metrics
duration: 2min
completed: 2026-01-29
---

# Phase 5 Plan 2: GameManager Build Methods and WebSocket Handlers Summary

**Backend build system with resource/placement validation and real-time broadcast to all players**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-29T20:58:47Z
- **Completed:** 2026-01-29T21:00:53Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added hasResources, deductResources, and countPlayerPieces helpers to GameManager
- Implemented buildRoad, buildSettlement, buildCity methods with full validation chain
- Added WebSocket handlers for all three build message types
- Successful builds broadcast to all players with resourcesSpent for UI animation
- Failed builds return clear error messages to requester

## Task Commits

Each task was committed atomically:

1. **Task 1: Add build methods to GameManager** - `83eb805` (feat)
2. **Task 2: Add WebSocket handlers for build messages** - `6499eaa` (feat)

## Files Created/Modified

- `apps/api/src/game/GameManager.ts` - Added 3 helpers and 3 build methods (276 lines)
- `apps/api/src/handlers/websocket.ts` - Added 3 build message handlers (96 lines)

## Decisions Made

| Decision                            | Rationale                                                                         |
| ----------------------------------- | --------------------------------------------------------------------------------- |
| 5-step validation chain             | Turn → phase → limit → resources → placement gives clear, specific error messages |
| Return resourcesSpent on success    | Enables client animation showing resources being spent                            |
| send build_failed only to requester | Other players don't need to see failed build attempts                             |

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

- Backend building system complete
- Ready for 05-03-PLAN.md (Frontend build state, hooks, and BuildControls component)
- All validators tested from 05-01, build methods use them correctly
- WebSocket handlers ready to receive build requests from frontend

---

_Phase: 05-building_
_Completed: 2026-01-29_
