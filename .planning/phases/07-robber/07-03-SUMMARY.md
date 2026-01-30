---
phase: 07-robber
plan: 03
subsystem: api
tags: [robber, websocket, handlers, real-time]

# Dependency graph
requires:
  - phase: 07-01
    provides: Robber message schemas, GameState.robberHexId field
  - phase: 07-02
    provides: GameManager robber methods (submitDiscard, moveRobber, stealFrom)
provides:
  - WebSocket handlers for complete robber flow
  - roll_dice handler extended to trigger robber on 7
  - discard_submitted handler with completion tracking
  - move_robber handler with auto-steal for single victim
  - steal_target handler for multiple candidates
  - Targeted messaging via getPlayerWebSocket
affects: [07-04, 07-05, 07-06, 07-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Targeted WebSocket messaging pattern (getPlayerWebSocket)
    - Robber flow state broadcasts (robber_triggered, discard_completed, etc.)
    - Auto-steal on single victim (no user choice needed)

key-files:
  created: []
  modified:
    - apps/api/src/handlers/websocket.ts
    - apps/api/src/managers/RoomManager.ts
    - apps/api/src/game/GameManager.ts

key-decisions:
  - 'Targeted messages via getPlayerWebSocket for discard_required and robber_move_required'
  - 'Broadcast robber_triggered to all clients for UI sync'
  - 'Include candidate nicknames in steal_required for display'

patterns-established:
  - 'Use getPlayerWebSocket for player-specific messages instead of broadcast'
  - 'Broadcast phase transitions (robber_triggered, all_discards_complete) for client sync'

# Metrics
duration: 8min
completed: 2026-01-30
---

# Phase 7 Plan 3: WebSocket Robber Handlers Summary

**Complete WebSocket handler integration for robber flow: roll_dice triggers on 7, discard submission, robber movement, and steal selection with auto-steal**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-30T15:33:00Z
- **Completed:** 2026-01-30T15:41:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Extended roll_dice handler to detect 7 and trigger robber flow
- Added targeted messaging pattern for player-specific robber messages
- Implemented all three robber message handlers (discard, move, steal)
- Auto-steal when single victim adjacent to robber hex

## Task Commits

1. **Task 1-3 Prep: Add robber getters** - `57459a5` (feat)
2. **Tasks 1-3: WebSocket robber handlers** - `6b5177c` (feat)

## Files Created/Modified

- `apps/api/src/handlers/websocket.ts` - Added robber flow to roll_dice, new discard_submitted/move_robber/steal_target handlers
- `apps/api/src/managers/RoomManager.ts` - Added getPlayerWebSocket for targeted messaging
- `apps/api/src/game/GameManager.ts` - Added getPlayerResources and getGameState getters

## Decisions Made

- Use targeted WebSocket messages (getPlayerWebSocket) for discard_required and robber_move_required
- Broadcast robber_triggered to all clients so everyone knows robber flow is active
- Include nicknames in steal_required candidates for client display
- Check WebSocket.readyState before sending targeted messages

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added missing GameManager getters**

- **Found during:** Pre-execution analysis
- **Issue:** 07-02 left getPlayerResources() and getGameState() unimplemented, needed by WebSocket handlers
- **Fix:** Added both getter methods to GameManager
- **Files modified:** apps/api/src/game/GameManager.ts
- **Verification:** TypeScript compiles, API tests pass
- **Committed in:** 57459a5

**2. [Rule 3 - Blocking] Added getPlayerWebSocket to RoomManager**

- **Found during:** Pre-execution analysis
- **Issue:** No way to send targeted messages to specific players
- **Fix:** Added getPlayerWebSocket(roomId, playerId) method to RoomManager
- **Files modified:** apps/api/src/managers/RoomManager.ts
- **Verification:** TypeScript compiles
- **Committed in:** 57459a5

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both blocking fixes necessary for handlers to call GameManager methods. No scope creep.

## Issues Encountered

None - once blocking issues were resolved, handler implementation proceeded smoothly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- WebSocket handlers complete and ready for client integration (07-04)
- All robber messages defined and broadcast appropriately
- Targeted messaging pattern established for future player-specific needs

---

_Phase: 07-robber_
_Completed: 2026-01-30_
