---
phase: 14-victory-stats-and-rematch
plan: 03
subsystem: api
tags: [websocket, game-logic, rematch, room-management]

# Dependency graph
requires:
  - phase: 11-victory
    provides: Victory detection and game end state
  - phase: 12-resilience-polish
    provides: Room and player state management
provides:
  - Rematch voting system with unanimous consent
  - Game state reset logic generating new board
  - WebSocket rematch message handlers
affects: [14-05-rematch-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Unanimous voting pattern for game actions
    - Game reset via new GameManager instance

key-files:
  created: []
  modified:
    - libs/shared/src/schemas/messages.ts
    - apps/api/src/managers/RoomManager.ts
    - apps/api/src/handlers/lobby-handlers.ts
    - apps/api/src/handlers/websocket.ts

key-decisions:
  - 'Use new GameManager() instead of manual reset to prevent state leakage'
  - 'Require unanimous vote (all players) for rematch to trigger'
  - 'Reset ready states when rematch triggers so players can start fresh countdown'

patterns-established:
  - 'Rematch votes stored in Set<string> on ManagedRoom'
  - 'Broadcast rematch_update on each vote to show progress'
  - 'Reset clears votes, ready states, generates new board, creates new GameManager'

# Metrics
duration: 3min
completed: 2026-02-08
---

# Phase 14 Plan 03: Rematch Backend Implementation Summary

**Unanimous rematch voting system with automatic game reset generating fresh board and GameManager**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-08T18:48:42Z
- **Completed:** 2026-02-08T18:50:36Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Three rematch message schemas (request, update, reset) added to shared library
- RoomManager tracks votes and broadcasts updates to all players
- Unanimous vote triggers automatic game reset with new board
- WebSocket handler integrated into lobby message routing

## Task Commits

Each task was committed atomically:

1. **Task 1: Add rematch message schemas** - `8aa212c` (feat)
2. **Task 2: Add rematch vote tracking to RoomManager** - `f8535d9` (feat)
3. **Task 3: Create rematch WebSocket handler** - `25db276` (feat)

## Files Created/Modified

- `libs/shared/src/schemas/messages.ts` - Added RequestRematch, RematchUpdate, GameReset schemas
- `apps/api/src/managers/RoomManager.ts` - Added rematchVotes Set, handleRematchVote(), resetGame() methods
- `apps/api/src/handlers/lobby-handlers.ts` - Added handleRequestRematch() following existing handler pattern
- `apps/api/src/handlers/websocket.ts` - Added request_rematch case to message router

## Decisions Made

**1. Use new GameManager() for reset**

- Per RESEARCH.md guidance, create new instance instead of manually clearing fields
- Prevents state leakage from previous game
- Ensures clean initialization

**2. Unanimous voting requirement**

- All players must vote for rematch to trigger
- Implemented as `room.rematchVotes.size === room.players.size` check
- Ensures all players agree before resetting game

**3. Reset ready states on rematch**

- When game resets, all players.ready set to false
- Allows players to ready up again for countdown
- Prevents immediate auto-start after rematch

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation followed research and existing patterns cleanly.

## Next Phase Readiness

- Backend rematch system complete
- Ready for frontend UI implementation (plan 14-05)
- WebSocket messages tested via build verification
- Room state management handles rematch flow correctly

---

_Phase: 14-victory-stats-and-rematch_
_Completed: 2026-02-08_
