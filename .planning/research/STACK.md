# Stack Research

**Domain:** Real-time multiplayer game lobby with WebSocket state synchronization
**Researched:** 2026-01-18
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| ws | ^8.19.0 | WebSocket server (backend) | Already in use. Lightweight, production-ready, handles upgrade pattern. No framework lock-in like Socket.IO. Direct protocol control for game state sync. |
| react-use-websocket | ^4.0.0 | WebSocket client hook (frontend) | Purpose-built React hook with auto-reconnection, exponential backoff, heartbeat/keepalive, message queueing, and shared connections. Handles 90% of WebSocket client complexity out of the box. |
| Zustand | ^5.0.10 | Client-side state management | Minimal boilerplate, hook-based API, handles async naturally, supports transient updates (high-frequency messages without re-renders). Better fit than Redux for small multiplayer lobby state. |
| Zod | ^4.3.5 | Message schema validation | TypeScript-first validation for untrusted WebSocket messages. Runtime safety + compile-time types. Zero dependencies, 2kb gzipped. Industry standard for type-safe message contracts. |
| Immer | ^11.1.3 | Immutable state updates | Simplifies nested state updates in lobby (player list, colors, ready states). Works seamlessly with Zustand. Prevents accidental mutations that cause sync bugs. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nanoid | ^5.0.9 | Client/session ID generation | Generate unique lobby IDs, player IDs, message IDs. 2x faster than UUID, URL-friendly, 130 bytes. Use for tracking messages and identifying clients. |
| @tanstack/react-query | ^5.90.18 | HTTP API state management | Already in use. Keep for REST endpoints (create lobby, fetch lobby history). Do NOT use for WebSocket state - use Zustand instead. |
| date-fns | ^4.1.0 | Timestamp handling | Format WebSocket message timestamps, calculate elapsed time for countdowns. Lighter than moment.js. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| TypeScript strict mode | Type safety across WebSocket boundary | Enable `strict: true` in tsconfig. Define shared message types in libs/ for backend/frontend reuse. |
| WebSocket DevTools (browser extension) | Inspect WebSocket frames in real-time | Chrome/Firefox extensions for debugging message flow without console.log spam. |
| vitest | Unit test message handlers and state reducers | Already configured. Test Zod schemas, Zustand stores, and message handlers independently. |

## Installation

```bash
# Frontend (apps/web)
npm install react-use-websocket zustand zod immer nanoid date-fns

# Backend (apps/api)
npm install zod nanoid
# ws already installed

# Dev dependencies (root)
npm install -D @types/ws
# TypeScript, vitest already installed
```

## Message Protocol Patterns

### Recommended: Typed JSON with Zod Validation

**Structure:**
```typescript
// Shared type definition (libs/shared-types or both apps)
import { z } from 'zod';

// Base message schema
const BaseMessage = z.object({
  id: z.string(),           // nanoid - track message for deduplication
  type: z.string(),         // event discriminator
  timestamp: z.number(),    // Date.now() - for ordering/latency measurement
});

// Specific message schemas
const JoinLobbyMessage = BaseMessage.extend({
  type: z.literal('lobby:join'),
  payload: z.object({
    lobbyId: z.string(),
    playerId: z.string(),
    nickname: z.string().min(1).max(20),
  }),
});

const PlayerReadyMessage = BaseMessage.extend({
  type: z.literal('player:ready'),
  payload: z.object({
    playerId: z.string(),
    ready: z.boolean(),
  }),
});

// Union type for all messages
const WebSocketMessage = z.discriminatedUnion('type', [
  JoinLobbyMessage,
  PlayerReadyMessage,
  // ... other message types
]);

type WebSocketMessage = z.infer<typeof WebSocketMessage>;
```

**Why this pattern:**
- Runtime validation prevents invalid state from entering the system
- TypeScript inference from Zod schemas eliminates type duplication
- Discriminated unions enable type-safe message routing
- Message IDs enable deduplication and acknowledgment tracking
- Timestamps enable latency measurement and event ordering

