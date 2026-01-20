# Requirements

## v1 Requirements

### Lobby & Matchmaking

- [ ] **LOBBY-01**: User can create a game room and receive a shareable room ID
- [ ] **LOBBY-02**: User can join an existing room by entering room ID
- [ ] **LOBBY-03**: User can set their nickname when joining a room
- [ ] **LOBBY-04**: User can select their player color from available options (red, blue, white, orange)
- [ ] **LOBBY-05**: User can mark themselves as ready in the lobby
- [ ] **LOBBY-06**: Game starts with countdown after all players (3-4) mark ready

### Board & Initial Setup

- [ ] **BOARD-01**: Game generates random hexagonal board layout with 19 land hexes (4 wood, 4 wheat, 4 sheep, 3 brick, 3 ore, 1 desert)
- [ ] **BOARD-02**: Game places number tokens on hexes following Catan rules (no adjacent 6/8)
- [ ] **BOARD-03**: Game places 9 ports on coast (4 generic 3:1, 5 specific 2:1)
- [ ] **BOARD-04**: User can place initial settlements and roads in snake draft order (1→2→3→4→4→3→2→1)
- [ ] **BOARD-05**: User receives starting resources from second settlement placement

### Turn Structure & Dice

- [ ] **TURN-01**: User can roll two dice on their turn with animated result
- [ ] **TURN-02**: Game distributes resources to players with settlements/cities adjacent to rolled number
- [ ] **TURN-03**: User progresses through turn phases: roll → main (trade/build) → end turn
- [ ] **TURN-04**: Game enforces round-robin turn order across all players
- [ ] **TURN-05**: User can see clear indicator of whose turn it is

### Resource Management

- [ ] **RES-01**: User can view their own resource cards (wood, brick, sheep, wheat, ore)
- [ ] **RES-02**: Game tracks resource counts for all players
- [ ] **RES-03**: User can see opponent resource counts (total only, not breakdown)

### Building

- [ ] **BUILD-01**: User can build roads by spending resources (1 wood, 1 brick)
- [ ] **BUILD-02**: User can build settlements by spending resources (1 wood, 1 brick, 1 sheep, 1 wheat)
- [ ] **BUILD-03**: User can upgrade settlements to cities by spending resources (3 ore, 2 wheat)
- [ ] **BUILD-04**: User can see building costs reference always visible on screen
- [ ] **BUILD-05**: Game validates road placement (must connect to own road or settlement)
- [ ] **BUILD-06**: Game validates settlement placement (2 vertices away from any settlement, adjacent to own road)
- [ ] **BUILD-07**: Game highlights valid placement locations when user selects build action
- [ ] **BUILD-08**: Game prevents invalid placements and shows clear error message

### Trading - Domestic

- [ ] **TRADE-01**: User can propose trade offer to specific player (offering X resources for Y resources)
- [ ] **TRADE-02**: User can accept or reject incoming trade offers
- [ ] **TRADE-03**: Game executes accepted trades by transferring resources between players

### Trading - Maritime

- [ ] **TRADE-04**: User can trade 4:1 with bank (any 4 of one resource for any 1 other resource)
- [ ] **TRADE-05**: User can trade 3:1 at generic port (any 3 of one resource for any 1 other resource)
- [ ] **TRADE-06**: User can trade 2:1 at specific resource port (2 of specific resource for any 1 other resource)

### Robber

- [ ] **ROBBER-01**: When 7 is rolled, players with 8+ cards choose half (rounded down) to discard
- [ ] **ROBBER-02**: User can move robber to any land hex (including where robber currently sits)
- [ ] **ROBBER-03**: User can steal one random resource card from adjacent player when moving robber
- [ ] **ROBBER-04**: Game allows self-blocking (placing robber on own hex)
- [ ] **ROBBER-05**: Hex with robber does not distribute resources when its number is rolled

### Development Cards

- [ ] **DEV-01**: User can buy development card from deck for resources (1 ore, 1 sheep, 1 wheat)
- [ ] **DEV-02**: Game draws from shuffled deck of 25 cards (14 Knight, 5 VP, 2 Road Building, 2 Year of Plenty, 2 Monopoly)
- [ ] **DEV-03**: User cannot play development card on same turn it was purchased
- [ ] **DEV-04**: User cannot play more than one development card per turn (except Victory Point cards)
- [ ] **DEV-05**: User can play Knight card to move robber and steal from adjacent player
- [ ] **DEV-06**: User can play Road Building card to place 2 free roads
- [ ] **DEV-07**: User can play Year of Plenty card to take 2 free resources from bank
- [ ] **DEV-08**: User can play Monopoly card to take all of one resource type from all players
- [ ] **DEV-09**: Victory Point cards remain hidden from opponents until win condition

