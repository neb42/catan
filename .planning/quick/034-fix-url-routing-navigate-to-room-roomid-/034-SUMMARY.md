---
phase: quick-034
plan: 01
type: execute
subsystem: frontend-routing
tags: [react-router, url-navigation, websocket]
completed: 2026-02-06

requires:
  - quick-033 (URL-based routing implementation)

provides:
  - navigate-to-room-url
  - url-join-stability

affects: []

tech-stack:
  added: []
  patterns:
    - navigate-through-context
    - attempted-action-tracking

key-files:
  created: []
  modified:
    - apps/web/src/handlers/types.ts
    - apps/web/src/handlers/lobbyHandlers.ts
    - apps/web/src/components/Lobby.tsx

decisions:
  - decision: Pass navigate through HandlerContext
    rationale: Handlers can't use React hooks directly, so navigate function must be passed through context
    phase: quick-034
  - decision: Track attemptedRoomId to prevent re-join loops
    rationale: handleJoinRoom ref changes on every render, causing useEffect to re-run infinitely
    phase: quick-034

metrics:
  duration: ~8 minutes
  tasks_completed: 2/2
  commits: 2
---

# Quick Task 034: Fix URL Routing (Navigate to /room/:roomId)

**One-liner:** Navigate to /room/:roomId after creating lobby and fix player recognition when joining via URL

## What Was Built

Fixed two URL routing bugs:

1. **URL Navigation on Room Creation:** After creating a lobby, the browser now automatically navigates to `/room/:roomId`, making the URL immediately shareable.

2. **URL Join Stability:** Fixed infinite re-join loop caused by useEffect dependency issues when joining a room via URL, ensuring currentPlayerId is set correctly.

## Tasks Completed

| Task | Description                                | Commit  | Files Modified                        |
| ---- | ------------------------------------------ | ------- | ------------------------------------- |
| 1    | Navigate to /room/:roomId on room creation | 91ef76b | types.ts, lobbyHandlers.ts, Lobby.tsx |
| 2    | Fix URL join dependency and re-join loop   | 0340149 | Lobby.tsx                             |

## Technical Implementation

### Task 1: URL Navigation

**Problem:** When creating a lobby, the URL stayed at "/" instead of updating to the shareable "/room/:roomId" format.

**Solution:**

- Added `navigate: (path: string) => void` to HandlerContext interface
- Imported `useNavigate` hook in Lobby component
- Passed navigate function through HandlerContext
- Called `ctx.navigate(\`/room/${message.roomId}\`)` in handleRoomCreated handler

**Result:** URL immediately updates to `/room/:roomId` after creating a lobby, making it shareable.

### Task 2: URL Join Fix

**Problem:** When joining via URL, the useEffect that triggers handleJoinRoom had `handleJoinRoom` in its dependency array. Since handleJoinRoom is a useCallback that changes on every render, this caused the effect to re-run infinitely, preventing currentPlayerId from being set correctly.

**Solution:**

- Added `attemptedRoomId` state to track which room ID we've already attempted to join
- Updated useEffect condition to: `roomIdFromUrl && isConnected && roomIdFromUrl !== attemptedRoomId`
- Set attemptedRoomId before calling handleJoinRoom
- Removed `room`, `roomId`, and `handleJoinRoom` from dependency array
- New dependencies: `[roomIdFromUrl, isConnected, attemptedRoomId]`

**Result:** Join attempt happens exactly once per roomIdFromUrl value, no infinite loops, currentPlayerId is set correctly.

## Key Code Changes

### HandlerContext Interface (`types.ts`)

```typescript
export interface HandlerContext {
  // ... existing setters ...

  // Navigation
  navigate: (path: string) => void;

  // ... existing state values ...
}
```

### Room Created Handler (`lobbyHandlers.ts`)

```typescript
export const handleRoomCreated: MessageHandler = (message, ctx) => {
  // ... set state ...

  // Navigate to room URL
  ctx.navigate(`/room/${message.roomId}`);
};
```

### Lobby Component (`Lobby.tsx`)

```typescript
const navigate = useNavigate();
const [attemptedRoomId, setAttemptedRoomId] = useState<string | null>(null);

// Pass navigate through context
const context: HandlerContext = {
  // ... other context ...
  navigate,
};

// URL-based room joining with stability
useEffect(() => {
  if (roomIdFromUrl && isConnected && roomIdFromUrl !== attemptedRoomId) {
    setAttemptedRoomId(roomIdFromUrl);
    handleJoinRoom(roomIdFromUrl);
  }
}, [roomIdFromUrl, isConnected, attemptedRoomId]);
```

## Testing Notes

Both issues should now be resolved:

### Create Flow

1. Start at "/"
2. Click "Create Lobby"
3. ✅ URL changes to "/room/XXXX"
4. ✅ Can edit nickname and color (currentPlayerId is set)

### URL Join Flow

1. Have another browser create a lobby at /room/YYYY
2. In new browser, navigate directly to /room/YYYY
3. ✅ Successfully join room
4. ✅ Can edit nickname and color (currentPlayerId is set)
5. ✅ No repeated join messages in console

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Blockers:** None

**Follow-up Items:** None - URL routing is now fully functional

## Lessons Learned

1. **Handler Context Pattern:** Handlers can't use React hooks, so functionality like navigation must be passed through context. This maintains separation of concerns while enabling handlers to trigger UI changes.

2. **useEffect Dependency Pitfalls:** Including callback refs in useEffect dependencies can cause infinite loops if those callbacks are recreated on every render. Tracking "attempted" state separately avoids this issue.

3. **Attempted Action Pattern:** Tracking whether an action has been attempted for a specific input (attemptedRoomId) is more stable than checking derived state (room, roomId) which may change due to other reasons.

---

**Status:** ✅ Complete  
**Duration:** ~8 minutes  
**Commits:** 91ef76b, 0340149
