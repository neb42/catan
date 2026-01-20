# Architecture Research: Online Multiplayer Catan

> Research on architectural patterns for real-time multiplayer board games

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser Client                          │
├─────────────────────────────────────────────────────────────────┤
│  React UI Layer                                                 │
│  ├── Lobby Components (Room Join, Color Select, Ready Up)      │
│  ├── Game Board (Hex Grid, Pieces, Cards)                      │
│  └── Controls (Actions, Trading, Building)                     │
├─────────────────────────────────────────────────────────────────┤
│  Client State Management                                        │
│  ├── Zustand: Local UI state (selected hex, modal open)        │
│  ├── WebSocket Client: Real-time game state sync               │
│  └── TanStack Query: REST API calls (room CRUD)                │
└─────────────────────────────────────────────────────────────────┘
                              │ ▲
                          WS  │ │  HTTP
                              ▼ │
┌─────────────────────────────────────────────────────────────────┐
│                         Express Server                          │
├─────────────────────────────────────────────────────────────────┤
│  HTTP API Layer                                                 │
│  ├── POST /rooms (create)                                      │
│  ├── GET /rooms/:id (details)                                  │
│  └── Static assets                                             │
├─────────────────────────────────────────────────────────────────┤
│  WebSocket Manager                                              │
│  ├── Connection Tracking (rooms, players, sessions)            │
│  ├── Message Router (route actions to game engine)             │
│  └── State Broadcast (push updates to all clients)             │
├─────────────────────────────────────────────────────────────────┤
│  Game Engine (Server-Authoritative)                            │
│  ├── Game State Store (all active games)                       │
│  ├── Rules Engine (validate actions, calculate outcomes)       │
│  ├── Board Generator (random layout)                           │
│  ├── Victory Calculator (longest road, largest army, VP)       │
│  └── Disconnect Handler (pause, track offline players)         │
├─────────────────────────────────────────────────────────────────┤
│  Shared Types/Schemas (NX lib)                                 │
│  ├── Game State Types (Board, Player, Resources)               │
│  ├── Message Types (Actions, Events)                           │
│  └── Zod Schemas (validation)                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### Server-Side (Authoritative)

#### 1. Game Room Manager
**Responsibility:**
- Create/destroy game rooms
- Track active rooms and their states
- Manage player connections to rooms
- Handle room lifecycle (lobby → playing → finished)

**Interfaces with:**
- WebSocket Manager (player join/leave events)
- Game Engine (start game, end game)
- HTTP API (room creation endpoint)

**Key State:**
```typescript
type RoomManager = {
  rooms: Map<RoomId, GameRoom>
  playerToRoom: Map<PlayerId, RoomId>
}

type GameRoom = {
  id: RoomId
  state: 'lobby' | 'playing' | 'finished'
  players: Player[]
  gameState?: GameState  // Only when playing
  createdAt: Date
}
```

#### 2. Game Engine (Core Logic)
**Responsibility:**
- Validate all player actions against game rules
- Execute game logic (dice rolls, resource distribution, building)
- Calculate derived state (longest road, largest army, victory points)
- Enforce turn order
- Handle special events (robber, dev cards)

**Interfaces with:**
- Game Room Manager (read/write game state)
- WebSocket Manager (receive actions, send state updates)
- Rules Engine (validation)
- Victory Calculator (win detection)

**Key Patterns:**
- **Server-authoritative**: All game logic runs on server, client is view-only
- **Event sourcing**: Each action is an event that transforms state
- **Immutable updates**: Use Immer for safe state mutations

```typescript
type GameEngine = {
  processAction(gameId: string, playerId: string, action: GameAction): GameEvent[]
  getCurrentState(gameId: string): GameState
  validateAction(gameId: string, playerId: string, action: GameAction): ValidationResult
}
```

#### 3. Board Generator
**Responsibility:**
- Generate random hex layouts following Catan rules
- Place number tokens (avoid 6/8 adjacency)
- Position ports (9 ports: 4 generic 3:1, 5 specific 2:1)
- Place desert hex and initial robber

**Interfaces with:**
- Game Engine (called at game start)
- Shared types (Board, Hex, Port types)

**Generation Algorithm:**
```
1. Shuffle terrain tiles (4 wood, 4 wheat, 4 sheep, 3 brick, 3 ore, 1 desert)
2. Place in spiral from center
3. Shuffle number tokens (2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12)
4. Assign to non-desert hexes, ensuring no adjacent 6/8
5. Shuffle ports, assign to coast edges
6. Return Board object
```

#### 4. Rules Engine
**Responsibility:**
- Validate placement (settlements, roads, cities)
- Check resource costs
- Verify turn phase legality
- Enforce trading rules
- Validate dev card plays

