# Architecture Research: Real-Time Lobby System

**Domain:** Multiplayer Game Lobby with WebSocket State Synchronization
**Researched:** 2025-01-18
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React App)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Routes     │  │  Components  │  │   Hooks      │       │
│  │ (TanStack)   │  │  (Mantine)   │  │ (useWS...)   │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │               │
│         └─────────────────┴─────────────────┘               │
│                           │                                 │
│  ┌────────────────────────┴────────────────────────┐        │
│  │        WebSocket Client (ws protocol)           │        │
│  │  - Connection lifecycle management              │        │
│  │  - Message serialization/deserialization        │        │
│  │  - Reconnection logic with exponential backoff  │        │
│  └────────────────────────┬────────────────────────┘        │
└─────────────────────────────┼────────────────────────────────┘
                              │
                          ws://localhost:3000
                              │
┌─────────────────────────────┼────────────────────────────────┐
│  ┌────────────────────────┴────────────────────────┐        │
│  │         WebSocket Server (ws library)           │        │
│  │  - Upgrade pattern (shares HTTP server port)   │        │
│  │  - Connection tracking by client ID             │        │
│  │  - Message routing and broadcasting             │        │
│  └────────────────────────┬────────────────────────┘        │
│                           │                                 │
│         ┌─────────────────┴─────────────────┐               │
│         │                                   │               │
│  ┌──────▼──────┐                    ┌──────▼──────┐         │
│  │  Lobby      │                    │  Message    │         │
│  │  Service    │◄───────────────────┤  Handler    │         │
│  │             │                    │             │         │
│  │ - State     │                    │ - Routing   │         │
│  │ - Logic     │                    │ - Validate  │         │
│  │ - Events    │                    │ - ACK/NACK  │         │
│  └──────┬──────┘                    └─────────────┘         │
│         │                                                   │
│  ┌──────▼──────────────────────────────────┐                │
│  │      Lobby State (In-Memory)            │                │
│  │  {                                      │                │
│  │    lobbyId: string,                     │                │
│  │    players: Map<wsId, Player>,          │                │
│  │    countdown: Timer | null,             │                │
│  │    status: 'waiting' | 'countdown'      │                │
│  │  }                                      │                │
│  └─────────────────────────────────────────┘                │
│                                                              │
│                   SERVER (Express + ws)                      │
└──────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Client WebSocket Hook** | Connection lifecycle, message send/receive, reconnection | Custom React hook or `react-use-websocket` |
| **Client Lobby State** | Local optimistic UI state, reconciliation with server | React state + useReducer |
| **Server WebSocket Handler** | Connection tracking, message routing, broadcasting | ws library connection handlers |
| **Lobby Service** | Business logic, state mutations, validation, timer management | Service class with state store |
| **Lobby State Store** | Source of truth for lobby state, player list, countdown | In-memory Map/Object (v0.1), Redis (later) |
| **Message Protocol** | Typed messages for all client-server events | TypeScript interfaces extending WebSocketMessage |

## Recommended Project Structure

### Backend (apps/api)

```
apps/api/src/
├── features/
│   └── lobby/                    # Lobby feature module
│       ├── lobby.service.ts      # Business logic and state management
│       ├── lobby.types.ts        # Lobby-specific types (Player, LobbyState, etc.)
│       ├── lobby.handlers.ts     # WebSocket message handlers
│       └── lobby.constants.ts    # Colors, limits, timing constants
├── websocket/
│   ├── index.ts                  # WebSocket server initialization (existing)
│   ├── message-router.ts         # Route messages to feature handlers
│   └── connection-manager.ts     # Track connections, assign IDs, cleanup
├── types/
│   └── index.ts                  # Extend WebSocketMessage for lobby events
└── utils/
    └── timer.ts                  # Server-side countdown timer utility
```

### Frontend (apps/web)

```
apps/web/src/
├── features/
│   └── lobby/
│       ├── components/
│       │   ├── LobbyScreen.tsx         # Main lobby container
│       │   ├── PlayerList.tsx          # Display all players
│       │   ├── PlayerCard.tsx          # Individual player with color/ready
│       │   ├── ColorPicker.tsx         # Color selection UI
│       │   └── CountdownDisplay.tsx    # Countdown timer display
│       ├── hooks/
│       │   ├── useLobbyWebSocket.ts    # WebSocket connection for lobby
│       │   ├── useLobbyState.ts        # Local state + server reconciliation
│       │   └── useCountdown.ts         # Client countdown sync
│       └── types/
│           └── lobby.types.ts          # Client-side lobby types
├── hooks/
│   └── useWebSocket.ts           # Generic WebSocket hook (reusable)
└── routes/
    ├── index.tsx                 # Landing page (nickname entry)
    └── lobby.tsx                 # Lobby route
```

