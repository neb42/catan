---
phase: 01-websocket-infrastructure
plan: 03
subsystem: infra
tags: [websocket, message-routing, validation, zod, typescript, crypto]

# Dependency graph
requires:
  - phase: 01-websocket-infrastructure
    plan: 01
    provides: "Zod message schemas with discriminated unions for WebSocket validation"
  - phase: 01-websocket-infrastructure
    plan: 02
    provides: "ConnectionManager with heartbeat and RoomManager with capacity enforcement"
provides:
  - "MessageRouter for type-safe message validation and routing"
  - "Integrated WebSocket server with ConnectionManager, RoomManager, and MessageRouter"
  - "End-to-end message flow: Connection → HANDSHAKE → JOIN_ROOM with validation"
  - "1MB maxPayload limit for DoS prevention"
  - "Error handling with ZodError conversion to ERROR messages"
affects: [01-websocket-infrastructure, lobby-management, game-state]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Message routing with Zod discriminated union for type-safe handler dispatch"
    - "Error message standardization with code + message + details structure"
    - "Server-generated messageId (crypto.randomUUID) and timestamp for all outbound messages"
    - "Graceful error handling: invalid messages don't crash server, trigger ERROR responses"

key-files:
  created:
    - apps/api/src/websocket/message-router.ts
  modified:
    - apps/api/src/websocket/index.ts

key-decisions:
  - "Use crypto.randomUUID() for messageId generation (consistent with clientId, no additional dependencies)"
  - "Set maxPayload to 1MB to prevent DoS attacks (default 100MB is vulnerability)"
  - "ZodError.issues contains validation errors, not .errors (TypeScript property name)"
  - "Remove unused sendMessage helper to avoid dead code warnings"
  - "Clean up managers in closeWebSocket to prevent memory leaks"

patterns-established:
  - "MessageRouter pattern: Validate → Route → Delegate (no direct WebSocket access)"
  - "Error response pattern: All errors include code + human message + optional details"
  - "Connection flow: WebSocket connect → addConnection → HANDSHAKE → CLIENT_ID"
  - "Disconnection flow: WebSocket close → removeConnection → leaveRoom for full cleanup"

# Metrics
duration: 2min
completed: 2026-01-18
---

# Phase 01 Plan 03: Message Router Integration Summary

**MessageRouter validates and routes WebSocket messages with Zod schemas, integrated into server with 1MB DoS protection**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-18T14:01:02Z
- **Completed:** 2026-01-18T14:03:21Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Built MessageRouter class with Zod-validated message routing and type-safe handler dispatch
- Integrated ConnectionManager, RoomManager, and MessageRouter into WebSocket server initialization
- Implemented end-to-end message flow: HANDSHAKE assigns client IDs, JOIN_ROOM enforces capacity
- Configured 1MB maxPayload limit to prevent DoS attacks (down from 100MB default)
- Established error handling pattern: invalid messages trigger ERROR responses with validation details
- Removed old sequential connection tracking in favor of UUID-based management

## Task Commits

Each task was committed atomically:

1. **Task 1: Build message router with validation and handler dispatch** - `141ebc1` (feat)
2. **Task 2: Update WebSocket server initialization to use new infrastructure** - `8d693eb` (feat)

## Files Created/Modified
- `apps/api/src/websocket/message-router.ts` - Type-safe message routing with Zod validation and error handling
- `apps/api/src/websocket/index.ts` - Server initialization with manager integration and maxPayload configuration

## Decisions Made

**Use crypto.randomUUID() for messageId generation:**
- Consistent with clientId generation (both use native crypto module)
- No additional dependencies needed (no uuid package required)
- Sufficient for correlation and debugging (ordering not required)
- RESEARCH.md noted ULID only needed for timestamp-based ordering, which isn't needed here

**Set maxPayload to 1MB:**
- Default 100MB is a DoS vector (client can send massive payloads and crash server)
- 1MB sufficient for all text-based game messages (JSON state updates fit easily)
- RESEARCH.md recommended this limit for security
- Prevents abuse while allowing normal operation

**Use ZodError.issues not .errors:**
- TypeScript property is `issues`, not `errors`
- Contains array of validation error objects with path, message, etc.
- Caught during compilation, fixed before commit

**Remove unused sendMessage helper:**
- Initially added for consistency, but not actually needed
- All message sending done through type-specific handlers (handleHandshake, handleJoinRoom, sendError)
- Removing avoids TypeScript unused variable warning
- Keeps codebase clean

**Clean up managers in closeWebSocket:**
- Call connectionManager.cleanup() to stop heartbeat interval
- Set all manager references to null to allow garbage collection
- Prevents memory leaks if server restarted multiple times
- Proper resource cleanup pattern

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation followed plan smoothly. Zod schemas and managers integrated cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for next phase:**
- Full message pipeline operational: Validation → Routing → State Management → Response
- HANDSHAKE flow assigns/restores client IDs with grace period support
- JOIN_ROOM flow enforces capacity and broadcasts to room members
- Error handling comprehensive: malformed JSON, invalid schemas, business logic failures all handled
- Infrastructure complete for lobby and game state management

**No blockers or concerns:**
- All WebSocket infrastructure components integrated and working together
- Message validation prevents bad data from entering system
- DoS protection configured (maxPayload limit)
- Ready to build lobby features (player ready state, color selection, game start) on top of this foundation

---
*Phase: 01-websocket-infrastructure*
*Completed: 2026-01-18*