**Interfaces with:**
- Game Engine (called before every action)
- Shared schemas (Zod validation)

#### 5. Victory Calculator
**Responsibility:**
- Calculate longest road (graph traversal)
- Track largest army (knight cards played)
- Sum victory points (settlements, cities, dev cards, specials)
- Detect win condition (10 VP)

**Interfaces with:**
- Game Engine (called after state changes)
- Graph utilities (for longest road DFS)

---

### Client-Side (View)

#### 1. Game Board Renderer
**Responsibility:**
- Render hexagonal board (react-hexgrid)
- Display pieces (settlements, cities, roads)
- Show resource tokens, numbers, ports
- Handle hex/edge/vertex interactions

**Interfaces with:**
- Game State Store (reads game state)
- Action Dispatcher (sends placement actions)

**Key Libraries:**
- `react-hexgrid` for SVG hex rendering
- `honeycomb-grid` for hex coordinate math

#### 2. Game State Store (Zustand)
**Responsibility:**
- Store synchronized game state from server
- Track local UI state (selected hex, modals)
- Buffer optimistic updates (for responsiveness)

**Interfaces with:**
- WebSocket Client (receives state updates)
- React components (via hooks)

```typescript
type GameStore = {
  // Server state (authoritative)
  gameState: GameState | null
  
  // Local UI state
  selectedHex: HexCoord | null
  activeModal: 'trade' | 'build' | null
  
  // Actions
  updateGameState: (state: GameState) => void
  selectHex: (coord: HexCoord) => void
}
```

#### 3. WebSocket Client
**Responsibility:**
- Maintain persistent connection to server
- Send player actions
- Receive and dispatch state updates
- Handle reconnection with exponential backoff

**Interfaces with:**
- Game State Store (update on messages)
- Action components (send actions)

**Message Flow:**
```
Client → Server: { type: 'GAME_ACTION', action: { type: 'BUILD_ROAD', ... } }
Server → Client: { type: 'STATE_UPDATE', state: { ... } }
Server → All:    { type: 'STATE_UPDATE', state: { ... } }  // Broadcast
```

#### 4. Action Dispatcher
**Responsibility:**
- Translate UI interactions to game actions
- Show legal move hints
- Provide action affordances (buttons, click targets)

**Interfaces with:**
- Game Board (click handlers)
- WebSocket Client (send actions)
- Rules hints (highlight valid placements)

---

### Shared (NX Library: `libs/shared`)

#### Types & Schemas
**Purpose:** Single source of truth for all data structures

```typescript
// libs/shared/src/types.ts
export type GameState = { ... }
export type Player = { ... }
export type Board = { ... }

// libs/shared/src/schemas.ts
export const GameActionSchema = z.discriminatedUnion('type', [...])
export const GameStateSchema = z.object({ ... })
```

**Used by:**
- Server (validation, type safety)
- Client (type safety, runtime validation)

#### Constants
**Purpose:** Game configuration (costs, counts, rules)

```typescript
// libs/shared/src/constants.ts
export const BUILDING_COSTS = {
  ROAD: { wood: 1, brick: 1 },
  SETTLEMENT: { wood: 1, brick: 1, sheep: 1, wheat: 1 },
  CITY: { ore: 3, wheat: 2 },
  DEV_CARD: { ore: 1, sheep: 1, wheat: 1 }
}

export const VICTORY_POINTS = {
  SETTLEMENT: 1,
  CITY: 2,
  LONGEST_ROAD: 2,
  LARGEST_ARMY: 2,
  VICTORY_POINT_CARD: 1
}
```

---

## Data Flow

### Game State Synchronization

```
┌──────────┐                  ┌──────────┐
│ Player 1 │                  │ Player 2 │
│  Client  │                  │  Client  │
└────┬─────┘                  └────┬─────┘
     │                             │
     │ ACTION: Build Road          │
     ├────────────────────────────►│
     │                             │ Server
     │◄────────────────────────────┤ validates
     │ STATE_UPDATE (new road)     │
     │                             │
     │◄────────────────────────────┤ Broadcast
     │                             │ to all
     │                             │
     └─────────────────────────────┘
```

