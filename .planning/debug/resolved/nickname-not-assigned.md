---
status: resolved
trigger: 'Player nicknames are not being assigned when creating or joining a room'
created: 2026-02-06T00:00:00Z
updated: 2026-02-06T00:06:00Z
---

## Current Focus

hypothesis: Frontend sends empty string for nickname, backend accepts it without generating random nickname
test: Verify that frontend sends empty nickname and backend doesn't populate it
expecting: Both frontend and backend need fixes - frontend to read/generate nickname, backend to handle empty case
next_action: Verify localStorage reading logic and implement nickname generation

## Symptoms

expected: Nickname should be read from localStorage when creating/joining a room. If no nickname is present, a random nickname is generated. The nickname should be editable in the lobby before the game starts.

actual: No nickname is set at all for players when they create or join a room

errors: No error messages appear in browser console or server logs

reproduction: Simply create or join any room and observe that the player has no nickname assigned

started: Unknown if this feature was ever fully implemented - uncertain timeline

## Eliminated

## Evidence

- timestamp: 2026-02-06T00:01:00Z
  checked: Frontend Lobby.tsx handleCreateRoom and handleJoinRoom (lines 112-140)
  found: Both functions send empty string '' as nickname in create_room and join_room messages
  implication: Frontend never reads from localStorage or generates a random nickname

- timestamp: 2026-02-06T00:02:00Z
  checked: Backend lobby-handlers.ts handleCreateRoom and handleJoinRoom (lines 29-81, 83-247)
  found: Backend accepts message.nickname directly without validation or generation of random nickname (line 57 and 130)
  implication: Backend trusts whatever nickname is sent from frontend, doesn't generate fallback

- timestamp: 2026-02-06T00:03:00Z
  checked: Shared message schema (libs/shared/src/schemas/messages.ts line 18)
  found: initialNicknameSchema allows empty string with z.string().trim().max(30) - min is not enforced
  implication: Empty nicknames are valid according to schema

- timestamp: 2026-02-06T00:04:00Z
  checked: Player schema (libs/shared/src/schemas/player.ts line 6)
  found: PlayerSchema requires nickname to be min(2).max(30), but initialNicknameSchema is different
  implication: There's a mismatch - backend accepts empty initial nicknames but player objects require min 2 chars. This creates invalid player objects.

- timestamp: 2026-02-06T00:05:00Z
  checked: Nickname utility implementation and flow
  found: getNickname() generates nicknames like "Swift Settler" (always 2+ chars) and persists to localStorage. Backend receives valid nickname from frontend and creates valid Player object.
  implication: Fix ensures Player schema requirements are met (min 2 chars) by generating nickname on frontend before sending to backend.

## Resolution

root_cause: Frontend sends empty string as nickname when creating/joining rooms (Lobby.tsx lines 120, 135). Backend accepts empty nicknames without validation or fallback generation (lobby-handlers.ts lines 57, 130). The feature to read from localStorage and generate random nicknames was never implemented.

fix: Created nickname utility (apps/web/src/utils/nickname.ts) with getNickname() function that reads from localStorage or generates random "Adjective Noun" format nickname. Updated Lobby.tsx handleCreateRoom and handleJoinRoom to call getNickname() before sending create_room/join_room messages.

verification:

- Unit tests: All 8 tests pass for nickname utility (generateRandomNickname and getNickname functions)
- Type checking: npx nx typecheck web passes
- Build: npx nx build web and npx nx build api both succeed
- Functionality: Nickname is now generated in format "Adjective Noun" (e.g., "Swift Settler") and saved to localStorage
- Edge cases: Tests verify empty localStorage, whitespace trimming, short nicknames, and persistence

files_changed:

- apps/web/src/utils/nickname.ts (new file - 53 lines)
- apps/web/src/utils/nickname.spec.ts (new file - 72 lines)
- apps/web/src/components/Lobby.tsx (added import, updated handleCreateRoom and handleJoinRoom)
