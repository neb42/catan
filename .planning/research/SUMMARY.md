# Project Research Summary

**Project:** Catan Online (Multiplayer Settlers of Catan)
**Domain:** Real-time multiplayer board game
**Researched:** 2026-01-20
**Confidence:** HIGH

## Executive Summary

Online multiplayer Catan is a **server-authoritative turn-based board game** with real-time state synchronization. Research shows the optimal approach uses WebSocket for discrete turn events (not continuous sync), SVG rendering for the hex board (not Canvas/WebGL), and full-state broadcasts for simplicity (not delta updates).

The existing stack (React 19, Express, ws, Zustand, Zod) is well-suited for this domain. Only 4 small additions needed: `react-hexgrid` (hex rendering), `honeycomb-grid` (hex math), `immer` (state updates), and `nanoid` (IDs). Avoid heavy frameworks like boardgame.io, Colyseus, or Socket.io — they add complexity without benefit for turn-based games.

**Key risks:** State desynchronization (solved by server-authoritative architecture), longest road miscalculation (solved by DFS with proper blocking), and development card timing violations (solved by purchase turn tracking). These pitfalls are well-documented and preventable with proper validation layering.

## Key Findings

### Recommended Stack

**Keep existing stack** — React 19, Vite, Express, ws, Zustand, Zod, Mantine UI are ideal. No major changes needed.

**Add 4 lightweight packages:**
- **react-hexgrid** (^2.0.1): SVG hex grid rendering with cubic coordinates
- **honeycomb-grid** (^4.1.5): Hex math (neighbors, pathfinding for longest road)
- **immer** (^11.1.3): Safe immutable state updates (integrates with Zustand)
- **nanoid** (^5.1.6): Compact unique IDs for rooms/players

**Avoid:**
- boardgame.io (stale, opinionated framework)
- Colyseus (requires replacing Express)
- Socket.io (1.4MB overhead, unnecessary features)
- PixiJS (WebGL overkill for static board)

### Expected Features

**Must have (table stakes — ~40 features):**
- Full lobby system (room join, color select, ready up)
- Complete Catan rules (trading, robber, dev cards, longest road/army)
- Real-time state sync with reconnection
- Turn indicators, legal move highlighting, building cost reference
- Dice rolling, resource management, victory detection

**Should have (competitive — high priority):**
- In-game chat (trading is social, chat enhances this)
- Game log/history (transparency, helps new players learn)
- Trade counter-offers (makes trading more interactive)
- Rematch button (players want to play again immediately)

**Defer (v2+):**
- User accounts/authentication
- Turn timers (casual play)
- All expansions (Seafarers, Cities & Knights)
- AI players
- Spectator mode
- Statistics/leaderboards

### Architecture Approach

**Server-authoritative with full-state broadcasts.** Server runs all game logic (validation, dice rolls, longest road calculation), clients are thin views. After every action, server broadcasts complete game state to all clients (~50KB JSON, ~10KB gzipped). Turn-based nature (10-50 updates per game) makes full-state sync simpler and more reliable than delta updates.

**Major components:**
1. **Game Room Manager** (server) — Room lifecycle, player connections
2. **Game Engine** (server) — Rules validation, state mutations, win detection
3. **Board Generator** (server) — Random hex layout following Catan rules
4. **WebSocket Manager** (server) — Message routing, state broadcast
5. **Game Board Renderer** (client) — SVG hex grid with react-hexgrid
6. **Game State Store** (client) — Zustand store synced from WebSocket
7. **Shared Types Library** (NX lib) — Types, Zod schemas, constants

### Critical Pitfalls

1. **State Desynchronization** — Clients showing different game states. Prevention: Server is source of truth, full-state broadcasts (not deltas), state versioning, reconciliation on reconnect.

2. **Longest Road Miscalculation** — Most commonly broken rule in Catan clones. Prevention: DFS with backtracking (not BFS), opponent settlements block paths, recalculate on both road AND settlement placement, handle ties correctly (original owner keeps).

3. **Development Card Timing Violations** — Playing cards same turn purchased, multiple per turn, VP cards revealed early. Prevention: Track `purchasedTurn`, `playedDevCardThisTurn` flag, hide VP cards from opponents, phase gating.

4. **Resource Duplication on Disconnect** — Reconnecting players get resources twice or lose resources. Prevention: Event sourcing with unique IDs, idempotent handlers, server sends definitive counts on reconnect.

