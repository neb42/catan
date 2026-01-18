---
phase: 01-websocket-infrastructure
plan: 02
subsystem: infra
tags: [websocket, connection-management, rooms, heartbeat, ping-pong, crypto, typescript]

# Dependency graph
requires:
  - phase: 01-websocket-infrastructure
    plan: 01
    provides: "Zod message schemas with discriminated unions for WebSocket validation"
provides:
  - "ConnectionManager for client lifecycle with crypto.randomUUID IDs and ping/pong heartbeats"
  - "RoomManager for room-based architecture with capacity enforcement"
  - "30-second grace period for reconnection after disconnect"
  - "TypeScript interfaces for ClientConnection, Room, RoomMetadata"
affects: [01-websocket-infrastructure, message-routing, lobby-management]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Connection lifecycle with ping/pong heartbeat detection (30-second interval)"
    - "Grace period pattern for reconnection using disconnectedConnections Map"
    - "Room-based architecture with bidirectional client-room mapping"
    - "Capacity enforcement at room join with size checks"
    - "Delegation pattern: RoomManager broadcasts via ConnectionManager, not direct WebSocket"

key-files:
  created:
    - apps/api/src/websocket/types.ts
    - apps/api/src/websocket/connection-manager.ts
    - apps/api/src/websocket/room-manager.ts
  modified: []

key-decisions:
  - "Use crypto.randomUUID() not uuid package (zero dependencies, 3x faster, built-in Node.js)"
  - "30-second heartbeat interval matches grace period for consistent timing"
  - "Delete empty rooms immediately (no grace period for rooms, cheap to recreate)"
  - "RoomManager delegates to ConnectionManager for all message sending (separation of concerns)"
  - "Grace period tracks disconnected connections for 30 seconds enabling seamless reconnection"

patterns-established:
  - "ConnectionManager pattern: Manages client state, heartbeat, and message delivery"
  - "RoomManager pattern: Manages room membership and targeted broadcasts"
  - "Heartbeat pattern: ping/pong every 30s with isAlive flag to detect stale connections"
  - "Grace period pattern: Move disconnected connections to separate Map with timestamp for reconnection window"
  - "Reverse lookup pattern: clientRooms Map enables fast client-to-room queries"

# Metrics
duration: 2min
completed: 2026-01-18
---

# Phase 01 Plan 02: Connection & Room Managers Summary

**ConnectionManager with crypto.randomUUID and ping/pong heartbeats plus RoomManager with 4-player capacity enforcement**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-18T13:56:25Z
- **Completed:** 2026-01-18T13:58:57Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Built ConnectionManager with stable UUID client IDs using native crypto.randomUUID() (zero dependencies)
- Implemented ping/pong heartbeat detection with 30-second intervals to terminate stale connections
- Added 30-second grace period for reconnection using disconnectedConnections Map
- Built RoomManager with 4-player capacity enforcement and room-based message routing
- Established room architecture pattern with bidirectional mapping (rooms and clientRooms)
- Implemented automatic empty room cleanup when last player leaves

## Task Commits

Each task was committed atomically:

1. **Task 1: Build connection manager with heartbeat detection** - `c552271` (feat)
2. **Task 2: Build room manager with capacity enforcement** - `4e9fd6c` (feat)

## Files Created/Modified
- `apps/api/src/websocket/types.ts` - TypeScript interfaces for ClientConnection, Room, RoomMetadata
- `apps/api/src/websocket/connection-manager.ts` - Connection lifecycle with ping/pong heartbeats and grace period
- `apps/api/src/websocket/room-manager.ts` - Room membership with capacity enforcement and targeted broadcasts

## Decisions Made

**Use crypto.randomUUID() instead of uuid package:**
- Native Node.js crypto module is 3x faster than uuid package
- Zero dependencies reduces bundle size and attack surface
- Already available in Node.js 14.17+, no installation needed
- RESEARCH.md confirmed this is current best practice (uuid package only needed for v1/v3/v5)

**30-second heartbeat interval:**
- Matches the 30-second grace period for consistent timing
- Standard industry practice balancing detection speed vs network overhead
- WebSocket ping/pong frames are protocol-level, more reliable than application-level checks

**Delete empty rooms immediately:**
- Rooms are stateless (no game state yet) so recreating is trivial
- Prevents memory leaks from accumulating empty rooms
- If reconnect-to-room needed later, can add grace period similar to connections

**RoomManager delegates to ConnectionManager:**
- Separation of concerns: rooms manage membership, connections manage transport
- RoomManager has no direct WebSocket references (all via connectionManager.sendToClient)
- Makes testing easier (can mock ConnectionManager)
- Prevents duplicate message sending logic

**Grace period implementation:**
- Move disconnected connections to separate Map with disconnectedAt timestamp
- Reconnection within 30 seconds restores original client ID and session
- After 30 seconds, treat as new client (generate fresh UUID)
- Handles brief network blips (WiFi handoff, mobile tower switching) gracefully

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation followed RESEARCH.md patterns directly and compiled cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for next phase:**
- Connection lifecycle management complete with heartbeat detection
- Room-based architecture ready for lobby and game state
- Client IDs are stable and support reconnection
- Capacity enforcement prevents oversubscription (4 players max)
- TypeScript types provide foundation for message router integration

**No blockers or concerns:**
- ConnectionManager and RoomManager are independent, can be integrated incrementally
- Patterns are established for message routing (next plan will connect to Zod schemas)
- Heartbeat and grace period work passively in background, no manual intervention needed

---
*Phase: 01-websocket-infrastructure*
*Completed: 2026-01-18*