### Structure Rationale

- **Feature-based organization:** Lobby code lives in `features/lobby/` with clear boundaries
- **Shared WebSocket infrastructure:** Connection management and routing are reusable for future game features
- **Type safety:** Shared message protocol types ensure client-server contract
- **Separation of concerns:** Service (business logic) vs Handlers (WebSocket I/O) vs State (data)

## Architectural Patterns

### Pattern 1: Server-Authoritative State

**What:** Server owns the canonical state; clients send intents and render server state.

**When to use:** All multiplayer games to prevent cheating and ensure consistency.

**Trade-offs:**
- **Pros:** Single source of truth, no state conflicts, cheat-resistant
- **Cons:** Network latency affects UX, requires good optimistic UI

**Example:**
```typescript
// CLIENT: Send intent, don't mutate local state directly
function selectColor(color: string) {
  send({
    type: 'lobby:selectColor',
    payload: { color }
  });
  // Optimistically update UI (will be corrected by server state)
  setOptimisticColor(color);
}

// SERVER: Validate and apply state change
function handleSelectColor(clientId: string, color: string) {
  if (isColorAvailable(color)) {
    lobbyState.players.get(clientId).color = color;
    broadcast({ type: 'lobby:stateUpdate', payload: lobbyState });
  } else {
    sendToClient(clientId, { type: 'lobby:error', payload: 'Color taken' });
  }
}
```

### Pattern 2: Message-Based Communication

**What:** All client-server communication via typed message protocol, not RPC-style.

**When to use:** WebSocket systems requiring flexibility and debuggability.

**Trade-offs:**
- **Pros:** Easy to log, debug, and extend; language-agnostic protocol
- **Cons:** More boilerplate than RPC libraries; manual type coordination

**Example:**
```typescript
// Shared types (apps/api/src/types)
interface WebSocketMessage<T = unknown> {
  type: string;
  payload?: T;
  id?: string;
  timestamp?: string;
}

// Lobby-specific message types
type LobbyMessage =
  | { type: 'lobby:join'; payload: { nickname: string } }
  | { type: 'lobby:selectColor'; payload: { color: string } }
  | { type: 'lobby:ready'; payload: { ready: boolean } }
  | { type: 'lobby:stateUpdate'; payload: LobbyState }
  | { type: 'lobby:countdownTick'; payload: { remaining: number } };

// Message router
function routeMessage(ws: WebSocket, message: WebSocketMessage) {
  const handler = messageHandlers[message.type];
  if (handler) {
    handler(ws, message.payload);
  }
}
```

### Pattern 3: Optimistic UI with Reconciliation

**What:** Update UI immediately on user action, then reconcile with server state.

**When to use:** Low-latency feel in network-dependent apps.

**Trade-offs:**
- **Pros:** Instant feedback, feels responsive despite network latency
- **Cons:** Complexity in handling conflicts, potential UI "jank" on correction

**Example:**
```typescript
// Client side
function useLobbyState() {
  const [serverState, setServerState] = useState<LobbyState | null>(null);
  const [optimisticState, setOptimisticState] = useState<Partial<LobbyState>>({});

  // Merge optimistic changes with server state
  const displayState = useMemo(() => ({
    ...serverState,
    ...optimisticState
  }), [serverState, optimisticState]);

  // When server state arrives, clear optimistic predictions
  useEffect(() => {
    if (serverState) {
      setOptimisticState({});
    }
  }, [serverState]);

  return { state: displayState, setServerState, setOptimisticState };
}
```

### Pattern 4: Connection Manager with Client Mapping

**What:** Track WebSocket connections with stable client IDs, map to nicknames.

**When to use:** Managing reconnections and associating state with connections.

**Trade-offs:**
- **Pros:** Handles reconnections, allows nickname changes, clean separation
- **Cons:** Requires connection ID generation and mapping logic

