---
phase: quick-034
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/handlers/lobbyHandlers.ts
  - apps/web/src/components/Lobby.tsx
autonomous: true

must_haves:
  truths:
    - 'Creating a lobby navigates to /room/:roomId URL'
    - 'currentPlayerId is set correctly when joining via URL'
    - 'Player is recognized as part of the lobby after URL join'
  artifacts:
    - path: 'apps/web/src/handlers/lobbyHandlers.ts'
      provides: 'Navigation on room_created'
      min_lines: 20
    - path: 'apps/web/src/components/Lobby.tsx'
      provides: 'Fixed auto-join dependency array'
      min_lines: 140
  key_links:
    - from: 'apps/web/src/handlers/lobbyHandlers.ts'
      to: 'react-router navigate'
      via: 'handleRoomCreated calls navigate'
      pattern: "navigate\\(\\/room"
    - from: 'apps/web/src/components/Lobby.tsx'
      to: 'handleJoinRoom'
      via: 'useEffect tracks attemptedRoomId'
      pattern: 'attemptedRoomId.*handleJoinRoom'
---

<objective>
Fix two URL routing bugs: (1) navigate to /room/:roomId after creating lobby, (2) fix player recognition when joining via URL.

Purpose: Enable shareable room URLs and ensure consistent player state across both create and join flows.
Output: Working URL navigation and proper currentPlayerId assignment for URL-based joins.
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@apps/web/src/handlers/lobbyHandlers.ts
@apps/web/src/components/Lobby.tsx
</context>

<tasks>

<task type="auto">
  <name>Navigate to /room/:roomId on room creation</name>
  <files>apps/web/src/handlers/lobbyHandlers.ts</files>
  <action>
In `handleRoomCreated`, add navigation to `/room/${message.roomId}` after successful room creation.

1. Import `useNavigate` from react-router-dom at the top of the file
2. Get navigate function reference from window or create a navigation mechanism
3. After setting roomId and before returning, call `window.history.pushState()` or pass navigate through context

**WAIT - handlers can't use React hooks. Better approach:**

The handler receives `ctx` (HandlerContext). We need to add a navigate function to the context.

1. Check `apps/web/src/handlers/types.ts` for HandlerContext definition
2. Add `navigate: (path: string) => void` to HandlerContext interface
3. In `Lobby.tsx` where HandlerContext is created (lines 66-81), add navigate from `useNavigate()` hook
4. In `handleRoomCreated` (line 7-22), after setting state, call `ctx.navigate(\`/room/${message.roomId}\`)`

This follows the existing pattern where sendMessage is passed through context.
</action>
<verify>
Test: Create a new lobby, verify URL changes from "/" to "/room/ABCD" (or similar room code)
Check browser console for no errors
</verify>
<done>URL updates to /room/:roomId immediately after creating a lobby</done>
</task>

<task type="auto">
  <name>Fix URL join dependency issue</name>
  <files>apps/web/src/components/Lobby.tsx</files>
  <action>
The useEffect at lines 144-148 has a dependency issue - it re-runs on every render because `handleJoinRoom` is in the dependency array and changes every render.

The problem: When joining via URL, the useEffect fires correctly, but then `handleJoinRoom` changes (because it's useCallback with dependencies), causing the effect to re-run, but by then `room` or `roomId` exists, so the condition fails and currentPlayerId never gets set properly.

Solution: Track whether we've already attempted to join this specific roomId.

1. Add state: `const [attemptedRoomId, setAttemptedRoomId] = useState<string | null>(null)`
2. Update the useEffect condition to:
   ```typescript
   if (
     roomIdFromUrl &&
     isConnected &&
     !attemptedRoomId &&
     roomIdFromUrl !== attemptedRoomId
   ) {
     setAttemptedRoomId(roomIdFromUrl);
     handleJoinRoom(roomIdFromUrl);
   }
   ```
3. Update dependency array to: `[roomIdFromUrl, isConnected, attemptedRoomId]`
4. Remove `room`, `roomId`, and `handleJoinRoom` from dependencies

This ensures the join attempt happens exactly once per roomIdFromUrl value.
</action>
<verify>
Test 1: Navigate directly to /room/ABCD (where ABCD is a valid room code), verify:

- Join succeeds
- currentPlayerId is set (your player card is editable)
- No infinite re-join loop in console

Test 2: Create lobby, verify URL updates and player is recognized
</verify>
<done>
Joining via URL (/room/:roomId) correctly sets currentPlayerId and recognizes the player as part of the lobby without re-triggering the join
</done>
</task>

</tasks>

<verification>
## Manual Testing

1. **Create flow:**
   - Start at "/"
   - Click "Create Lobby"
   - Verify URL changes to "/room/XXXX"
   - Verify you can edit your nickname and color (currentPlayerId is set)

2. **URL join flow:**
   - Have another browser/tab create a lobby at /room/YYYY
   - In new browser, navigate directly to /room/YYYY
   - Verify you successfully join
   - Verify you can edit your nickname and color (currentPlayerId is set)
   - Check browser console for no repeated join messages

3. **Edge cases:**
   - Refresh page while in lobby (should attempt reconnection)
   - Navigate to /room/INVALID (should show landing page with error)
     </verification>

<success_criteria>

- Creating a lobby navigates browser to /room/:roomId
- URL is immediately shareable after creation
- Joining via URL correctly assigns currentPlayerId
- No infinite loops or repeated join attempts
- Both create and join flows result in fully functional lobby experience
  </success_criteria>

<output>
After completion, create `.planning/quick/034-fix-url-routing-navigate-to-room-roomid-/034-SUMMARY.md`
</output>