5. **Turn Order Race Conditions** — Multiple players acting simultaneously, actions from wrong turn. Prevention: Server-side turn queue, action validation includes turn ID, mutex around turn transitions.

## Implications for Roadmap

Based on research, suggested 6-phase structure:

### Phase 1: Foundation (Shared Types + Room System)
**Rationale:** Establishes contracts between client/server, enables parallel development. Must come first.
**Delivers:** `libs/shared` with types/schemas/constants, room creation/joining, WebSocket infrastructure
**Addresses:** Table stakes (room system, lobby)
**Avoids:** State desync (by defining schemas upfront)

### Phase 2: Core Game Loop
**Rationale:** Build game skeleton before rendering. Can test with manual WebSocket messages.
**Delivers:** Board generation, initial placement (snake draft), turn structure (roll → main → end)
**Uses:** honeycomb-grid for hex math, nanoid for entity IDs
**Implements:** Game Engine, Board Generator components
**Avoids:** Number token adjacency bugs (constrained generation)

### Phase 3: Client Rendering
**Rationale:** Need game logic working before rendering makes sense.
**Delivers:** Hex board with react-hexgrid, pieces on board (roads, settlements, cities), action UI
**Uses:** react-hexgrid for SVG rendering
**Implements:** Game Board Renderer, Action Dispatcher components
**Addresses:** Table stakes (visual board, turn indicators)

### Phase 4: Game Mechanics
**Rationale:** Layer on rules once core loop is playable. Most complex phase (trading, robber).
**Delivers:** Resource distribution, building with costs, trading (domestic + maritime), robber
**Uses:** immer for state updates
**Avoids:** Resource duplication (event sourcing), robber on ocean (validation layers)

### Phase 5: Advanced Features
**Rationale:** Polish and complete game experience. Can be shipped without these, but they're core to Catan.
**Delivers:** Development cards (all 5 types), longest road, largest army, victory detection
**Avoids:** Longest road bugs (DFS + comprehensive tests), dev card timing violations (purchase turn tracking)

### Phase 6: Resilience
**Rationale:** Works best when full game is playable. Enables real-world usage.
**Delivers:** Disconnect handling (game pause), reconnection (state recovery)
**Avoids:** Resource duplication (full state reconciliation), connection loss issues (graceful handling)

### Phase Ordering Rationale

- **Foundation first** — Types/schemas are contracts. Building without them causes rework.
- **Server logic before client UI** — Server is source of truth. Client can be built once server works.
- **Core loop before mechanics** — Simple turn structure testable without complex rules.
- **Mechanics before advanced features** — Dev cards/longest road depend on resource/building systems.
- **Resilience last** — Reconnection logic easier to implement when game flow is complete.

Dependencies discovered:
- Longest Road depends on road placement (Phase 4 → Phase 5)
- Trading UI depends on resource system (Phase 4)
- Reconnection depends on full game state structure (Phase 6 last)

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 4** — Trading system is complex (domestic offers, counter-offers, maritime ports). May need UX research for trade interface.
- **Phase 5** — Longest road algorithm non-trivial (graph traversal with blocking). Need algorithm research if team unfamiliar.

**Phases with standard patterns (skip research-phase):**
- **Phase 1** — Room systems are well-documented patterns
- **Phase 2** — Turn structure is straightforward state machine
- **Phase 3** — react-hexgrid has clear documentation
- **Phase 6** — WebSocket reconnection is standard pattern

### Research Confidence

| Dimension | Confidence | Reason |
|-----------|------------|--------|
| Stack | HIGH | Existing stack ideal, additions are stable libraries |
| Features | HIGH | Catan rules well-defined, online clones establish patterns |
| Architecture | HIGH | Turn-based games have proven architectures |
| Pitfalls | HIGH | Common mistakes well-documented in game dev community |

### Recommended Next Steps

1. **Define requirements** — Scope v1 features from table stakes list
2. **Create roadmap** — Use 6-phase structure from research
3. **Plan Phase 1** — Start with shared types + room system
4. **Prototype board rendering** — Spike react-hexgrid early to validate approach

---

*This research synthesis provides clear direction for roadmap creation. All 4 research dimensions (Stack, Features, Architecture, Pitfalls) align toward a server-authoritative WebSocket-based architecture with SVG rendering and full-state sync.*