**Server-side validation:**
```typescript
function handleMessage(ws: WebSocket, data: string) {
  const parsed = WebSocketMessage.safeParse(JSON.parse(data));
  if (!parsed.success) {
    ws.send(JSON.stringify({
      type: 'error',
      error: 'Invalid message format',
      details: parsed.error.format()
    }));
    return;
  }

  // Type-safe routing
  switch (parsed.data.type) {
    case 'lobby:join':
      handleJoinLobby(ws, parsed.data.payload);
      break;
    // ...
  }
}
```

**Client-side usage:**
```typescript
// In React component
const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
  onMessage: (event) => {
    const parsed = WebSocketMessage.safeParse(JSON.parse(event.data));
    if (parsed.success) {
      handleIncomingMessage(parsed.data);
    }
  },
});

function joinLobby(lobbyId: string, nickname: string) {
  sendJsonMessage({
    id: nanoid(),
    type: 'lobby:join',
    timestamp: Date.now(),
    payload: { lobbyId, playerId: myPlayerId, nickname },
  });
}
```

### State Synchronization Pattern: Optimistic Updates with Server Authority

**Client prediction:**
```typescript
// Zustand store with Immer
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

const useLobbyStore = create(
  immer((set) => ({
    players: [],

    // Optimistic: update immediately
    setPlayerReady: (playerId: string, ready: boolean) =>
      set((state) => {
        const player = state.players.find(p => p.id === playerId);
        if (player) player.ready = ready;
      }),

    // Server reconciliation: overwrite with server state
    syncPlayers: (players) =>
      set((state) => {
        state.players = players;
      }),
  }))
);
```

**Pattern:**
1. User action triggers optimistic update (instant UI feedback)
2. Send message to server
3. Server broadcasts authoritative state to all clients
4. Client reconciles with server state (overwrites optimistic update)

**Why this works for lobby:**
- Lobby state is small (3-4 players, ~10 fields each)
- Full state sync every update is acceptable (< 1KB)
- Server is single source of truth, prevents desync
- Optimistic updates provide instant feedback for low-latency feel

**Alternative for game state (NOT lobby):**
- Delta updates (send only changes) for larger game boards
- Client-side prediction + rollback for gameplay
- Not needed for simple lobby with < 10 updates/second

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| ws (native WebSocket) | Socket.IO | If you need: automatic fallback to HTTP long-polling (corporate firewalls), built-in rooms/namespaces, binary event packets. Overhead: larger bundle, framework lock-in. |
| Zustand | Redux Toolkit | If you need: strict architecture for large teams, Redux DevTools time-travel debugging, extensive middleware ecosystem. Overhead: more boilerplate, steeper learning curve. |
| react-use-websocket | Custom useWebSocket hook | If you need: full control over reconnection logic, custom protocol beyond WebSocket (e.g., WebRTC fallback). Effort: must implement reconnection, heartbeat, queueing manually. |
| JSON messages | Binary (MessagePack/Protobuf) | If you need: high-frequency updates (>100/sec), bandwidth optimization. Complexity: tooling, debugging, schema evolution. Not needed for lobby (~5-10 updates/sec). |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Socket.IO | Overkill for modern browsers. Adds 50KB bundle size, custom protocol (not raw WebSocket), framework lock-in. Your use case doesn't need HTTP fallback. | ws (backend) + react-use-websocket (frontend) |
| Redux for WebSocket state | Excessive boilerplate for small lobby state. Async actions, middleware, action creators add complexity without benefit for 3-4 player lobby. | Zustand with Immer middleware |
| Manual JSON validation | Error-prone, no type safety, leads to runtime crashes from malformed messages. TypeScript types alone don't validate at runtime. | Zod schemas with safeParse() |
| Global WebSocket singleton | Breaks React Concurrent Mode, causes stale closures, hard to test, couples components. | react-use-websocket hook with shared connection option |
| Polling for state sync | Wastes bandwidth, adds latency (500ms-2s), doesn't scale. WebSocket is already persistent. | WebSocket push from server on state changes |
| moment.js | 67KB bundle size for simple timestamp formatting. Deprecated in favor of modern alternatives. | date-fns (tree-shakeable, 2KB per function) |

