---
quick_task: 035
subsystem: ui
tags: [react, websocket, routing, state-management]

# Dependency graph
requires:
  - task: 034
    provides: URL-based routing for room joining
provides:
  - Fixed duplicate player creation on room creation flow
affects: lobby, room creation

# Tech tracking
tech-stack:
  added: []
  patterns: [attemptedRoomId guard pattern for URL-based navigation]

key-files:
  created: []
  modified:
    - apps/web/src/handlers/types.ts
    - apps/web/src/handlers/lobbyHandlers.ts
    - apps/web/src/components/Lobby.tsx

key-decisions:
  - 'Set attemptedRoomId in handleRoomCreated to prevent URL join useEffect from triggering'

# Metrics
duration: 1min
completed: 2026-02-06
---

# Quick Task 035: Fix Duplicate Player on Room Creation Summary

**Prevents duplicate player creation by setting attemptedRoomId guard after room creation navigation**

## Performance

- **Duration:** <1 min
- **Started:** 2026-02-06T15:05:08Z
- **Completed:** 2026-02-06T15:06:01Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments

- Added setAttemptedRoomId to HandlerContext interface
- Passed setAttemptedRoomId to handler context in Lobby component
- Called setAttemptedRoomId in handleRoomCreated after navigation
- Fixed duplicate player bug where URL join useEffect triggered after room creation

## Task Commits

1. **Task 1: Add setAttemptedRoomId to HandlerContext and call it in handleRoomCreated** - `bbad94f` (fix)

## Files Created/Modified

- `apps/web/src/handlers/types.ts` - Added setAttemptedRoomId to HandlerContext interface
- `apps/web/src/components/Lobby.tsx` - Passed setAttemptedRoomId to handler context and added to dependency array
- `apps/web/src/handlers/lobbyHandlers.ts` - Called setAttemptedRoomId after navigation in handleRoomCreated

## Decisions Made

**Set attemptedRoomId in handleRoomCreated:** When creating a room, we now set attemptedRoomId to the new room ID immediately after navigating. This prevents the URL join useEffect from triggering because it checks `roomIdFromUrl !== attemptedRoomId` before attempting a join.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward implementation as described in the plan.

## Root Cause Analysis

**The Bug:**

1. User clicks "Create" → sends create_room message
2. Server responds → handleRoomCreated navigates to /room/:roomId
3. URL change causes roomIdFromUrl prop to update
4. URL join useEffect sees roomIdFromUrl !== attemptedRoomId (null)
5. useEffect calls handleJoinRoom → creates duplicate player

**The Fix:**
Setting attemptedRoomId immediately after navigation ensures the URL join useEffect guard condition fails, preventing the duplicate join attempt.

## Next Phase Readiness

- Room creation flow now works correctly with URL-based routing
- URL joining via direct links still functions as expected
- Ready for production use

---

_Quick Task: 035_
_Completed: 2026-02-06_
