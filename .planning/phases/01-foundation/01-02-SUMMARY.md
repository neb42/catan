---
phase: 01-foundation
plan: 02
subsystem: api
tags: [websocket, express, ws, zod]

# Dependency graph
requires:
  - phase: 01-01
    provides: shared lobby schemas and constants under @catan/shared
provides:
  - WebSocket upgrade endpoint at /ws on the API server
  - Room manager with nickname enforcement and grace-period cleanup
  - WebSocket message routing for create/join/ready/color flows
affects: [01-03, 01-04, lobby, websocket]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Express + ws upgrade with heartbeat ping/pong monitoring
    - Map-backed RoomManager with 3-minute grace-period deletion

key-files:
  created:
    - apps/api/src/managers/RoomManager.ts
    - apps/api/src/utils/room-id.ts
    - apps/api/src/handlers/websocket.ts
  modified:
    - apps/api/src/main.ts

key-decisions:
  - Assign first available color on join to avoid conflicts before user selection
  - Treat ready-to-start as 3-4 players all marked ready, broadcasting a countdown

patterns-established:
  - Broadcast helpers serialize server-side room state before emitting to clients
  - Error responses constrained to shared WebSocket error message schema

# Metrics
duration: 2m 40s
completed: 2026-01-20
---

# Phase 1 Plan 2 Summary

**Express + ws upgrade serving /ws with heartbeat, RoomManager-backed rooms, and lobby message routing for create/join/ready/color**

## Performance

- **Duration:** 2m 40s
- **Started:** 2026-01-20T21:37:09Z
- **Completed:** 2026-01-20T21:39:49Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Integrated WebSocket server on the API host with upgrade handling and 30s heartbeat
- Implemented room lifecycle manager with nickname uniqueness, capacity checks, and 3-minute cleanup timer
- Added WebSocket routing for create_room, join_room, toggle_ready, and change_color with Zod validation and room broadcasts

## Task Commits

Each task was committed atomically:

1. **Task 1: Set up Express server with WebSocket upgrade handler** - `d8bde07` (feat)
2. **Task 2: Implement RoomManager with grace period cleanup** - `0fd6605` (feat)
3. **Task 3: Create WebSocket message handler with room operations** - `5e4c2bc` (feat)

**Plan metadata:** _pending_

## Files Created/Modified
- apps/api/src/main.ts - Wraps Express server with ws upgrade at /ws and heartbeat monitoring
- apps/api/src/managers/RoomManager.ts - Room lifecycle with nickname checks, capacity enforcement, and 3-minute grace cleanup
- apps/api/src/utils/room-id.ts - Generates 6-character uppercase room IDs from custom alphabet using crypto.getRandomValues
- apps/api/src/handlers/websocket.ts - Validates lobby messages and routes create/join/ready/color actions through RoomManager

## Decisions Made
- Assign the first unused color on join to ensure every player starts with a unique color before any user-driven changes
- Start game countdown only when 3-4 players are present and every player toggles ready, using a shared 5-second countdown broadcast

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- WebSocket server available at ws://localhost:3333/ws for the lobby client (01-03) to consume
- RoomManager cleanup timers ensure empty rooms expire after 3 minutes; clients should handle room-not-found on rejoin attempts
- Shared schemas under @catan/shared already in place for client validation

---
*Phase: 01-foundation*
*Completed: 2026-01-20*