**Example:**
```typescript
// Connection manager
class ConnectionManager {
  private connections = new Map<string, { ws: WebSocket; nickname: string }>();

  register(ws: WebSocket, nickname: string): string {
    const clientId = crypto.randomUUID();
    this.connections.set(clientId, { ws, nickname });
    return clientId;
  }

  getClient(clientId: string) {
    return this.connections.get(clientId);
  }

  removeClient(clientId: string) {
    this.connections.delete(clientId);
  }

  broadcast(message: WebSocketMessage, excludeId?: string) {
    this.connections.forEach((client, id) => {
      if (id !== excludeId) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }
}
```

## Data Flow

### Join Flow

```
User enters nickname → Click "Join Lobby"
    ↓
[Landing Route] → Navigate to /lobby
    ↓
[Lobby Route] → Mount LobbyScreen component
    ↓
[useLobbyWebSocket] → Connect WebSocket
    ↓
Client: Send { type: 'lobby:join', payload: { nickname } }
    ↓
Server: WebSocket connection event
    ↓
[ConnectionManager] → Register client with ID
    ↓
[LobbyService] → Add player to lobby state
    ↓
[LobbyService] → Broadcast { type: 'lobby:stateUpdate', payload: fullState }
    ↓
All Clients: Receive state update
    ↓
[useLobbyState] → Update serverState
    ↓
[LobbyScreen] → Re-render with new player list
```

### Color Selection Flow

```
User clicks color swatch
    ↓
[ColorPicker] → onClick handler
    ↓
[useLobbyWebSocket] → send({ type: 'lobby:selectColor', payload: { color } })
    ↓
[useLobbyState] → setOptimisticState({ myColor: color }) // Instant feedback
    ↓
Server: Receive message
    ↓
[MessageRouter] → Route to lobby:selectColor handler
    ↓
[LobbyHandlers] → handleSelectColor(clientId, color)
    ↓
[LobbyService] → Validate color availability
    ↓
IF available:
  [LobbyService] → Update player color in state
  [LobbyService] → Broadcast state update
  Client: Optimistic state matches server → No visual change
ELSE:
  Server → Send { type: 'lobby:error', payload: 'Color already taken' }
  Client: Clear optimistic state, show error
  Client: UI reverts to previous color
```

### Ready and Countdown Flow

```
User clicks "Ready" button
    ↓
Client: Send { type: 'lobby:ready', payload: { ready: true } }
    ↓
Server: Update player ready status
    ↓
[LobbyService] → Check if all players ready
    ↓
IF all ready AND >= 2 players:
  [LobbyService] → Start countdown timer (5 seconds)
  [LobbyService] → Set status to 'countdown'
  [LobbyService] → Broadcast state update
  [Timer] → Every 1 second:
    Broadcast { type: 'lobby:countdownTick', payload: { remaining } }
  ↓
  When countdown reaches 0:
    [LobbyService] → Set status to 'starting'
    Broadcast { type: 'lobby:gameStarting' }
ELSE IF any player un-ready during countdown:
  [LobbyService] → Cancel countdown timer
  [LobbyService] → Set status to 'waiting'
  Broadcast state update
```

### State Ownership

| State | Owner | Read Access | Write Access |
|-------|-------|-------------|--------------|
| Player list | Server | All clients | Server only |
| Player colors | Server | All clients | Server (validated) |
| Ready status | Server | All clients | Server (per player) |
| Countdown timer | Server | All clients | Server only |
| Optimistic predictions | Client | Local client only | Local client only |
| Connection status | Client | Local client only | Client WebSocket hook |

## Message Protocol Design

### Core Message Types

```typescript
// Base message structure (already exists in types/)
interface WebSocketMessage<T = unknown> {
  type: string;
  payload?: T;
  id?: string;
  timestamp?: string;
}

// Lobby domain types
interface Player {
  id: string;
  nickname: string;
  color: string | null;
  ready: boolean;
  connected: boolean;
}

interface LobbyState {
  players: Player[];
  status: 'waiting' | 'countdown' | 'starting';
  countdown: number | null;
}

// Client → Server Messages
type ClientMessage =
  | { type: 'lobby:join'; payload: { nickname: string } }
  | { type: 'lobby:selectColor'; payload: { color: string } }
  | { type: 'lobby:ready'; payload: { ready: boolean } }
  | { type: 'lobby:leave'; payload: {} };

// Server → Client Messages
type ServerMessage =
  | { type: 'lobby:welcome'; payload: { clientId: string; lobbyState: LobbyState } }
  | { type: 'lobby:stateUpdate'; payload: LobbyState }
  | { type: 'lobby:countdownTick'; payload: { remaining: number } }
  | { type: 'lobby:gameStarting'; payload: {} }
  | { type: 'lobby:error'; payload: { message: string; field?: string } };
```