### Scoring & Victory

- [ ] **SCORE-01**: Game calculates Longest Road (minimum 5 road segments) using graph traversal
- [ ] **SCORE-02**: Game awards Longest Road card (2 VP) to player with longest continuous road
- [ ] **SCORE-03**: Game transfers Longest Road card when another player surpasses length (ties favor current holder)
- [ ] **SCORE-04**: Game calculates Largest Army (minimum 3 knights played)
- [ ] **SCORE-05**: Game awards Largest Army card (2 VP) to player with most knights played
- [ ] **SCORE-06**: Game transfers Largest Army card when another player surpasses count (ties favor current holder)
- [ ] **SCORE-07**: Game calculates total victory points (settlements=1, cities=2, longest road=2, largest army=2, VP cards=1 each)
- [ ] **SCORE-08**: User can see all players' public victory point counts
- [ ] **SCORE-09**: Game detects when player reaches 10 victory points
- [ ] **SCORE-10**: Game ends and announces winner when 10 VP reached

### Real-time Sync & Resilience

- [ ] **SYNC-01**: Game broadcasts state updates to all players in real-time via WebSocket
- [ ] **SYNC-02**: Game pauses when player disconnects
- [ ] **SYNC-03**: User can reconnect to paused game and resume from same state
- [ ] **SYNC-04**: Game restores full game state for reconnecting player

### UX & Polish

- [ ] **UX-01**: User sees clear visual indicator of current turn and phase
- [ ] **UX-02**: User receives feedback confirmation for all actions (build, trade, roll, etc.)
- [ ] **UX-03**: User sees error messages when attempting invalid actions
- [ ] **UX-04**: User can view player list with colors and current scores
- [ ] **UX-05**: User can view scrollable game log showing all actions with timestamps
- [ ] **UX-06**: Game interface is responsive and playable on mobile devices

---

## v2 Requirements (Deferred)

### Trading Enhancements
- [ ] **TRADE-07**: User can counter-offer on incoming trade proposals
- [ ] **TRADE-08**: User can broadcast trade request asking "who has X resource?"

### Social Features
- [ ] **SOCIAL-01**: User can send text messages in game chat
- [ ] **SOCIAL-02**: User can see chat history for current game

### Audio & Polish
- [ ] **AUDIO-01**: Game plays sound effects for dice rolls, building, robber, etc.
- [ ] **AUDIO-02**: User can toggle sound effects on/off

### Quality of Life
- [ ] **QOL-01**: User can click "Rematch" button to start new game with same players
- [ ] **QOL-02**: Game shows resource production probability indicators (pip counts)
- [ ] **QOL-03**: User can undo actions within current turn before committing

---

## Out of Scope (v1)

### Deferred to Future Versions
- **Expansions** (Seafarers, Cities & Knights, 5-6 player) — Planned for future
- **User accounts & authentication** — Planned for future
- **AI players** — Planned for future
- **Spectator mode** — Planned for future
- **Custom board layouts** — Planned for future
- **House rules toggles** — Planned for future

### Not Planned
- **Turn timers** — Casual, untimed gameplay by design
- **Ranking & leaderboards** — Requires accounts, not priority
- **Voice/video chat** — Players use external tools (Discord, etc.)
- **Game history/replays** — Single session focus

---

## Traceability

Requirements mapped to roadmap phases:

### Phase 1: Foundation
- LOBBY-01, LOBBY-02, LOBBY-03, SYNC-01

### Phase 2: Core Game Loop
- BOARD-01, BOARD-02, BOARD-03, BOARD-04, BOARD-05
- TURN-01, TURN-02, TURN-03, TURN-04
- RES-01, RES-02

### Phase 3: Client Rendering
- TURN-05, BUILD-07, UX-01, UX-04

### Phase 4: Game Mechanics
- BUILD-01, BUILD-02, BUILD-03, BUILD-04, BUILD-05, BUILD-06, BUILD-08
- TRADE-01, TRADE-02, TRADE-03, TRADE-04, TRADE-05, TRADE-06
- ROBBER-01, ROBBER-02, ROBBER-03, ROBBER-04, ROBBER-05
- RES-03, UX-02, UX-03

### Phase 5: Advanced Features
- DEV-01 through DEV-09
- SCORE-01 through SCORE-10

### Phase 6: Resilience & Polish
- SYNC-02, SYNC-03, SYNC-04
- LOBBY-04, LOBBY-05, LOBBY-06
- UX-05, UX-06

---

**Total v1 Requirements:** 72  
**Total v2 Requirements:** 7  
**Out of Scope:** 10

---

*Last updated: 2026-01-20 after requirements definition*
