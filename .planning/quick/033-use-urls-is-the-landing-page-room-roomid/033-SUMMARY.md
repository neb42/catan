---
phase: quick-033
plan: 01
subsystem: frontend-routing
tags: [react-router, url-routing, room-joining, navigation]

dependencies:
  requires: [quick-032]
  provides: [shareable-room-urls, url-based-navigation]
  affects: []

tech-stack:
  added: []
  patterns: [url-parameters, react-router-v7, declarative-routing]

key-files:
  created: []
  modified:
    - apps/web/src/main.tsx
    - apps/web/src/app/app.tsx
    - apps/web/src/components/Lobby.tsx
    - apps/web/src/components/LandingForm.tsx

decisions:
  - id: 033-01
    title: URL as source of truth for room
    rationale: Replace localStorage roomId auto-fill with URL-based routing for cleaner shareable links
  - id: 033-02
    title: Navigate on join instead of callback
    rationale: LandingForm navigates to /room/:roomId instead of calling onJoin directly, enabling URL-based flow
  - id: 033-03
    title: Auto-join on mount with URL param
    rationale: Lobby component auto-joins room when roomIdFromUrl exists and WebSocket connected

metrics:
  duration: 2m 20s
  completed: 2026-02-06
---

# Quick Task 033: URL-based Room Routing

**One-liner:** React Router URLs for landing page (/) and direct room joining (/room/:roomId) with auto-join on mount

## Summary

Implemented URL-based routing to enable shareable room links. Users can visit `/room/ABC123` to directly join a room, replacing the previous localStorage-based auto-fill approach. The landing page remains at `/` with create/join options, and join button navigates to the room URL which triggers auto-join logic.

## Tasks Completed

| Task | Description                           | Commit  | Files                      |
| ---- | ------------------------------------- | ------- | -------------------------- |
| 1    | Add React Router routes configuration | 5cd4757 | main.tsx                   |
| 2    | Update App to read route params       | 1660a4a | app.tsx                    |
| 3    | Implement URL-based room joining      | 70d1eb1 | Lobby.tsx, LandingForm.tsx |

## Changes Made

### Routing Configuration (main.tsx)

- Added `Routes` and `Route` components from react-router-dom
- Root route `/` renders App component (landing page)
- Route `/room/:roomId` renders App with roomId parameter
- Kept existing MantineProvider and StrictMode wrappers

### App Component (app.tsx)

- Import `useParams` from react-router-dom
- Extract `roomId` from URL parameters using `useParams<{ roomId?: string }>()`
- Pass `roomIdFromUrl` prop to Lobby component
- Kept existing gameStarted conditional rendering

### Lobby Component (Lobby.tsx)

- Added `roomIdFromUrl?: string` prop to component interface
- Removed old localStorage roomId auto-fill logic
- Added useEffect to auto-join room when `roomIdFromUrl` exists and WebSocket connected
- Removed unused `showJoinForm` state variable
- Kept localStorage color preference loading

### LandingForm Component (LandingForm.tsx)

- Import `useNavigate` from react-router-dom
- Navigate to `/room/${roomId.toUpperCase()}` when user submits join form
- Navigation triggers URL change → App re-renders → Lobby auto-joins
- Create flow unchanged (backend assigns roomId)

## User Flow

1. **Landing page**: Visit `/` → see "Start New Expedition" and "Join Existing Map" buttons
2. **Create room**: Click create → backend assigns roomId → lobby view (future: could update URL)
3. **Join via form**: Enter room code → navigate to `/room/ABC123` → auto-join
4. **Direct link**: Visit `/room/ABC123` → auto-join immediately
5. **Reconnection**: Visit `/room/ABC123` with localStorage nickname → backend checks disconnectedPlayers → rejoins if valid

## Reconnection Behavior (Preserved)

Backend logic (from Decisions 12-01, 12-02) remains unchanged:

- Backend checks if nickname in `disconnectedPlayers` Map
- If true, restores player state and sends full game state sync
- If false and game started, returns error (room full or not part of game)
- Frontend displays error using existing `joinError` state

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Blockers:** None

**Recommendations:**

1. Consider updating URL when creating room (currently backend assigns roomId but URL stays at `/`)
2. Consider adding URL sharing button (copy `/room/ABC123` link to clipboard)
3. Consider handling invalid room codes in URL (show error if room doesn't exist)

## Testing Notes

Manual testing verified:

- ✅ `/` shows landing page with create/join options
- ✅ `/room/TESTID` auto-attempts join when WebSocket connected
- ✅ Join form navigates to `/room/:roomId` which triggers auto-join
- ✅ Build succeeds with no errors (`npx nx build web`)
- ✅ Existing reconnection flow preserved (backend checks disconnectedPlayers)

## Files Modified

**apps/web/src/main.tsx**

- Replaced BrowserRouter wrapper with Routes/Route components
- Added root route `/` and room route `/room/:roomId`

**apps/web/src/app/app.tsx**

- Added useParams hook to extract roomId from URL
- Pass roomIdFromUrl to Lobby component

**apps/web/src/components/Lobby.tsx**

- Added roomIdFromUrl prop
- Auto-join room on mount when URL param exists
- Removed localStorage roomId auto-fill
- Removed unused showJoinForm state

**apps/web/src/components/LandingForm.tsx**

- Navigate to /room/:roomId instead of calling onJoin callback
- Enables URL-based join flow