### Message Flow Diagram

```
CLIENT                          SERVER
  │                               │
  ├─ lobby:join ─────────────────>│
  │                               ├─ Register client
  │                               ├─ Add to lobby
  │<────────── lobby:welcome ─────┤
  │<────────── lobby:stateUpdate ─┤ (broadcast to all)
  │                               │
  ├─ lobby:selectColor ──────────>│
  │                               ├─ Validate color
  │<────────── lobby:stateUpdate ─┤ (if valid)
  │<────────── lobby:error ────────┤ (if taken)
  │                               │
  ├─ lobby:ready ────────────────>│
  │                               ├─ Check all ready
  │<────────── lobby:stateUpdate ─┤
  │<────── lobby:countdownTick ────┤ (every 1s)
  │<────── lobby:countdownTick ────┤
  │<────── lobby:gameStarting ─────┤ (at 0)
  │                               │
```

## Build Order and Dependencies

### Phase 1: WebSocket Infrastructure
**Goal:** Reliable connection between client and server

**Backend:**
1. Extend `apps/api/src/websocket/index.ts` with message routing
2. Create `ConnectionManager` to track clients by ID
3. Add message validation and error handling

**Frontend:**
1. Create `useWebSocket` hook for connection lifecycle
2. Implement reconnection with exponential backoff
3. Add connection status UI (connecting/connected/disconnected)

**Dependencies:** None (foundation layer)

### Phase 2: Basic Lobby State
**Goal:** Players can join and see each other

**Backend:**
1. Create `LobbyService` with in-memory state
2. Implement `lobby:join` handler
3. Implement state broadcasting on changes
4. Handle player disconnect cleanup

**Frontend:**
1. Create `useLobbyState` hook for state management
2. Build `LobbyScreen` container component
3. Build `PlayerList` and `PlayerCard` components
4. Implement join flow from landing page

**Dependencies:** Phase 1 (WebSocket infrastructure)

### Phase 3: Color Selection
**Goal:** Players can select unique colors

**Backend:**
1. Add color validation logic to `LobbyService`
2. Implement `lobby:selectColor` handler
3. Broadcast state updates on color change
4. Handle color conflicts (first-come-first-served)

**Frontend:**
1. Build `ColorPicker` component with available colors
2. Implement optimistic color selection
3. Handle color conflict errors (revert optimistic change)

**Dependencies:** Phase 2 (lobby state exists)

### Phase 4: Ready System
**Goal:** Players can mark themselves ready

**Backend:**
1. Add ready status to player state
2. Implement `lobby:ready` handler
3. Add logic to check "all players ready" condition

**Frontend:**
1. Add "Ready" toggle button to player's own card
2. Display other players' ready status
3. Disable color picker when ready

**Dependencies:** Phase 3 (color selection complete)

### Phase 5: Countdown Timer
**Goal:** Automatic countdown when all ready

**Backend:**
1. Create server-side timer utility
2. Start countdown when all players ready (min 2 players)
3. Cancel countdown if any player un-readies
4. Broadcast `lobby:countdownTick` every second
5. Broadcast `lobby:gameStarting` at 0

**Frontend:**
1. Build `CountdownDisplay` component
2. Sync countdown from server ticks
3. Handle countdown cancellation
4. Navigate to game screen on `lobby:gameStarting`

**Dependencies:** Phase 4 (ready system complete)

### Phase 6: Polish and Edge Cases
**Goal:** Handle reconnections, cleanup, errors gracefully

**Backend:**
1. Implement graceful shutdown of lobby when all leave
2. Handle mid-countdown disconnections
3. Add rate limiting to prevent spam

**Frontend:**
1. Implement reconnection with state restoration
2. Add loading states and error messages
3. Handle network errors gracefully