## Stack Patterns by Variant

**If scaling to multiple server instances:**
- Add Redis Pub/Sub for cross-server message broadcasting
- Use sticky sessions (IP-based) in load balancer to keep WebSocket connections on same server
- Store lobby state in Redis for server statelessness
- Pattern: Client connects to any server → server subscribes to lobby:${id} Redis channel → state syncs across servers

**If adding lobby persistence (save/resume):**
- Add database writes on lobby state changes (debounced)
- Use @tanstack/react-query for initial lobby load from REST API
- WebSocket takes over for real-time updates after initial load
- Pattern: HTTP GET /lobby/:id → WebSocket /ws/:lobbyId → hybrid state management

**If adding authentication:**
- Send JWT token in WebSocket connection URL query param: `ws://host/ws?token=${jwt}`
- Validate token in WebSocket upgrade handler before accepting connection
- Store authenticated user ID in WebSocket connection metadata
- Reject unauthenticated connections at handshake (before message flow)

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| react-use-websocket@^4.0.0 | React 19.0.0 | Requires React 18+. Compatible with React 19 (current project version). Uses React 18 hooks internally. |
| Zustand@^5.0.10 | React 19.0.0 | Zustand 5.x works with React 16.8+. No breaking changes for React 19. |
| Zod@^4.3.5 | TypeScript 5.9.2 | Zod 4.x tested against TypeScript 5.5+. Compatible with project's TS 5.9.2. |
| ws@^8.19.0 | Express 5.2.1 | Works with any Node.js HTTP server. Already integrated in project. |
| Immer@^11.1.3 | Zustand 5.x | Zustand has built-in Immer middleware support. No adapter needed. |

## Message Flow Architecture

### Backend (Express + ws)

```typescript
// apps/api/src/websocket/lobby-manager.ts
class LobbyManager {
  private lobbies = new Map<string, Set<WebSocket>>();

  broadcast(lobbyId: string, message: unknown) {
    const clients = this.lobbies.get(lobbyId);
    clients?.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

// apps/api/src/websocket/handlers/lobby-handler.ts
function handleJoinLobby(ws: WebSocket, payload: JoinLobbyPayload) {
  lobbyManager.addClient(payload.lobbyId, ws);

  // Broadcast to all clients in lobby
  lobbyManager.broadcast(payload.lobbyId, {
    type: 'lobby:player_joined',
    payload: {
      playerId: payload.playerId,
      nickname: payload.nickname,
    },
    timestamp: Date.now(),
  });
}
```

### Frontend (React + Zustand + react-use-websocket)

```typescript
// apps/web/src/hooks/useLobbyWebSocket.ts
export function useLobbyWebSocket(lobbyId: string) {
  const syncPlayers = useLobbyStore(state => state.syncPlayers);

  const { sendJsonMessage } = useWebSocket(`${WS_URL}/ws`, {
    queryParams: { lobbyId },
    share: true,  // Share connection across components
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: (attemptNumber) =>
      Math.min(1000 * Math.pow(2, attemptNumber), 30000), // Exponential backoff
    onMessage: (event) => {
      const parsed = WebSocketMessage.safeParse(JSON.parse(event.data));
      if (parsed.success) {
        handleMessage(parsed.data);
      }
    },
    heartbeat: {
      message: JSON.stringify({ type: 'ping' }),
      returnMessage: JSON.stringify({ type: 'pong' }),
      timeout: 60000,  // 60 seconds
      interval: 25000, // 25 seconds
    },
  });

  return { sendJsonMessage };
}
```

## Confidence Assessment

