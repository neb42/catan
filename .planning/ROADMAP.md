# Roadmap

**Project:** Catan Online  
**Version:** v1  
**Created:** 2026-01-20  
**Status:** Draft

## Overview

8-phase roadmap derived from 72 v1 requirements. Each phase delivers working software with observable user value. Phases build sequentially — later phases depend on earlier foundations.

**Estimated Timeline:** 8-10 weeks (1-1.5 weeks per phase avg)  
**Delivery Strategy:** Ship after Phase 8 (v1 complete)

---

## Phase 1: Foundation

**Goal:** Establish shared contracts and room infrastructure  
**Duration:** 1 week  
**Dependencies:** None  
**Plans:** 4 plans

### Requirements (6)

- **LOBBY-01**: User can create a game room and receive a shareable room ID
- **LOBBY-02**: User can join an existing room by entering room ID
- **LOBBY-03**: User can set their nickname when joining a room
- **SYNC-01**: Game broadcasts state updates to all players in real-time via WebSocket

**Supporting:**
- Shared types library (Zod schemas, TypeScript types, constants)
- Room manager (create, join, leave)
- WebSocket infrastructure (connect, disconnect, message routing)
- Basic error handling

### Success Criteria

1. **User can create and share rooms** — Click "Create Room", receive 6-character room ID, copy to clipboard
2. **User can join rooms with nickname** — Enter room ID + nickname, see lobby with other players
3. **Real-time lobby updates** — Other players see new joins instantly (< 500ms)
4. **Validation works** — Invalid room IDs show error, nickname required before join

### Plans

- [ ] 01-01-PLAN.md — Shared types library with Zod schemas
- [ ] 01-02-PLAN.md — WebSocket server and room management
- [ ] 01-03-PLAN.md — Lobby UI and client WebSocket
- [ ] 01-04-PLAN.md — End-to-end verification

### Deliverables

- `libs/shared` — Shared types, schemas, constants
- Room creation/joining API endpoints
- WebSocket connection management
- Lobby UI (room list, join form)

---

## Phase 1.1: Small improvements from phase 1. Update the UI to match designs found in "./.designs/01-foundation". Add 4 more colours for selection. (INSERTED)

**Goal:** Polish lobby UI with expanded color palette and modern design aesthetic  
**Status:** ✅ Complete  
**Completed:** 2026-01-21  
**Depends on:** Phase 1  
**Plans:** 2 plans

Plans:
- [x] 01.1-01-PLAN.md — Add 4 colors + design foundation (fonts, global styles, tokens)
- [x] 01.1-02-PLAN.md — Update component styling (avatars, color picker, backgrounds)

**Details:**
Enhance visual design to match HTML mockups while maintaining all existing WebSocket functionality. Expands player colors from 4 to 8, applies Fraunces+Outfit typography, implements new color palette (terracotta, teal, saffron), and redesigns player list with circular avatars and inline color picker.