**Dependencies:** Phase 5 (core functionality complete)

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **0-100 players** | Single server, in-memory state. WebSocket shares HTTP port. No persistence needed. |
| **100-1k players** | Multiple lobbies (one per game instance). Add lobby ID to state. Still in-memory per lobby. |
| **1k-10k players** | Add Redis for shared state across server instances. Use sticky sessions or connection ID routing. Separate WebSocket server. |
| **10k+ players** | Horizontal scaling with Redis pub/sub. Load balancer with WebSocket upgrade support. Consider dedicated game servers. |

### Scaling Priorities for v0.1

**First bottleneck:** Server memory if all players in one lobby
- **Fix:** Limit lobby size to 6 players (max Catan players + spectators)
- **When:** Immediately (design constraint)

**Second bottleneck:** Server CPU if many concurrent lobbies
- **Fix:** Optimize state broadcasting (only send diffs, not full state)
- **When:** After 10+ concurrent lobbies (~60 concurrent players)

**Not needed for v0.1:**
- Redis or external state store
- Multiple server instances
- Horizontal scaling
- Database persistence

## Anti-Patterns

### Anti-Pattern 1: Client-Side State Mutations

**What people do:** Let client directly modify shared state and sync to server
```typescript
// BAD: Client mutates and syncs
function selectColor(color: string) {
  lobbyState.myPlayer.color = color;
  syncToServer(lobbyState);
}
```

**Why it's wrong:**
- Race conditions when multiple clients modify simultaneously
- Enables cheating (client can set invalid states)
- Server loses authoritative role

**Do this instead:**
```typescript
// GOOD: Client sends intent, server responds with new state
function selectColor(color: string) {
  send({ type: 'lobby:selectColor', payload: { color } });
  // Optimistic update for UX, but server state is authoritative
}
```

### Anti-Pattern 2: Broadcasting to Self

**What people do:** When client sends an action, server broadcasts update including sender
```typescript
// BAD: Sender receives their own update
wss.clients.forEach(client => {
  client.send(JSON.stringify(stateUpdate));
});
```

**Why it's wrong:**
- Sender gets duplicate update (sent optimistically + received from server)
- Can cause flicker or UI jank
- Wastes bandwidth

**Do this instead:**
```typescript
// GOOD: Exclude sender from broadcast, send ACK instead
function broadcast(message: Message, excludeId?: string) {
  connections.forEach((client, id) => {
    if (id !== excludeId) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

// Send ACK to sender
sendToClient(senderId, { type: 'lobby:ack', payload: { action: 'selectColor' } });
```

### Anti-Pattern 3: No Reconnection Handling

**What people do:** Assume WebSocket connection stays alive forever
```typescript
// BAD: Single connection attempt, no retry
const ws = new WebSocket(url);
```

**Why it's wrong:**
- Mobile networks drop connections frequently
- Server restarts disconnect all clients
- Users experience broken app with no recovery

**Do this instead:**
```typescript
// GOOD: Automatic reconnection with backoff
function useWebSocket(url: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    const socket = new WebSocket(url);

    socket.onclose = () => {
      const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
      reconnectAttempts.current++;
      setTimeout(connect, delay);
    };

    socket.onopen = () => {
      reconnectAttempts.current = 0;
    };

    setWs(socket);
  }, [url]);

  useEffect(() => {
    connect();
  }, [connect]);

  return ws;
}
```

### Anti-Pattern 4: Stateful WebSocket Handlers

**What people do:** Store state directly on WebSocket connection objects
```typescript
// BAD: State on connection object
ws.on('connection', (socket) => {
  socket.playerData = { nickname: '', color: null };
});
```

**Why it's wrong:**
- State lost on reconnection
- Hard to query "all players" (must iterate connections)
- Tightly couples connection lifetime to game state

**Do this instead:**
```typescript
// GOOD: Separate state store, connection is just I/O
class LobbyService {
  private players = new Map<string, Player>();
  private connections = new Map<string, WebSocket>();

  addPlayer(clientId: string, nickname: string, ws: WebSocket) {
    this.players.set(clientId, { id: clientId, nickname, color: null, ready: false });
    this.connections.set(clientId, ws);
  }

  // State operations work independently of connections
}
```

### Anti-Pattern 5: Full State Broadcasting

**What people do:** Send entire lobby state on every tiny change
```typescript
// BAD: Send all players when one changes color
function handleColorChange(clientId: string, color: string) {
  player.color = color;
  broadcast({ type: 'lobby:stateUpdate', payload: getAllPlayers() });
}
```

**Why it's wrong:**
- Wastes bandwidth (sends unchanged data)
- Scales poorly (O(n) data for each change)
- Can hit message size limits with large lobbies

