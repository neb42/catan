---
phase: 06-trading
plan: 02
subsystem: api
tags: [trading, validation, ports, gamemanager, backend]

# Dependency graph
requires:
  - phase: 06-01
    provides: Trade message Zod schemas and ActiveTrade type
provides:
  - Port access calculation for 2:1, 3:1, 4:1 trade rates
  - Trade validation functions for domestic and bank trades
  - GameManager trade methods for full trade lifecycle
affects: [06-03, 06-05, 06-06, 06-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Port vertex calculation using hexGeometry getVertexFromCorner
    - Validation result pattern with {valid, error} return type
    - Trade response tracking with empty initial responses

key-files:
  created:
    - apps/api/src/game/port-access.ts
    - apps/api/src/game/trade-validator.ts
  modified:
    - apps/api/src/game/GameManager.ts

key-decisions:
  - 'Empty initial responses for trades - responses filled as players respond'
  - 'Port vertex mapping uses edge index to corner mapping from hexGeometry'
  - 'Trade validation returns error strings for clear user feedback'

patterns-established:
  - 'ValidationResult interface for all trade validations'
  - 'Trade auto-cancel on turn end via endTurn method'

# Metrics
duration: 4min
completed: 2026-01-30
---

# Phase 6 Plan 2: Backend Trade Logic Summary

**Port access calculation, trade validation, and GameManager trade methods for domestic and bank trading**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-30T10:55:45Z
- **Completed:** 2026-01-30T11:00:08Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Created port access module that calculates which ports a player can use based on settlement positions
- Implemented trade validation with clear error messages for all trade scenarios
- Added full trade lifecycle methods to GameManager (propose, respond, select partner, cancel, bank trade)
- Port trades correctly calculate 2:1, 3:1, or 4:1 rates based on player's port access
- Active trades automatically clear on turn end

## Task Commits

Each task was committed atomically:

1. **Task 1: Create port access calculation module** - `27af376` (feat)
2. **Task 2: Create trade validation module** - `4d1bd50` (feat)
3. **Task 3: Add trade methods to GameManager** - `f12a1ae` (feat)

## Files Created/Modified

- `apps/api/src/game/port-access.ts` - Port access calculation with getPlayerPortAccess and getBestTradeRate
- `apps/api/src/game/trade-validator.ts` - Trade validation functions for all trade types
- `apps/api/src/game/GameManager.ts` - Trade methods and activeTrade state management

## Decisions Made

- **Empty initial responses**: When a trade is proposed, the responses object starts empty rather than pre-populating with 'pending' for all players. Responses are added as players respond, making it easy to check if all players have responded.
- **Port vertex calculation**: Port edges map to hex corners using the edge index pattern from hexGeometry (edge i connects corners i and i+1 mod 6).
- **Validation error strings**: All validation functions return descriptive error strings that can be shown directly to users.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

- Trade validation and execution logic ready for WebSocket handler integration (06-03)
- Port access can be exposed to frontend for trade UI rate display (06-04)
- GameManager trade methods match the signatures expected by websocket.ts handlers

---

_Phase: 06-trading_
_Completed: 2026-01-30_
