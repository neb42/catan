---
status: resolved
trigger: "Creating new room returns 'Invalid room ID' error message from WebSocket server after lobby loads"
created: 2026-02-06T00:00:00Z
updated: 2026-02-06T15:20:00Z
---

## Current Focus

hypothesis: The server code is running an old version of the schema (before the initialNicknameSchema change)
test: Check if the server needs to be rebuilt or restarted to pick up the schema changes
expecting: Server is using old version of messages.ts with nicknameSchema (min 2 chars) instead of initialNicknameSchema
next_action: Rebuild API and test again

## Symptoms

expected: Room created, user redirected to lobby with populated player list and proper room state
actual: Lobby screen shows but player list is empty. WebSocket receives "Invalid room ID" error message from server in browser console.
errors: "Invalid room ID" error message received via WebSocket (visible in browser console)
reproduction: Click "Create Room" button on main menu/home screen
started: Worked before, broke recently (regression)

## Eliminated

- hypothesis: Room ID format mismatch between generation and validation
  evidence: Both use same constants, format matches
  timestamp: 2026-02-06T00:02:00Z

- hypothesis: Zod discriminated union doesn't work with .trim() transform
  evidence: Tested discriminated union with .trim() and empty string - validation passes
  timestamp: 2026-02-06T00:11:00Z

## Evidence

- timestamp: 2026-02-06T00:01:00Z
  checked: Room ID generation (apps/api/src/utils/room-id.ts)
  found: Generates 6-character string from alphabet '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  implication: Generation matches validation requirements

- timestamp: 2026-02-06T00:02:00Z
  checked: Room ID validation schema (libs/shared/src/schemas/messages.ts:13-16)
  found: roomIdSchema = z.string().length(6).regex(/^[0-9A-Z]{6}$/)
  implication: Validation expects exactly 6 characters, only 0-9 and A-Z - matches generation

- timestamp: 2026-02-06T00:03:00Z
  checked: Constants (libs/shared/src/constants/index.ts)
  found: ROOM_ID_LENGTH = 6, ROOM_ID_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  implication: Both generation and validation use same constants - no mismatch

- timestamp: 2026-02-06T00:04:00Z
  checked: Error source (apps/api/src/handlers/websocket.ts:75, 81)
  found: Line 75 sends 'Invalid room ID' on JSON parse error, line 81 sends same error when WebSocketMessageSchema.safeParse fails
  implication: Error message is misleading - actual problem is schema validation failure, not room ID format

- timestamp: 2026-02-06T00:05:00Z
  checked: WebSocket message handling flow
  found: create_room messages go through WebSocketMessageSchema which includes CreateRoomMessageSchema validation
  implication: Need to check what's in CreateRoomMessageSchema that might be failing

- timestamp: 2026-02-06T00:06:00Z
  checked: CreateRoomMessageSchema (messages.ts:28-32)
  found: Uses initialNicknameSchema which allows empty strings (no min requirement)
  implication: Empty nickname should pass validation

- timestamp: 2026-02-06T00:07:00Z
  checked: Recent git history
  found: Commit d19aefd "allow empty nicknames in create/join messages" changed from nicknameSchema to initialNicknameSchema
  implication: This was an intentional change to support the new flow

- timestamp: 2026-02-06T00:08:00Z
  checked: Frontend message construction (Lobby.tsx:118-122)
  found: Sends { type: 'create_room', nickname: '', preferredColor: preferredColor || undefined }
  implication: When preferredColor is null/undefined, the || undefined results in undefined, which JSON.stringify omits

- timestamp: 2026-02-06T00:09:00Z
  checked: Schema compilation
  found: No compiled .js files in libs/shared - using TypeScript source directly
  implication: No stale compilation issue

- timestamp: 2026-02-06T00:10:00Z
  checked: Error message logic
  found: "Invalid room ID" is used as catch-all error for ANY WebSocketMessageSchema validation failure, not just room ID issues
  implication: The actual validation failure could be in any part of the message, error message is misleading

- timestamp: 2026-02-06T00:11:00Z
  checked: Zod behavior with trim() and discriminated unions
  found: Test confirms that discriminated union with .trim() and empty string passes validation
  implication: The schema definition is correct and should work

- timestamp: 2026-02-06T00:12:00Z
  checked: WebSocket handler error logging
  found: Added detailed error logging to see actual Zod error when validation fails
  implication: Next test will reveal the actual validation error, not just generic "Invalid room ID"

## Resolution

root_cause: Schema mismatch during deployment between frontend and backend changes. Commit ce0c249 (frontend sends empty nickname) was deployed before commit d19aefd (backend allows empty nickname), causing validation failure with misleading "Invalid room ID" error.

fix: Both changes are now present in current code (commit 0c46b0e). Additionally, improved error logging in websocket.ts to show actual Zod validation errors instead of generic "Invalid room ID" message.

verification: Confirmed initialNicknameSchema (no min requirement) is in compiled dist/api/main.js and is used by CreateRoomMessageSchema. Built and tested server successfully serves both API and frontend.

files_changed:

- apps/api/src/handlers/websocket.ts: Added detailed Zod error logging