**Deliverables:**
- 8 player colors (red, blue, white, orange, green, yellow, purple, brown)
- Two-step landing form (nickname → create or join)
- Lobby with "Expedition Party" header and room code pill
- 2x2 player grid with circular avatars showing initials
- Inline 8-color picker with working color selection
- Ready button at bottom with status messages
- Warm beige background (#F9F4EF) throughout

---

## Phase 2: Board Generation & Rendering

**Goal:** Generate random Catan board with hexes, numbers, and ports  
**Duration:** 1 week  
**Dependencies:** Phase 1  
**Plans:** 4 plans (from original 02-XX series)

### Requirements (3)

- **BOARD-01**: Game generates random hexagonal board layout with 19 land hexes (4 wood, 4 wheat, 4 sheep, 3 brick, 3 ore, 1 desert)
- **BOARD-02**: Game places number tokens on hexes following Catan rules (no adjacent 6/8)
- **BOARD-03**: Game places 9 ports on coast (4 generic 3:1, 5 specific 2:1)

### Success Criteria

1. **Random board generates correctly** — 19 hexes, no adjacent 6/8, ports placed, visually distinct
2. **Board renders in browser** — Hex grid displays with proper orientation, terrain types visible, numbers on hexes
3. **Ports display correctly** — 9 ports on coast, icons match resource types, positioned correctly

### Deliverables

- Board generation algorithm (hex layout, number tokens, ports)
- Hex grid rendering with react-hexgrid
- Terrain tiles and visual styling
- Port icons and positioning

---

## Phase 3: Initial Placement

**Goal:** Implement snake draft for initial settlements and roads  
**Duration:** 1 week  
**Dependencies:** Phase 2  
**Plans:** 3 plans (from original 02-XX series)

### Requirements (2)

- **BOARD-04**: User can place initial settlements and roads in snake draft order (1→2→3→4→4→3→2→1)
- **BOARD-05**: User receives starting resources from second settlement placement

### Success Criteria

1. **Initial placement works end-to-end** — 8 rounds (snake draft), placements valid, second settlement gives resources
2. **Interactive placement** — Click vertex to place settlement, click edge to place road, visual feedback shows valid locations
3. **Phase transitions smoothly** — Setup phase completes, game transitions to turn-based play

### Deliverables

- Initial placement state machine (snake draft)
- Interactive vertex and edge selection
- Placement validation
- Starting resource distribution
- Phase transition logic

---

## Phase 4: Turn Structure & Resources

**Goal:** Enable turn-based gameplay with dice rolling and resource distribution  
**Duration:** 1 week  
**Dependencies:** Phase 3  
**Plans:** 2 plans (from original 02-XX series)

### Requirements (6)

- **TURN-01**: User can roll two dice on their turn with animated result
- **TURN-02**: Game distributes resources to players with settlements/cities adjacent to rolled number
- **TURN-03**: User progresses through turn phases: roll → main (trade/build) → end turn
- **TURN-04**: Game enforces round-robin turn order across all players
- **RES-01**: User can view their own resource cards (wood, brick, sheep, wheat, ore)
- **RES-02**: Game tracks resource counts for all players

### Success Criteria

1. **Dice roll distributes resources** — Roll dice, see animation, correct players get correct resources
2. **Turn structure flows** — Can progress from setup → first turn → second turn, correct player order
3. **Resource tracking persists** — Resources display correctly for all players, counts accurate after multiple turns


### Deliverables

- Turn structure (phases, ordering)
- Dice rolling (server RNG, animation, resource distribution)
- Resource tracking (state management)
- Complete game UI with resources and turn indicators

---

## Phase 5: Client Rendering

**Goal:** Visual board with interactive hex grid and action UI  
**Duration:** 1 week  
**Dependencies:** Phase 4

### Requirements (4)

- **TURN-05**: User can see clear indicator of whose turn it is
- **BUILD-07**: Game highlights valid placement locations when user selects build action
- **UX-01**: User sees clear visual indicator of current turn and phase
- **UX-04**: User can view player list with colors and current scores

### Success Criteria

1. **Hex board renders correctly** — SVG board with hexes, numbers, ports, ocean, all pieces visible
2. **Turn indicators are prominent** — Current player highlighted, turn phase shown clearly
3. **Valid placements highlight** — Click "Build Road", valid edges glow/highlight in real-time
4. **Player dashboard visible** — All players listed with colors, scores, resource counts, current turn marked

### Deliverables

- Hex board component with react-hexgrid
- Piece rendering (roads, settlements, cities)
- Placement highlighting system
- Turn/phase UI components
- Player list dashboard

---

## Phase 6: Game Mechanics

**Goal:** Complete building, trading, and robber systems  
**Duration:** 2 weeks  
**Dependencies:** Phase 5

### Requirements (22)

**Building (8):**
- **BUILD-01**: User can build roads by spending resources (1 wood, 1 brick)
- **BUILD-02**: User can build settlements by spending resources (1 wood, 1 brick, 1 sheep, 1 wheat)
- **BUILD-03**: User can upgrade settlements to cities by spending resources (3 ore, 2 wheat)
- **BUILD-04**: User can see building costs reference always visible on screen
- **BUILD-05**: Game validates road placement (must connect to own road or settlement)
- **BUILD-06**: Game validates settlement placement (2 vertices away from any settlement, adjacent to own road)
- **BUILD-08**: Game prevents invalid placements and shows clear error message

**Trading (6):**
- **TRADE-01**: User can propose trade offer to specific player (offering X resources for Y resources)
- **TRADE-02**: User can accept or reject incoming trade offers
- **TRADE-03**: Game executes accepted trades by transferring resources between players
- **TRADE-04**: User can trade 4:1 with bank (any 4 of one resource for any 1 other resource)
- **TRADE-05**: User can trade 3:1 at generic port (any 3 of one resource for any 1 other resource)
- **TRADE-06**: User can trade 2:1 at specific resource port (2 of specific resource for any 1 other resource)

**Robber (5):**
- **ROBBER-01**: When 7 is rolled, players with 8+ cards choose half (rounded down) to discard
- **ROBBER-02**: User can move robber to any land hex (including where robber currently sits)
- **ROBBER-03**: User can steal one random resource card from adjacent player when moving robber
- **ROBBER-04**: Game allows self-blocking (placing robber on own hex)
- **ROBBER-05**: Hex with robber does not distribute resources when its number is rolled

**Supporting (3):**
- **RES-03**: User can see opponent resource counts (total only, not breakdown)
- **UX-02**: User receives feedback confirmation for all actions (build, trade, roll, etc.)
- **UX-03**: User sees error messages when attempting invalid actions

### Success Criteria

1. **Building system works end-to-end** — Buy road/settlement/city, resources deducted, piece placed, validation prevents illegal moves
2. **Domestic trading works** — Propose trade, opponent accepts, resources transfer correctly
3. **Maritime trading works** — Trade with bank at 4:1, trade at 3:1 port, trade at 2:1 specific port
4. **Robber triggers on 7** — Roll 7, discard UI appears for 8+ card players, then robber moves, steal works
5. **Feedback system works** — Every action shows toast/notification, errors display clearly

### Deliverables

- Building system (costs, validation, placement)
- Building cost reference card UI
- Domestic trade UI (offer, accept/reject)
- Maritime trade UI (bank and port rates)
- Robber system (discard UI, move UI, steal logic)
- Action feedback system (toasts/notifications)

---

## Phase 7: Advanced Features

**Goal:** Development cards, longest road, largest army, victory  
**Duration:** 1.5 weeks  
**Dependencies:** Phase 6

### Requirements (19)

**Development Cards (9):**
- **DEV-01**: User can buy development card from deck for resources (1 ore, 1 sheep, 1 wheat)
- **DEV-02**: Game draws from shuffled deck of 25 cards (14 Knight, 5 VP, 2 Road Building, 2 Year of Plenty, 2 Monopoly)
- **DEV-03**: User cannot play development card on same turn it was purchased
- **DEV-04**: User cannot play more than one development card per turn (except Victory Point cards)
- **DEV-05**: User can play Knight card to move robber and steal from adjacent player
- **DEV-06**: User can play Road Building card to place 2 free roads
- **DEV-07**: User can play Year of Plenty card to take 2 free resources from bank
- **DEV-08**: User can play Monopoly card to take all of one resource type from all players
- **DEV-09**: Victory Point cards remain hidden from opponents until win condition

**Scoring & Victory (10):**
- **SCORE-01**: Game calculates Longest Road (minimum 5 road segments) using graph traversal
- **SCORE-02**: Game awards Longest Road card (2 VP) to player with longest continuous road
- **SCORE-03**: Game transfers Longest Road card when another player surpasses length (ties favor current holder)
- **SCORE-04**: Game calculates Largest Army (minimum 3 knights played)
- **SCORE-05**: Game awards Largest Army card (2 VP) to player with most knights played
- **SCORE-06**: Game transfers Largest Army card when another player surpasses count (ties favor current holder)
- **SCORE-07**: Game calculates total victory points (settlements=1, cities=2, longest road=2, largest army=2, VP cards=1 each)
- **SCORE-08**: User can see all players' public victory point counts
- **SCORE-09**: Game detects when player reaches 10 victory points
- **SCORE-10**: Game ends and announces winner when 10 VP reached

### Success Criteria

1. **Dev cards work correctly** — Buy card, can't play same turn, can play next turn, each card type works as specified
2. **Longest road calculates correctly** — Award at 5+ roads, transfers when surpassed, ties handled, opponent settlements block
3. **Largest army calculates correctly** — Award at 3+ knights, transfers when surpassed, ties handled
4. **Victory detection works** — Player reaches 10 VP, game ends immediately, winner announced
5. **VP cards stay hidden** — Opponents can't see VP cards in hand, revealed only on win or game end

### Deliverables

- Development card deck system (shuffle, draw)
- Dev card UI (hand display, play actions)
- All 5 dev card implementations
- Longest road algorithm (DFS with blocking)
- Largest army tracking
- Victory point calculation system
- Win detection and end game UI

---

## Phase 8: Resilience & Polish

**Goal:** Handle disconnects, finalize lobby, polish UX  
**Duration:** 1 week  
**Dependencies:** Phase 7

### Requirements (10)

**Resilience (4):**
- **SYNC-02**: Game pauses when player disconnects
- **SYNC-03**: User can reconnect to paused game and resume from same state
- **SYNC-04**: Game restores full game state for reconnecting player

**Lobby Polish (3):**
- **LOBBY-04**: User can select their player color from available options (red, blue, white, orange)
- **LOBBY-05**: User can mark themselves as ready in the lobby
- **LOBBY-06**: Game starts with countdown after all players (3-4) mark ready

**UX Polish (2):**
- **UX-05**: User can view scrollable game log showing all actions with timestamps
- **UX-06**: Game interface is responsive and playable on mobile devices

### Success Criteria

1. **Disconnect handling works** — Player disconnects, game pauses, shows waiting message to others
2. **Reconnection works** — Disconnected player refreshes browser, rejoins room, sees current game state, game resumes
3. **Lobby flow complete** — Join room, pick color, mark ready, countdown starts (3-4 players only), game begins
4. **Game log provides transparency** — All actions logged with timestamps, scrollable, clear descriptions
5. **Mobile playable** — Can complete full game on mobile device (touch targets adequate, layout responsive)

### Deliverables

- Disconnect detection and game pause logic
- Reconnection flow (rejoin, state sync)
- Color selection UI
- Ready-up system and countdown
- Game log component (event history)
- Mobile responsive styles

---

## Validation Matrix

**Requirements Coverage:** 72/72 (100%)

| Phase | Requirements | Percentage |
|-------|--------------|------------|
| Phase 1: Foundation | 6 | 8% |
| Phase 2: Board Generation & Rendering | 3 | 4% |
| Phase 3: Initial Placement | 2 | 3% |
| Phase 4: Turn Structure & Resources | 6 | 8% |
| Phase 5: Client Rendering | 4 | 6% |
| Phase 6: Game Mechanics | 22 | 31% |
| Phase 7: Advanced Features | 19 | 26% |
| Phase 8: Resilience & Polish | 10 | 14% |

**Phase Dependencies:**
- Phase 2 depends on Phase 1 (needs room system)
- Phase 3 depends on Phase 2 (needs board to place on)
- Phase 4 depends on Phase 3 (needs initial placement complete)
- Phase 5 depends on Phase 4 (needs game state to render)
- Phase 6 depends on Phase 5 (needs placement UI)
- Phase 7 depends on Phase 6 (needs building/resources)
- Phase 8 depends on Phase 7 (needs complete game)

**No orphaned requirements.** All 72 v1 requirements mapped to exactly one phase.

---

## Risks & Mitigations

| Risk | Phase | Impact | Mitigation |
|------|-------|--------|------------|
| Longest road algorithm bugs | Phase 7 | High | DFS with comprehensive test cases, validate against known scenarios |
| State desynchronization | Phase 1-8 | Critical | Server-authoritative, full-state broadcasts, state versioning |
| WebSocket connection drops | Phase 8 | High | Heartbeat pings, auto-reconnect, state recovery |
| Trade UI complexity | Phase 6 | Medium | Prototype early, iterate with user testing |
| Mobile touch targets too small | Phase 8 | Medium | Design for 44px minimum, test on real devices |

---

## Success Metrics (v1 Launch)

**Functional:**
- ✓ All 72 requirements implemented
- ✓ Complete game playable end-to-end
- ✓ No critical bugs blocking game completion

**Technical:**
- ✓ State sync < 500ms across all clients
- ✓ Reconnection success rate > 95%
- ✓ Game state size < 100KB

**User Experience:**
- ✓ Mobile playable (can complete full game)
- ✓ Clear feedback for all actions
- ✓ Win condition reached in test games

---

## Post-v1 Backlog (v2)

Deferred from v1:
- Trade counter-offers (TRADE-07)
- Trade broadcast requests (TRADE-08)
- In-game chat (SOCIAL-01, SOCIAL-02)
- Sound effects (AUDIO-01, AUDIO-02)
- Rematch button (QOL-01)
- Probability indicators (QOL-02)
- Turn undo (QOL-03)

Future versions:
- User accounts & authentication
- Expansions (Seafarers, Cities & Knights)
- AI players
- Spectator mode
- Custom board layouts
- House rules toggles

---

*Last updated: 2026-01-20 after roadmap creation*