**Do this instead (for v0.1 - full state is OK):**
```typescript
// ACCEPTABLE for v0.1 with small lobbies (< 10 players)
// Full state is simple and easy to reason about
broadcast({ type: 'lobby:stateUpdate', payload: getLobbyState() });

// BETTER for later versions with larger scale
broadcast({
  type: 'lobby:playerUpdate',
  payload: {
    playerId: clientId,
    changes: { color }
  }
});
```

## Integration Points

### WebSocket Server Integration

| Component | Integration Pattern | Notes |
|-----------|---------------------|-------|
| Express HTTP Server | Upgrade pattern (shares port) | Use `initializeWebSocket(httpServer)` from existing code |
| Message Router | Event-based routing | Map `message.type` to handler functions |
| Connection Manager | Singleton service | Track all active connections, assign IDs |

### Frontend Integration

| Component | Integration Pattern | Notes |
|-----------|---------------------|-------|
| TanStack Router | Route-based connection | Connect WebSocket on `/lobby` route mount |
| TanStack Query | Not used for WS data | Use for HTTP API calls (e.g., game history later) |
| Mantine UI | Component library | Use Mantine components for lobby UI |
| React Context | Optional | Could provide WebSocket instance via context, or pass as prop |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| WebSocket Server ↔ Lobby Service | Direct function calls | Service is imported and called by handlers |
| Lobby Service ↔ State Store | Direct access | State is private field of service |
| Client Hook ↔ Components | Props and callbacks | Hook returns { send, state, status } |
| Landing Route ↔ Lobby Route | TanStack Router navigation | Pass nickname via URL params or localStorage |

## Sources

### WebSocket Architecture & Patterns
- [WebSocket Architecture Best Practices - Ably](https://ably.com/topic/websocket-architecture-best-practices)
- [WebSocket Scale in 2025 - VideoSDK](https://www.videosdk.live/developer-hub/websocket/websocket-scale)
- [Synchronizing State with WebSockets and JSON Patch](https://cetra3.github.io/blog/synchronising-with-websocket/)
- [10 WebSocket Scaling Patterns for Real-Time Dashboards](https://medium.com/@sparknp1/10-websocket-scaling-patterns-for-real-time-dashboards-1e9dc4681741)

### Multiplayer Game Lobby Patterns
- [Create Online Multiplayer Games Based on Lobby - Riven](https://riven.ch/en/news/build-lobby-based-online-multiplayer-browser-games-with-react-and-nodejs)
- [Building a Multiplayer Game Using WebSockets - DEV](https://dev.to/sauravmh/building-a-multiplayer-game-using-websockets-1n63)
- [websocket-game-lobby - npm](https://www.npmjs.com/package/websocket-game-lobby)
- [Lobby System - Colyseus Discussion](https://discuss.colyseus.io/topic/32/lobby-system)

### Server-Authoritative State Management
- [Client-Side Prediction and Server Reconciliation - Gabriel Gambetta](https://www.gabrielgambetta.com/client-side-prediction-server-reconciliation.html)
- [Verifying State & Reconciliation in Collaborative Web Apps](https://midspiral.com/blog/verifying-state-reconciliation-in-collaborative-web-apps/)
- [WebSockets in Realtime Gaming - Pusher](https://pusher.com/blog/websockets-realtime-gaming-low-latency/)

### React WebSocket Integration
- [Real-time Updates with WebSockets and React Hooks - GeeksforGeeks](https://www.geeksforgeeks.org/reactjs/real-time-updates-with-websockets-and-react-hooks/)
- [react-use-websocket - GitHub](https://github.com/robtaussig/react-use-websocket)
- [The Complete Guide to WebSockets with React - Ably](https://ably.com/blog/websockets-react-tutorial)
- [Using WebSockets with React Query - TkDodo](https://tkdodo.eu/blog/using-web-sockets-with-react-query)

### Game Lobby Timer Patterns
- [Game Lobby Sample - Unity](https://docs.unity.com/ugs/manual/lobby/manual/game-lobby-sample)
- [Unity Game Lobby Sample - GitHub](https://github.com/Unity-Technologies/com.unity.services.samples.game-lobby)

---
*Architecture research for: Multiplayer Game Lobby with Real-Time State Synchronization*
*Researched: 2025-01-18*
