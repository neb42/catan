# Requirements: Catan Online

**Defined:** 2026-01-18
**Core Value:** Friends can play Settlers of Catan together online

## v0.1 Requirements - Lobby

Requirements for initial lobby release. Each maps to roadmap phases.

### Entry

- [ ] **ENTRY-01**: User sees landing page with nickname input field
- [ ] **ENTRY-02**: User cannot proceed without entering a nickname
- [ ] **ENTRY-03**: User receives error if nickname is already taken in lobby
- [ ] **ENTRY-04**: User joins lobby after entering unique nickname

### Lobby State

- [ ] **LOBBY-01**: User sees real-time list of all players in lobby
- [ ] **LOBBY-02**: User sees new players appear when they join
- [ ] **LOBBY-03**: User sees players disappear when they leave
- [ ] **LOBBY-04**: Lobby enforces 3-4 player capacity
- [ ] **LOBBY-05**: User sees player count (X/4 players)
- [ ] **LOBBY-06**: User can leave lobby via explicit action

### Player Coordination

- [ ] **COORD-01**: User can select a color for their player piece
- [ ] **COORD-02**: User can change color selection before readying
- [ ] **COORD-03**: User sees colors selected by other players
- [ ] **COORD-04**: User sees visual indicator of who is ready vs not ready
- [ ] **COORD-05**: User can toggle ready status with a button
- [ ] **COORD-06**: When user readies with duplicate color, other player's color is reset
- [ ] **COORD-07**: User cannot ready until at least 3 players in lobby

### Game Initialization

- [ ] **INIT-01**: 10-second countdown starts automatically when all players are ready
- [ ] **INIT-02**: User sees countdown timer with remaining seconds
- [ ] **INIT-03**: User can un-ready during countdown to cancel it
- [ ] **INIT-04**: Countdown resets when any player un-readies
- [ ] **INIT-05**: When countdown reaches zero, user transitions to placeholder game screen
- [ ] **INIT-06**: Placeholder screen shows "Game starting..." message

### Connection Management

- [ ] **CONN-01**: When user disconnects, they are removed from lobby
- [ ] **CONN-02**: Other users see disconnected player disappear from player list
- [ ] **CONN-03**: When user arrives during active game, they see "Game in progress" message
- [ ] **CONN-04**: Late arrivals are blocked from joining active game

## v0.2 Requirements - Lobby Enhancements

Deferred to future release. Tracked but not in current roadmap.

### Sharing & Persistence

- **SHARE-01**: User can generate shareable lobby link/code
- **SHARE-02**: User can copy lobby link with one click
- **SHARE-03**: Friend can join lobby via shared link
- **SHARE-04**: Lobby persists with unique URL

### Reconnection

- **RECONN-01**: User can reconnect to lobby after disconnect
- **RECONN-02**: User's color and ready state are restored on reconnect
- **RECONN-03**: Other users see reconnected player reappear in list

### Polish

- **POLISH-01**: User sees animations when players join/leave
- **POLISH-02**: User hears sound effects for ready state changes
- **POLISH-03**: User hears countdown sound effects
- **POLISH-04**: User can send chat messages in lobby

## Future Requirements - Game Mechanics

Deferred to post-lobby milestones.

### Board & Setup

- **BOARD-01**: Random hex board generation (19 hexes)
- **BOARD-02**: Number token placement per Catan rules
- **BOARD-03**: Initial settlement and road placement

### Gameplay

- **GAME-01**: Resource production on dice roll
- **GAME-02**: Building: roads, settlements, cities
- **GAME-03**: Development cards: knights, VP, road building, year of plenty, monopoly
- **GAME-04**: Trading: bank (4:1), ports (3:1, 2:1), player-to-player
- **GAME-05**: Robber mechanics on rolling 7
- **GAME-06**: Longest road tracking
- **GAME-07**: Largest army tracking
- **GAME-08**: Victory point tracking (win at 10 VP)
- **GAME-09**: Round-robin turn order

### Reliability

- **REL-01**: Game pause on player disconnect
- **REL-02**: Reconnection support during active game
- **REL-03**: Post-game results screen
- **REL-04**: New game / exit options after game ends

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Shareable lobby links | Deferred to v0.2 - test locally first with all players on localhost |
| Reconnection after disconnect | Deferred to v0.2 - v0.1 treats disconnect as leave |
| Lobby chat | Friends use external voice/chat (Discord/Zoom) |
| Player kick (host only) | Not needed for v0.1 testing |
| Host migration | High complexity, friends-only context makes it low priority |
| Spectator mode | Not needed for friends-only play |
| Multiple concurrent lobbies | Single lobby sufficient for v0.1 |
| User accounts | Nicknames only, no persistence |
| Public matchmaking | Friends only via shared URL (future) |
| 5-6 player expansion | Deferred to future milestone |
| Seafarers expansion | v2+ |
| Cities & Knights expansion | v2+ |
| Mobile app | Web only for v1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ENTRY-01 | Phase 2 | Pending |
| ENTRY-02 | Phase 2 | Pending |
| ENTRY-03 | Phase 2 | Pending |
| ENTRY-04 | Phase 2 | Pending |
| LOBBY-01 | Phase 3 | Pending |
| LOBBY-02 | Phase 3 | Pending |
| LOBBY-03 | Phase 3 | Pending |
| LOBBY-04 | Phase 3 | Pending |
| LOBBY-05 | Phase 3 | Pending |
| LOBBY-06 | Phase 3 | Pending |
| COORD-01 | Phase 4 | Pending |
| COORD-02 | Phase 4 | Pending |
| COORD-03 | Phase 4 | Pending |
| COORD-04 | Phase 4 | Pending |
| COORD-05 | Phase 4 | Pending |
| COORD-06 | Phase 4 | Pending |
| COORD-07 | Phase 4 | Pending |
| INIT-01 | Phase 5 | Pending |
| INIT-02 | Phase 5 | Pending |
| INIT-03 | Phase 5 | Pending |
| INIT-04 | Phase 5 | Pending |
| INIT-05 | Phase 5 | Pending |
| INIT-06 | Phase 5 | Pending |
| CONN-01 | Phase 6 | Pending |
| CONN-02 | Phase 6 | Pending |
| CONN-03 | Phase 6 | Pending |
| CONN-04 | Phase 6 | Pending |

**Coverage:**
- v0.1 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0

---
*Requirements defined: 2026-01-18*
*Last updated: 2026-01-18 after roadmap creation*
