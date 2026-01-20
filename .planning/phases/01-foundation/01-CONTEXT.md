# Phase 1: Foundation - Context

**Gathered:** 2026-01-20  
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish shared contracts and room infrastructure. Users can create game rooms, join with room IDs, set nicknames, and see real-time lobby updates via WebSocket. This phase delivers the foundation for multiplayer connectivity — no game logic yet.

</domain>

<decisions>
## Implementation Decisions

### Room Lifecycle & Capacity

**Player limits:**
- Maximum 4 players per room
- Minimum 3 players required to start game

**Room persistence:**
- Rooms expire only when all players disconnect
- 3-minute grace period after last player disconnects
- During grace period, room remains active and joinable
- After grace period expires, room is deleted and ID can be reused

**Disconnect behavior:**
- Lobby phase: Individual disconnects free the slot immediately (no grace period)
- Mid-game: Individual disconnects have infinite grace period (handled in later phases)
- No visual countdown indicator for grace periods

**Joining rules:**
- Rooms can be joined anytime during lobby phase
- Rooms lock when game starts (no mid-game joins)
- No "host" or "room creator" role — all players equal

### Nickname & Identity Rules

**Validation:**
- Minimum 2 characters, maximum 30 characters
- All characters allowed (letters, numbers, spaces, special chars, emojis)
- Leading and trailing whitespace automatically trimmed
- No profanity filtering or content moderation

**Uniqueness:**
- Nicknames must be unique within each room
- Duplicate nickname shows error: "Nickname taken" (no suggestions)

**Mutability:**
- Nicknames locked after joining — cannot change in lobby or during game
- On rejoin after disconnect, must use same nickname
- Nickname conflicts on rejoin: Most recent player to successfully join keeps the nickname

### Lobby State & Visibility

**Player information displayed:**
- Nickname
- Connection status (connected/disconnected)
- Ready indicator (ready/not ready)
- Selected color

**Player interactions:**
- Manual "Ready" button — players must explicitly mark ready
- Players can toggle ready status (unmark back to "not ready")
- Game starts when: all players ready AND at least 3 players in lobby
- No lobby chat feature

**Visual elements:**
- Static player list (no typing indicators, idle status, or activity indicators)
- Player count display (e.g., "3/4 players")
- Color selection: Players choose their own color

### Error Scenarios & Recovery

**Connection handling:**
- Brief network blips: Auto-reconnect silently in background
- Failed reconnect: Show "reconnecting..." state indefinitely (no timeout)
- Visual indicator displayed when WebSocket connection drops

**Rejoin behavior:**
- Lobby disconnects: Automatic rejoin with same room ID
- Ready status resets to "not ready" after successful rejoin

**Error messages:**
- Invalid/non-existent room ID: "Room not found"
- Room at capacity: "Room is full"
- Nickname already taken: "Nickname taken"
- No specific "Room expired" message (use generic "Room not found")

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for UI/UX implementation within the constraints above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 1-Foundation*  
*Context gathered: 2026-01-20*
