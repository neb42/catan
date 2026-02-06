---
task: 031
type: execute
wave: 1
depends_on: []
files_modified:
  - libs/shared/src/schemas/messages.ts
  - apps/api/src/handlers/lobby-handlers.ts
  - apps/web/src/components/LobbyPlayerList.tsx
  - apps/web/src/components/Lobby.tsx
  - apps/web/src/handlers/lobbyHandlers.ts
autonomous: true

must_haves:
  truths:
    - 'Players can edit their nickname while in the lobby'
    - 'Nickname changes are validated and broadcast to all players'
    - 'Players cannot set a nickname already taken by another player'
  artifacts:
    - path: 'libs/shared/src/schemas/messages.ts'
      provides: 'Change nickname message schemas'
      exports: ['ChangeNicknameMessageSchema', 'NicknameChangedMessageSchema']
    - path: 'apps/api/src/handlers/lobby-handlers.ts'
      provides: 'Backend handler for nickname changes'
      exports: ['handleChangeNickname']
    - path: 'apps/web/src/components/LobbyPlayerList.tsx'
      provides: 'Editable nickname field for current player'
      min_lines: 200
  key_links:
    - from: 'apps/web/src/components/LobbyPlayerList.tsx'
      to: 'sendMessage'
      via: 'change_nickname message on blur'
      pattern: 'sendMessage.*change_nickname'
    - from: 'apps/api/src/handlers/lobby-handlers.ts'
      to: 'roomManager.broadcastToRoom'
      via: 'nickname_changed broadcast'
      pattern: 'broadcastToRoom.*nickname_changed'
---

<objective>
Enable players to change their nickname while in the lobby view, mirroring the existing color change functionality.

Purpose: Improve UX by allowing players to adjust their nickname after joining without leaving and rejoining the room.
Output: Working nickname editing in lobby with validation and real-time updates.
</objective>

<execution_context>
@/Users/bmcalindin/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/bmcalindin/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@libs/shared/src/schemas/messages.ts
@apps/api/src/handlers/lobby-handlers.ts
@apps/web/src/components/LobbyPlayerList.tsx
@apps/web/src/components/Lobby.tsx
@apps/web/src/handlers/lobbyHandlers.ts
</context>

<tasks>

<task type="auto">
  <name>Add nickname change message schemas and API handler</name>
  <files>
    libs/shared/src/schemas/messages.ts
    apps/api/src/handlers/lobby-handlers.ts
    apps/api/src/handlers/handler-registry.ts
  </files>
  <action>
    1. In messages.ts, add two new schemas following the color change pattern:
       - ChangeNicknameMessageSchema: {type: 'change_nickname', playerId, nickname} where nickname uses existing nicknameSchema
       - NicknameChangedMessageSchema: {type: 'nickname_changed', playerId, nickname: z.string()}
       - Add both to the WebSocketMessageSchema discriminated union

    2. In lobby-handlers.ts, create handleChangeNickname function following handleChangeColor pattern:
       - Validate playerId matches context.playerId
       - Check room exists
       - Check nickname is not already taken (use roomManager.isNicknameTaken but exclude current player)
       - Update player.nickname
       - Broadcast nickname_changed message to all players in room
       - Broadcast updated room_state
       - Update localStorage 'catan_nickname' for persistence

    3. In handler-registry.ts (or wherever messages are routed), register the 'change_nickname' message to call handleChangeNickname

  </action>
  <verify>
    npx nx typecheck api && npx nx typecheck web
  </verify>
  <done>Backend handler exists, TypeScript compiles without errors, message schemas added to shared types</done>
</task>

<task type="auto">
  <name>Add editable nickname field to LobbyPlayerList</name>
  <files>
    apps/web/src/components/LobbyPlayerList.tsx
    apps/web/src/components/Lobby.tsx
  </files>
  <action>
    1. In Lobby.tsx, add handleNicknameChange callback similar to handleColorChange:
       - Takes nickname string parameter
       - Validates nickname length (2-30 characters)
       - Sends {type: 'change_nickname', playerId: currentPlayerId, nickname} message
       - Pass callback to LobbyPlayerList as onNicknameChange prop

    2. In LobbyPlayerList.tsx:
       - Add local state for editing nickname: const [editingNickname, setEditingNickname] = useState(player.nickname)
       - Replace the static Text showing player.nickname with a TextInput when isSelf === true
       - Use controlled input: value={editingNickname}, onChange updates local state
       - On blur or Enter key, call onNicknameChange(editingNickname)
       - For non-current players, keep static Text display
       - Style TextInput to match the Fraunces font and aesthetic (centered, bold, size lg)
       - Add subtle border on hover to indicate editability

  </action>
  <verify>
    npx nx typecheck web && npx nx build web
  </verify>
  <done>Current player sees editable TextInput for their nickname, other players see static text</done>
</task>

<task type="auto">
  <name>Add frontend handler for nickname_changed message</name>
  <files>
    apps/web/src/handlers/lobbyHandlers.ts
  </files>
  <action>
    1. Create handleNicknameChanged function following handleColorChanged pattern:
       - Check message.type === 'nickname_changed'
       - Update ctx.setRoom to map over players and update the matching player's nickname
       - Update useGameStore with updatedRoom
       - Return updated room

    2. Export the handler and ensure it's registered in the main handler dispatch (handleWebSocketMessage)

  </action>
  <verify>
    npx nx typecheck web
  </verify>
  <done>Frontend handler updates player nickname in room state when nickname_changed message received</done>
</task>

</tasks>

<verification>
1. Start dev servers: `npx nx serve api` and `npx nx serve web`
2. Create a room, join with multiple players
3. Click on your nickname in the lobby - it should become editable
4. Change your nickname and press Enter or click away
5. Verify the nickname updates for all players in real-time
6. Verify you cannot use a nickname already taken by another player (should show error)
7. Verify the nickname persists in localStorage (refresh page and rejoin)
</verification>

<success_criteria>

- Player can edit their nickname by clicking the text field in their lobby card
- Nickname changes are validated (2-30 chars, no duplicates)
- All players see nickname updates in real-time
- Nickname persists to localStorage after change
- TypeScript compiles without errors
  </success_criteria>

<output>
After completion, create `.planning/quick/031-change-nickname-field-to-be-set-while-in/031-SUMMARY.md`
</output>
