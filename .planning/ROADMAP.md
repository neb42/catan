# Roadmap: Catan Online

## Overview

This roadmap delivers the v0.1 Lobby milestone: a real-time multiplayer lobby where 3-4 players can join, coordinate colors and ready states, and transition to a placeholder game screen. The architecture follows a server-authoritative WebSocket pattern, building infrastructure first before layering lobby features. Each phase delivers a complete, testable capability that unblocks the next.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: WebSocket Infrastructure** - Foundation for real-time communication
- [ ] **Phase 2: Landing and Lobby Entry** - Nickname entry and lobby joining
- [ ] **Phase 3: Lobby State Management** - Real-time player list and capacity
- [ ] **Phase 4: Player Coordination** - Color selection and ready states
- [ ] **Phase 5: Game Initialization** - Countdown and game start
- [ ] **Phase 6: Connection Reliability** - Disconnect handling and late arrival blocking

## Phase Details

### Phase 1: WebSocket Infrastructure
**Goal**: Establish reliable real-time communication layer with connection management, message routing, and state synchronization patterns.
**Depends on**: Nothing (first phase)
**Requirements**: None directly - foundational phase enabling all ENTRY, LOBBY, COORD, INIT, CONN requirements
**Success Criteria** (what must be TRUE):
  1. WebSocket server accepts connections and assigns stable client IDs
  2. Server broadcasts messages to all connected clients
  3. Client connections automatically reconnect after brief network interruptions
  4. Server detects and cleans up stale connections within 30 seconds
  5. Messages are validated with typed schemas before processing
**Plans**: 4 plans executed

Plans:
- [x] 01-01: Message Schemas and Validation
- [x] 01-02: Connection and Room Management
- [x] 01-03: Message Routing and Server Integration
- [x] 01-04: Client Reconnection and React Context

### Phase 2: Landing and Lobby Entry
**Goal**: Users can enter nicknames on landing page and join the shared lobby with uniqueness validation.
**Depends on**: Phase 1
**Requirements**: ENTRY-01, ENTRY-02, ENTRY-03, ENTRY-04
**Success Criteria** (what must be TRUE):
  1. User sees landing page with nickname input field (ENTRY-01)
  2. User cannot proceed with empty nickname (ENTRY-02)
  3. User receives clear error message when nickname is already taken (ENTRY-03)
  4. User joins lobby and sees it after entering unique nickname (ENTRY-04)
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Extend WebSocket message schemas for nickname validation
- [ ] 02-02-PLAN.md — Server-side nickname validation and storage
- [ ] 02-03-PLAN.md — Landing page UI and lobby placeholder route

### Phase 3: Lobby State Management
**Goal**: Users see real-time player list with capacity enforcement and can leave explicitly.
**Depends on**: Phase 2
**Requirements**: LOBBY-01, LOBBY-02, LOBBY-03, LOBBY-04, LOBBY-05, LOBBY-06
**Success Criteria** (what must be TRUE):
  1. User sees complete list of all players currently in lobby (LOBBY-01)
  2. User sees new players appear in real-time when they join (LOBBY-02)
  3. User sees players disappear in real-time when they leave (LOBBY-03)
  4. Lobby prevents 5th player from joining when 4 players present (LOBBY-04)
  5. User sees current player count displayed as "X/4 players" (LOBBY-05)
  6. User can click Leave button to exit lobby (LOBBY-06)
**Plans**: TBD

Plans:
- [ ] TBD during planning

### Phase 4: Player Coordination
**Goal**: Users can select colors with conflict resolution and toggle ready states.
**Depends on**: Phase 3
**Requirements**: COORD-01, COORD-02, COORD-03, COORD-04, COORD-05, COORD-06, COORD-07
**Success Criteria** (what must be TRUE):
  1. User can select from standard Catan colors for their player piece (COORD-01)
  2. User can change their color selection before clicking ready (COORD-02)
  3. User sees which colors are selected by other players (COORD-03)
  4. User sees visual indicator showing who is ready and who is not (COORD-04)
  5. User can toggle ready status with ready button (COORD-05)
  6. When user readies with duplicate color, other player's color is automatically reset (COORD-06)
  7. User cannot ready when fewer than 3 players in lobby (COORD-07)
**Plans**: TBD

Plans:
- [ ] TBD during planning

### Phase 5: Game Initialization
**Goal**: All-ready triggers countdown that can be cancelled, completing with transition to placeholder game screen.
**Depends on**: Phase 4
**Requirements**: INIT-01, INIT-02, INIT-03, INIT-04, INIT-05, INIT-06
**Success Criteria** (what must be TRUE):
  1. 10-second countdown starts automatically when all players are ready (INIT-01)
  2. User sees countdown timer displaying remaining seconds (INIT-02)
  3. User can un-ready during countdown to cancel it (INIT-03)
  4. Countdown resets to 10 when any player un-readies (INIT-04)
  5. When countdown reaches zero, user is transitioned to placeholder screen (INIT-05)
  6. Placeholder screen displays "Game starting..." message (INIT-06)
**Plans**: TBD

Plans:
- [ ] TBD during planning

### Phase 6: Connection Reliability
**Goal**: Disconnected players are removed from lobby and late arrivals are blocked from active games.
**Depends on**: Phase 5
**Requirements**: CONN-01, CONN-02, CONN-03, CONN-04
**Success Criteria** (what must be TRUE):
  1. When user disconnects, they are immediately removed from lobby (CONN-01)
  2. Other users see disconnected player disappear from player list (CONN-02)
  3. When user arrives during active game, they see "Game in progress" message (CONN-03)
  4. Late arrivals cannot join lobby when game is active (CONN-04)
**Plans**: TBD

Plans:
- [ ] TBD during planning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. WebSocket Infrastructure | 4/4 | Complete | 2026-01-18 |
| 2. Landing and Lobby Entry | 0/3 | Not started | - |
| 3. Lobby State Management | 0/TBD | Not started | - |
| 4. Player Coordination | 0/TBD | Not started | - |
| 5. Game Initialization | 0/TBD | Not started | - |
| 6. Connection Reliability | 0/TBD | Not started | - |
