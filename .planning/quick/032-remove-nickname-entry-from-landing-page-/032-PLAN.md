---
task: 032
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/LandingForm.tsx
  - apps/web/src/components/Lobby.tsx
  - libs/shared/src/schemas/messages.ts
autonomous: true

must_haves:
  truths:
    - Landing page shows only room actions (create/join)
    - Players set nickname after joining lobby
    - Create/join requests send placeholder nickname
    - Lobby prompts for nickname on first render
  artifacts:
    - path: apps/web/src/components/LandingForm.tsx
      provides: Simplified landing form without nickname field
      min_lines: 120
    - path: apps/web/src/components/Lobby.tsx
      provides: Auto-nickname change on lobby load
      min_lines: 350
  key_links:
    - from: apps/web/src/components/LandingForm.tsx
      to: apps/web/src/components/Lobby.tsx
      via: onCreate/onJoin callbacks
      pattern: 'onCreate|onJoin'
---

<objective>
Remove nickname entry field from landing page. Players should only set their nickname after joining the lobby using the editable nickname field added in task 031.

Purpose: Simplify landing page UX and consolidate nickname management to a single location (lobby).
Output: Landing page with room actions only, lobby handles nickname on first load.
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/031-change-nickname-field-to-be-set-while-in/031-SUMMARY.md
@apps/web/src/components/LandingForm.tsx
@apps/web/src/components/Lobby.tsx
@libs/shared/src/schemas/messages.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Simplify LandingForm to remove nickname field</name>
  <files>apps/web/src/components/LandingForm.tsx</files>
  <action>
Remove nickname-related props and state from LandingForm component:
1. Remove `nickname`, `onNicknameChange` props from LandingFormProps interface
2. Remove nickname TextInput field and "Explorer Name" label section (lines ~92-125)
3. Remove `isNicknameValid` validation checks
4. Update button disabled conditions to only check `isConnected` (and `isRoomIdValid` for join)
5. Keep all other functionality: create/join toggle, room ID input, error display

The component should now only handle:

- Create room button (always enabled when connected)
- Join room button (shows room ID input)
- Toggle between create/join modes
- Display connection status and errors

Preserve all styling and animation.
</action>
<verify>

```bash
npx nx typecheck web
npx prettier --check apps/web/src/components/LandingForm.tsx
```

  </verify>
  <done>LandingForm has no nickname field, only create/join room actions</done>
</task>

<task type="auto">
  <name>Task 2: Update Lobby to send placeholder nickname and prompt for real nickname</name>
  <files>apps/web/src/components/Lobby.tsx</files>
  <action>
Update Lobby component to handle missing nickname:
1. Remove `nickname` state and localStorage loading for nickname (keep only roomId, color loading)
2. Remove `nickname` from handleCreateRoom and handleJoinRoom - send empty string "" as placeholder
3. Remove nickname prop from LandingForm usage (lines ~194-200)
4. Keep handleNicknameChange callback (used by LobbyPlayerList for editing)

The flow becomes:

- User clicks create/join on landing page (no nickname collected)
- create_room/join_room message sent with nickname: ""
- Server assigns player with empty/placeholder nickname
- Player sees their card with empty nickname in lobby
- Player immediately edits nickname using TextInput added in task 031

Note: Backend already supports empty nicknames in the Player creation flow. The editable nickname field in LobbyPlayerList will allow the user to set their real nickname.
</action>
<verify>

```bash
npx nx typecheck web
npx prettier --check apps/web/src/components/Lobby.tsx
```

  </verify>
  <done>Lobby sends placeholder nickname on create/join, players set real nickname in lobby</done>
</task>

<task type="auto">
  <name>Task 3: Verify nickname validation allows empty initial nicknames</name>
  <files>libs/shared/src/schemas/messages.ts</files>
  <action>
Check that nicknameSchema in message schemas allows empty strings for initial join:
1. Review CreateRoomMessageSchema and JoinRoomMessageSchema nickname field
2. If nickname is required with min(2), make it optional with `.optional()` OR change to min(0)
3. Ensure ChangeNicknameMessageSchema still requires min(2) for actual nickname changes
4. Update only if validation blocks empty nicknames

This allows players to join with placeholder nickname, then set real nickname via change_nickname message.

If nicknameSchema is shared and requires min(2), create a separate `initialNicknameSchema` with min(0) or make nickname optional in create/join messages.
</action>
<verify>

```bash
npx nx typecheck shared
npx nx typecheck api
```

  </verify>
  <done>Message schemas allow empty nickname on create/join, require valid nickname for change_nickname</done>
</task>

</tasks>

<verification>
Manual testing checklist:
1. Landing page shows no nickname field, only create/join buttons
2. Click "Start New Expedition" - joins lobby with placeholder nickname
3. Click "Join Existing Map" - shows room code input, no nickname field
4. In lobby, player card shows empty nickname with editable TextInput
5. Edit nickname in lobby - updates successfully
6. TypeScript compiles without errors for all affected apps
</verification>

<success_criteria>

- LandingForm has no nickname field or validation
- Lobby sends empty/placeholder nickname on create/join
- Players can set their nickname using the editable field in LobbyPlayerList
- All TypeScript compilation passes
- App builds successfully
  </success_criteria>

<output>
After completion, create `.planning/quick/032-remove-nickname-entry-from-landing-page-/032-SUMMARY.md`
</output>