| Technology | Confidence | Source |
|------------|------------|--------|
| ws library | HIGH | Official npm package, project already uses it successfully |
| react-use-websocket | HIGH | Official GitHub README, 4.0.0 supports React 18+ including React 19 |
| Zustand | HIGH | Official GitHub, npm package data shows 5.0.10 latest, 15M+ weekly downloads |
| Zod | HIGH | Official docs at zod.dev, npm shows 4.3.5 published Jan 2026, 57M+ weekly downloads |
| Immer | HIGH | Official docs at immerjs.github.io, npm shows 11.1.3 latest |
| State sync patterns | MEDIUM | Multiple sources (Medium, DEV.to, Pusher blog) agree on optimistic updates + server authority for multiplayer lobbies. No single authoritative source. |
| Reconnection patterns | HIGH | Official react-use-websocket docs confirm exponential backoff support, validated across multiple 2025-2026 sources |
| Message validation patterns | HIGH | Official Zod docs + egghead.io tutorial confirm WebSocket validation patterns |

## Sources

**Official Documentation:**
- [Zod Official Docs](https://zod.dev/) - Schema validation patterns, version 4.3.5
- [Zustand GitHub](https://github.com/pmndrs/zustand) - State management patterns, WebSocket integration discussions
- [react-use-websocket GitHub](https://github.com/robtaussig/react-use-websocket) - Reconnection, heartbeat, message queueing features
- [Immer Official Docs](https://immerjs.github.io/immer/) - Immutable update patterns with React

**npm Package Versions:**
- [Zustand npm](https://www.npmjs.com/package/zustand) - v5.0.10, 15.4M weekly downloads
- [Zod npm](https://www.npmjs.com/package/zod) - v4.3.5, 57.6M weekly downloads
- [Immer npm](https://www.npmjs.com/package/immer) - v11.1.3, recent publication

**WebSocket Patterns & Best Practices (2025-2026):**
- [WebSockets in realtime gaming - Pusher](https://pusher.com/blog/websockets-realtime-gaming-low-latency/) - Low latency patterns, state sync
- [Using WebSockets with React Query - TkDodo](https://tkdodo.eu/blog/using-web-sockets-with-react-query) - Integration patterns
- [Multiplayer Game with WebSockets - Medium](https://medium.com/@diegolikescode/multiplayer-game-with-websockets-fd629686aaec) - Architecture patterns
- [Real-Time Gaming Infrastructure - Confluent](https://www.confluent.io/blog/real-time-gaming-infrastructure-kafka-ksqldb-websockets/) - Scalability patterns
- [WebSocket Reconnection with Exponential Backoff - DEV.to](https://dev.to/hexshift/robust-websocket-reconnection-strategies-in-javascript-with-exponential-backoff-40n1) - Reconnection patterns

**State Management Comparisons (2026):**
- [Zustand vs Redux in 2026 - Medium](https://medium.com/@arslannaz195/zustand-vs-redux-in-2026-why-i-switched-and-you-should-too-c119dd840ddb) - State management decision criteria
- [Zustand vs Redux Toolkit - Medium](https://medium.com/@sangramkumarp530/zustand-vs-redux-toolkit-which-should-you-use-in-2026-903304495e84) - 2026 recommendations

**Message Validation:**
- [Make Type-safe WebSocket Communication with Zod - egghead.io](https://egghead.io/lessons/make-a-type-safe-and-runtime-safe-web-socket-communication-with-zod~efw0y) - Validation patterns
- [Schema validation with Zod - LogRocket](https://blog.logrocket.com/schema-validation-typescript-zod/) - TypeScript integration

**ID Generation:**
- [Nano ID - GitHub](https://github.com/ai/nanoid) - Unique ID generation for messages/clients
- [Comparing UUID, CUID, and Nanoid - DEV.to](https://dev.to/turck/comparing-uuid-cuid-and-nanoid-a-developers-guide-50c) - ID generation comparison

---
*Stack research for: Real-time multiplayer game lobby with WebSocket state synchronization*
*Researched: 2026-01-18*
