---
quick_task: 035
type: execute
autonomous: true
files_modified:
  - apps/web/src/handlers/types.ts
  - apps/web/src/components/Lobby.tsx
  - apps/web/src/handlers/lobbyHandlers.ts

must_haves:
  truths:
    - 'Creating a room navigates to /room/:roomId without triggering URL join logic'
    - 'Only one player exists after room creation'
    - 'Joining a room via URL still works correctly'
  artifacts:
    - path: 'apps/web/src/handlers/types.ts'
      provides: 'HandlerContext interface with setAttemptedRoomId'
      contains: 'setAttemptedRoomId'
    - path: 'apps/web/src/handlers/lobbyHandlers.ts'
      provides: 'handleRoomCreated calls setAttemptedRoomId'
      pattern: 'setAttemptedRoomId'
  key_links:
    - from: 'apps/web/src/handlers/lobbyHandlers.ts'
      to: 'setAttemptedRoomId'
      via: 'handleRoomCreated after navigate'
      pattern: "ctx\\.navigate.*\\n.*setAttemptedRoomId"
---

<objective>
Fix duplicate player creation when creating a room by preventing the URL join useEffect from triggering after room creation navigation.

**Root cause:**

1. User clicks "Create" → sends create_room message
2. Server responds → handleRoomCreated navigates to /room/:roomId
3. URL change causes roomIdFromUrl prop to update
4. URL join useEffect (line 149-154 in Lobby.tsx) sees roomIdFromUrl !== attemptedRoomId
5. useEffect calls handleJoinRoom → creates duplicate player

**Solution:**
Set attemptedRoomId in handleRoomCreated after navigating to prevent the URL join useEffect from firing.

Purpose: Ensure clean room creation without duplicate players
Output: Single player created when creating a room, URL joining still works for external links
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

# Relevant code

@apps/web/src/handlers/types.ts
@apps/web/src/handlers/lobbyHandlers.ts
@apps/web/src/components/Lobby.tsx
</context>

<tasks>

<task type="auto">
  <name>Add setAttemptedRoomId to HandlerContext and call it in handleRoomCreated</name>
  <files>
    apps/web/src/handlers/types.ts
    apps/web/src/components/Lobby.tsx
    apps/web/src/handlers/lobbyHandlers.ts
  </files>
  <action>
1. **Update HandlerContext interface** (apps/web/src/handlers/types.ts):
   - Add `setAttemptedRoomId: React.Dispatch<React.SetStateAction<string | null>>` to state setters section (after setLastAction, before navigate)

2. **Pass setAttemptedRoomId to handler context** (apps/web/src/components/Lobby.tsx):
   - In handleMessage callback (line 69), add `setAttemptedRoomId` to the context object after `setLastAction`
   - Add `setAttemptedRoomId` to the useCallback dependency array (line 88-104)

3. **Call setAttemptedRoomId in handleRoomCreated** (apps/web/src/handlers/lobbyHandlers.ts):
   - After `ctx.navigate(\`/room/${message.roomId}\`)` (line 24), add:
     ```typescript
     // Prevent URL join useEffect from triggering after room creation
     ctx.setAttemptedRoomId(message.roomId);
     ```

**Why this fixes the bug:**

- When handleRoomCreated runs, it navigates to /room/:roomId AND sets attemptedRoomId
- The URL join useEffect checks `roomIdFromUrl !== attemptedRoomId` before joining
- Since both are now the same roomId, the useEffect won't trigger
- URL joining still works because attemptedRoomId is only set AFTER successful create/join
  </action>
  <verify>

1. Run TypeScript type checking: `npx nx typecheck web`
2. Start the application: `npx nx serve api` and `npx nx serve web`
3. Test room creation:
   - Click "Create Room"
   - Verify only ONE player appears in the lobby
4. Test URL joining:
   - Open a new browser tab
   - Navigate directly to /room/XXXX (use existing room code)
   - Verify player successfully joins
     </verify>
     <done>

- HandlerContext includes setAttemptedRoomId setter
- Lobby passes setAttemptedRoomId to handler context
- handleRoomCreated calls setAttemptedRoomId after navigation
- Creating a room produces only one player
- Joining via URL still works correctly
- TypeScript compiles without errors
  </done>
  </task>

</tasks>

<verification>
## Manual Testing

**Room Creation Flow:**

1. Start fresh session (clear localStorage)
2. Click "Create Room"
3. Observe lobby → should see exactly 1 player (yourself)
4. Check browser console → no duplicate join_room messages

**URL Join Flow:**

1. Copy room code from created room
2. Open new incognito/private window
3. Navigate to `http://localhost:4200/room/XXXX`
4. Enter nickname and confirm
5. Verify successful join (2 players in both windows)

**No Regressions:**

- Color changes work
- Nickname changes work
- Ready toggle works
- Game starts with all players ready
  </verification>

<success_criteria>

- Creating a room results in exactly 1 player (no duplicate)
- URL-based joining still works (external links function correctly)
- attemptedRoomId is set in handleRoomCreated after navigation
- URL join useEffect respects attemptedRoomId guard
- No TypeScript compilation errors
- Manual testing confirms both creation and joining flows work
  </success_criteria>

<output>
After completion, create `.planning/quick/035-fix-duplicate-player-on-room-creation-by/035-SUMMARY.md`
</output>
