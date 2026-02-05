---
phase: 12-resilience-polish
plan: 03
subsystem: ui
tags: [lobby, ready-system, countdown, websocket, react]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: WebSocket infrastructure for real-time messaging
  - phase: 02-lobby
    provides: Lobby UI and room state management
provides:
  - Lobby ready-up system with player ready state
  - 5-second countdown timer when all players ready
  - Automatic game start when countdown completes
  - Countdown cancellation when players unready
affects: [13-deployment, testing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'Countdown state managed via server-side setInterval with broadcast ticks'
    - 'Frontend countdown display as fixed-position overlay'

key-files:
  created: []
  modified:
    - libs/shared/src/schemas/messages.ts
    - apps/api/src/managers/RoomManager.ts
    - apps/api/src/handlers/lobby-handlers.ts
    - apps/web/src/handlers/gameLifecycleHandlers.ts
    - apps/web/src/handlers/index.ts
    - apps/web/src/components/Lobby.tsx

key-decisions:
  - 'Countdown duration: 5 seconds (user preference)'
  - 'Countdown signal: secondsRemaining: -1 indicates countdown cancelled'
  - 'Countdown UI: 160px Fraunces font, fixed position, z-index 1000'
  - 'Auto-start game: Countdown reaching 0 triggers existing game start logic'

patterns-established:
  - 'Server-managed countdown with broadcast tick pattern for synchronized UI'
  - "Negative value as cancellation signal (-1 for 'hide countdown')"

# Metrics
duration: 4min
completed: 2026-02-05
---

# Phase 12 Plan 03: Lobby Ready-Up System Summary

**Players control game start with ready-up system; 5-second countdown auto-starts game when all 3-4 players ready**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-05T12:22:07Z
- **Completed:** 2026-02-05T12:26:27Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Backend countdown logic with 5-second timer and automatic game start
- Frontend countdown overlay displaying large centered number (160px)
- Ready state toggle for all players with visual ready badges
- Countdown cancellation when any player unreadies

## Task Commits

Each task was committed atomically:

1. **Task 1: Backend ready state and countdown logic** - `8a2be70` (feat)
2. **Task 2: Frontend ready button and countdown UI** - `747f0e3` (feat)

## Files Created/Modified

- `libs/shared/src/schemas/messages.ts` - Added CountdownTickMessage schema
- `apps/api/src/managers/RoomManager.ts` - Added countdownTimer field to ManagedRoom type
- `apps/api/src/handlers/lobby-handlers.ts` - Implemented handleToggleReady with countdown logic
- `apps/web/src/handlers/gameLifecycleHandlers.ts` - Added handleCountdownTick handler
- `apps/web/src/handlers/index.ts` - Registered countdown_tick handler
- `apps/web/src/components/Lobby.tsx` - Added countdown overlay UI (160px fixed-position number)

## Decisions Made

**1. Countdown duration: 5 seconds**

- User requested 5-second countdown for anticipation without excessive wait

**2. Cancellation signal: secondsRemaining: -1**

- Special value -1 indicates "hide countdown" when player unreadies during countdown
- Allows single message type to handle both ticks and cancellation

**3. Countdown UI positioning**

- Fixed position, centered on screen with z-index 1000
- 160px Fraunces font for high visibility
- Displays over lobby UI without blocking visibility

**4. Auto-start trigger**

- Countdown reaching 0 calls existing game initialization logic
- Reuses board generation and placement phase transition from Phase 3

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation straightforward with existing WebSocket infrastructure.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for deployment and testing phases:

- Lobby ready system complete
- All multiplayer lobby features implemented
- Game start flow fully automated with player control

---

_Phase: 12-resilience-polish_
_Completed: 2026-02-05_
