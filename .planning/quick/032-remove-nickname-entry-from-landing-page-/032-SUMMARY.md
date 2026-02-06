---
task: 032
subsystem: lobby
tags: [ux, landing-page, forms, validation]
completed: 2026-02-06
duration: ~2 minutes

requires:
  - Task 031 editable nickname functionality in lobby
  - WebSocket message handling infrastructure
  - Lobby player list component

provides:
  - Simplified landing page with room actions only
  - Placeholder nickname flow for initial join
  - Consolidated nickname management in lobby

affects:
  - Future landing page UX improvements
  - Onboarding flow simplicity

key-files:
  created: []
  modified:
    - apps/web/src/components/LandingForm.tsx
    - apps/web/src/components/Lobby.tsx
    - libs/shared/src/schemas/messages.ts

decisions:
  - decision: Send empty string as placeholder nickname
    rationale: Simplest approach, backend already handles empty nicknames in Player creation
    alternatives:
      [Generate random placeholder like "Player123", Send null value]
  - decision: Create separate initialNicknameSchema for create/join
    rationale: Allows empty nicknames on join while maintaining validation on explicit nickname changes
    alternatives: [Make nickname optional, Remove validation entirely]
  - decision: Remove nickname state entirely from Lobby
    rationale: No longer needed since nickname is set after joining via LobbyPlayerList
    alternatives: [Keep state but don't use it, Use for default placeholder]
---

# Quick Task 032: Remove Nickname Entry from Landing Page

**One-liner:** Landing page now shows only room actions; players set nickname in lobby using editable field from task 031

## Summary

Simplified the landing page UX by removing the nickname entry field. Players now only choose between creating or joining a room on the landing page. After joining, they immediately set their nickname using the editable TextInput field in LobbyPlayerList (added in task 031). This consolidates all nickname management to a single location and reduces friction in the onboarding flow.

## Implementation

### Frontend Changes

**LandingForm Component (apps/web/src/components/LandingForm.tsx)**

Removed nickname-related functionality:

- Removed `nickname` and `onNicknameChange` props from interface
- Removed `MIN_NICKNAME_LENGTH` and `MAX_NICKNAME_LENGTH` constants
- Removed nickname TextInput field and "Explorer Name" label section
- Removed `isNicknameValid` validation checks
- Updated button disabled conditions to only check `isConnected` (and `isRoomIdValid` for join)
- Preserved all other functionality: create/join toggle, room ID input, error display, styling

Result: Clean landing page with only:

- Title and tagline
- "Start New Expedition" button (create room)
- "Join Existing Map" button (shows room code input)
- Toggle between modes
- Connection status and error display

**Lobby Component (apps/web/src/components/Lobby.tsx)**

Updated to send placeholder nicknames:

- Removed `nickname` state and `setNickname` setter
- Removed savedNickname from localStorage loading (kept roomId and color)
- Updated `handleCreateRoom` to send empty string `""` as nickname
- Updated `handleJoinRoom` to send empty string `""` as nickname
- Removed `nickname` and `onNicknameChange` props from LandingForm usage
- Kept `handleNicknameChange` callback for LobbyPlayerList (used after joining)

Flow:

1. User clicks create/join on landing page (no nickname collected)
2. Lobby sends create_room/join_room message with nickname: ""
3. Server creates player with empty/placeholder nickname
4. Player sees their card with empty nickname in lobby
5. Player edits nickname using TextInput in LobbyPlayerList

### Backend Changes

**Message Schemas (libs/shared/src/schemas/messages.ts)**

Created separate schema for initial nicknames:

- Added `initialNicknameSchema`: `z.string().trim().max(30)` (no min length)
- Updated `CreateRoomMessageSchema` to use `initialNicknameSchema`
- Updated `JoinRoomMessageSchema` to use `initialNicknameSchema`
- Kept `ChangeNicknameMessageSchema` using `nicknameSchema` with min(2) validation

This allows empty nicknames on create/join but still enforces proper validation when players explicitly change their nickname.

## Validation

### Client-Side

- Landing form: No nickname validation (field removed)
- Lobby: Empty string sent to server on create/join
- Nickname editing: Validated in LobbyPlayerList (2-30 chars, from task 031)

### Server-Side

- Create/join: `initialNicknameSchema` allows empty strings (0-30 chars)
- Change nickname: `nicknameSchema` requires 2-30 characters
- Uniqueness: Still enforced on explicit nickname changes

## Technical Details

### User Flow

**Before (Task 031):**

1. Enter nickname on landing page
2. Click create/join
3. Join lobby with that nickname
4. Optionally edit nickname in lobby

**After (Task 032):**

1. Click create/join on landing page (no nickname entry)
2. Join lobby with empty nickname
3. Immediately edit nickname in lobby (required action)

### State Changes

- Removed: `nickname` state in Lobby component
- Removed: savedNickname localStorage loading
- Removed: nickname props in LandingForm
- Kept: `handleNicknameChange` callback in Lobby (used by LobbyPlayerList)
- Kept: localStorage persistence of nickname on change (for reconnection)

### Schema Evolution

```typescript
// Before: Both create/join and change_nickname used same schema
const nicknameSchema = z.string().trim().min(2).max(30);

// After: Separate schemas for different contexts
const initialNicknameSchema = z.string().trim().max(30); // Create/join
const nicknameSchema = z.string().trim().min(2).max(30); // Change nickname
```

## Testing Checklist

Verified functionality:

- [x] Landing page has no nickname field
- [x] "Start New Expedition" button only checks isConnected
- [x] "Join Existing Map" shows room code input, no nickname field
- [x] Create room works with empty nickname
- [x] Join room works with empty nickname
- [x] Player card shows empty nickname in lobby
- [x] Player can set nickname via TextInput in LobbyPlayerList
- [x] TypeScript compiles without errors
- [x] Web and API build successfully

## Deviations from Plan

None - plan executed exactly as written.

## Next Steps

No follow-up required. Feature is complete and ready for use.

## Performance & Edge Cases

**Performance:** No performance impact - same WebSocket message count, simplified state management

**Edge Cases Handled:**

- Empty nicknames on join: Allowed by backend, expected behavior
- Nickname validation on change: Still enforced via ChangeNicknameMessageSchema
- Multiple players with empty nickname: Allowed temporarily until players set unique nicknames

**Edge Cases Not Handled (Future Considerations):**

- No visual prompt to set nickname: Players might not realize they can edit it (could add placeholder text or tooltip)
- No enforcement of unique nicknames before game start: Players could theoretically start game with duplicate empty nicknames (backend allows but could add pre-game validation)

## Commits

| Commit  | Message                                                  | Files           |
| ------- | -------------------------------------------------------- | --------------- |
| f57f004 | feat(032): remove nickname field from LandingForm        | LandingForm.tsx |
| ce0c249 | feat(032): send empty nickname on create/join room       | Lobby.tsx       |
| d19aefd | feat(032): allow empty nicknames in create/join messages | messages.ts     |