**Flow:**
1. Player 1 clicks to build road
2. Client sends `{ type: 'BUILD_ROAD', edge: [coord] }`
3. Server validates (has resources? legal placement? player's turn?)
4. Server mutates game state (deduct resources, place road)
5. Server broadcasts updated state to ALL clients in room
6. All clients update their Zustand store
7. React re-renders with new state

### Turn Progression

```
ROLL_PHASE → MAIN_PHASE → END_TURN
   │             │             │
   │             ├─ Trade      │
   │             ├─ Build      │
   │             └─ Play Card  │
   │                           │
   └───────────────────────────┘
         Next Player's Turn
```

---

## Build Order Recommendation

### Phase 1: Foundation (Shared + Room System)
1. **Create `libs/shared` NX library** — Types, schemas, constants
2. **Room Manager** — Create/join rooms, lobby state
3. **WebSocket infrastructure** — Connection handling, message routing

**Why first:** Establishes contracts between client/server, enables parallel work on game logic

### Phase 2: Core Game Loop
4. **Board Generator** — Random hex layout
5. **Game State Store** — Server-side state management
6. **Initial Placement** — Snake draft logic
7. **Turn Structure** — Roll → Main → End phases

**Why next:** Builds the skeleton of gameplay, can test with manual WebSocket messages

### Phase 3: Client Rendering
8. **Hex Board Renderer** — react-hexgrid integration
9. **Piece Rendering** — Roads, settlements, cities on board
10. **Action UI** — Build buttons, trading interface

**Why third:** Need game logic working before rendering makes sense

### Phase 4: Game Mechanics
11. **Resource System** — Distribution, costs, trading
12. **Building Logic** — Placement validation, legal spots
13. **Trading System** — Domestic + maritime
14. **Robber** — 7 roll, discard, move, steal

**Why fourth:** Layer on rules once core loop is playable

### Phase 5: Advanced Features
15. **Development Cards** — Buy, hold, play (5 types)
16. **Longest Road** — Graph traversal, tracking
17. **Largest Army** — Knight tracking
18. **Victory Detection** — 10 VP win

**Why fifth:** Polish and complete the full game experience

### Phase 6: Resilience
19. **Disconnect Handling** — Pause game, session recovery
20. **Reconnection** — Restore state, resume game

**Why last:** Works best when full game is playable

---

## Key Architecture Decisions

| Decision | Options | Recommendation | Rationale |
|----------|---------|----------------|-----------|
| **Authority** | Client-authoritative vs Server-authoritative | **Server-authoritative** | Prevents cheating, ensures consistency, simpler for turn-based |
| **State Sync** | Full state vs Deltas | **Full state** | Simpler for turn-based, easier reconnection, state size is small (~50KB) |
| **Validation** | Client-only vs Both vs Server-only | **Both (client hints, server enforces)** | Client shows legal moves (UX), server validates (security) |
| **Game Logic Location** | Client vs Server vs Shared | **Server (with shared types)** | Server owns rules, clients are thin views |
| **Board Rendering** | Canvas vs WebGL vs SVG | **SVG** | Catan is static, SVG is simple, scales perfectly, easy to style |
| **Real-time Protocol** | HTTP polling vs WebSocket vs Server-Sent Events | **WebSocket** | Bidirectional, low latency, natural fit for game actions |
| **State Management** | Redux vs MobX vs Zustand | **Zustand** | Already in stack, perfect for game state, simpler than Redux |

---

## Anti-Patterns to Avoid

### ❌ Optimistic Updates for Game State
**Problem:** Client assumes action succeeds, shows result before server validates
**Why bad:** Rollbacks are jarring, especially in multiplayer with spectators
**Instead:** Show loading state, wait for server confirmation (turn-based allows this)

### ❌ Splitting Game State Across Multiple Stores
**Problem:** Player state, board state, turn state in separate Zustand stores
**Why bad:** Hard to keep synchronized, causes race conditions
**Instead:** Single `GameState` object, slices for selectors only

### ❌ Client-Side Game Logic
**Problem:** "Let's validate placement on client for faster UX"
**Why bad:** Creates two sources of truth, easy to desync, cheating possible
**Instead:** Server validates, client shows hints (different from validation)

### ❌ Per-Player State Updates
**Problem:** Server sends different state to each player (hiding opponent cards)
**Why bad:** Complex, error-prone, hard to debug desyncs
**Instead:** Send full state to all, client hides what should be hidden (opponent cards face-down)

---

## Performance Considerations

### State Size
- Full game state ~50KB JSON
- Gzip compression reduces to ~10KB
- Acceptable for WebSocket messages (<1s on 4G)

### Update Frequency
- Turn-based → ~10-50 state updates per game
- Not real-time physics → no need for 60fps sync
- WebSocket overhead negligible at this scale

### Longest Road Calculation
- Potential bottleneck (graph traversal)
- Cache result, only recalculate when roads change
- DFS with pruning → <1ms for typical board

---

## Testing Strategy

### Unit Tests
- Rules engine validation (Jest)
- Victory calculator (especially longest road)
- Board generator (valid layouts)

### Integration Tests
- WebSocket message flow
- State sync across multiple clients
- Reconnection handling

### E2E Tests (Playwright)
- Full game playthrough
- Trading flow
- Disconnect/reconnect
- Win condition

---

*Research based on analysis of real-time multiplayer game architectures, specifically turn-based board games like chess, go, and existing Catan implementations.*
