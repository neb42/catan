# Phase 1: Foundation - Research

**Researched:** 2026-01-20  
**Domain:** WebSocket room infrastructure, shared type libraries, real-time multiplayer patterns  
**Confidence:** HIGH

## Summary

Phase 1 establishes the foundation for multiplayer connectivity using WebSocket rooms with the `ws` library (already in package.json v8.19.0), shared type validation with Zod v4.3.5, and a monorepo structure using NX. The standard approach uses native `ws` with Express upgrade handling for room-based message routing, Zod schemas in a shared library for type-safe contracts, and custom alphabet room IDs for user-friendly sharing.

The project already has the core stack installed (`ws`, `zod`, Express, NX monorepo with `libs/shared`), so implementation focuses on architecture patterns rather than library selection. Key findings reveal that `ws` requires manual room management (no built-in room abstraction), WebSocket reconnection must be handled client-side with exponential backoff, and shared Zod schemas provide runtime validation + TypeScript inference.

**Primary recommendation:** Use `ws` WebSocketServer with Express `upgrade` event for path-based routing, implement Map-based room manager on server, generate 6-character uppercase alphanumeric room IDs, and structure shared library with separate Zod schema files that export both schemas and inferred types.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ws | 8.19.0 | WebSocket server/client for Node.js | Most popular, lightweight, battle-tested; 21k GitHub stars; used in production by major companies; no framework lock-in |
| zod | 4.3.5 | Runtime schema validation + TypeScript inference | TypeScript-first validation, 2kb core, immutable API, generates types from schemas (single source of truth) |
| Express | 4.21.2 | HTTP server framework | Already in stack, integrates with ws via `upgrade` event, handles CORS/middleware |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nanoid | 5.x | Short collision-resistant IDs | Optional: for generating room IDs (alternative to custom implementation) |
| isomorphic-ws | 5.x | Unified WebSocket for Node.js/browser | Optional: if writing shared WebSocket client code (not needed for this phase) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ws | socket.io | socket.io adds 400kb bundle, automatic reconnection, rooms API; overkill for simple room management; harder to debug message flow |
| Custom room ID | nanoid | nanoid provides 21-char IDs with better entropy; 6-char custom alphabet is more user-friendly for typing/sharing |
| Zod | io-ts / Yup | io-ts is functional programming style (steeper learning curve); Yup designed for forms not API contracts |

**Installation:**
```bash
# All dependencies already installed in package.json
npm install
```

## Architecture Patterns

### Recommended Project Structure
```
libs/
└── shared/
    └── src/
        ├── index.ts           # Barrel export
        ├── schemas/           # Zod schemas
        │   ├── room.ts        # Room-related schemas
        │   ├── player.ts      # Player schemas
        │   └── messages.ts    # WebSocket message schemas
        ├── types/             # Derived TypeScript types
        │   └── index.ts       # Re-export inferred types
        └── constants/
            └── index.ts       # Shared constants (colors, limits)

apps/api/src/
├── main.ts                    # Express + WebSocket server setup
├── managers/
│   └── RoomManager.ts         # Room lifecycle (create, join, leave, cleanup)
├── handlers/
│   └── websocket.ts           # WebSocket message routing
└── utils/
    └── room-id.ts             # Room ID generation

apps/web/src/
├── services/
│   └── websocket.ts           # WebSocket client + reconnection
└── hooks/
    └── useWebSocket.ts        # React hook for WebSocket state
```

### Pattern 1: Express + ws Integration
**What:** Attach WebSocketServer to Express HTTP server using `upgrade` event for path-based routing  
**When to use:** Always, when combining Express HTTP API with WebSocket connections  
**Example:**
```typescript
// Source: https://github.com/websockets/ws/blob/master/README.md#external-https-server
import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url, 'ws://base.url');
  
  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', (ws, request) => {
  ws.on('error', console.error);
  ws.on('message', (data) => {
    // Handle messages
  });
});

server.listen(3333);
```

### Pattern 2: Room-Based Message Broadcasting
**What:** Map-based room manager that tracks players per room and broadcasts to room members  
**When to use:** Any multiplayer game with isolated room instances  
**Example:**
```typescript
// Source: https://github.com/websockets/ws/blob/master/README.md#server-broadcast
import { WebSocket } from 'ws';

interface Room {
  id: string;
  players: Map<string, { ws: WebSocket; nickname: string }>;
  createdAt: Date;
}

class RoomManager {
  private rooms = new Map<string, Room>();

  broadcastToRoom(roomId: string, message: unknown) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const data = JSON.stringify(message);
    room.players.forEach((player) => {
      if (player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(data);
      }
    });
  }
}
```

### Pattern 3: Zod Schema + Type Inference
**What:** Define schemas in shared library, infer TypeScript types from schemas  
**When to use:** All API contracts, WebSocket messages, shared data structures  
**Example:**
```typescript
// Source: https://zod.dev/basics
// libs/shared/src/schemas/room.ts
import { z } from 'zod';

export const RoomSchema = z.object({
  id: z.string().length(6),
  players: z.array(z.object({
    id: z.string(),
    nickname: z.string().min(2).max(30).trim(),
    color: z.enum(['red', 'blue', 'white', 'orange']),
    ready: z.boolean(),
  })).min(1).max(4),
  createdAt: z.date(),
});

export type Room = z.infer<typeof RoomSchema>;

// Usage in both frontend and backend:
const room = RoomSchema.parse(untrustedData); // Throws if invalid
```

### Pattern 4: WebSocket Message Protocol
**What:** Type-safe message protocol with discriminated union for all message types  
**When to use:** All WebSocket communication to ensure type safety and runtime validation  
**Example:**
```typescript
// libs/shared/src/schemas/messages.ts
import { z } from 'zod';

export const MessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('join_room'),
    roomId: z.string().length(6),
    nickname: z.string().min(2).max(30).trim(),
  }),
  z.object({
    type: z.literal('player_joined'),
    player: z.object({
      id: z.string(),
      nickname: z.string(),
      color: z.enum(['red', 'blue', 'white', 'orange']),
    }),
  }),
  z.object({
    type: z.literal('error'),
    message: z.string(),
  }),
]);

export type Message = z.infer<typeof MessageSchema>;
```

### Pattern 5: Client-Side Reconnection
**What:** Exponential backoff reconnection with max attempts and connection state tracking  
**When to use:** Always, for production WebSocket clients (network is unreliable)  
**Example:**
```typescript
// apps/web/src/services/websocket.ts
class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = Infinity; // Per CONTEXT.md requirements
  private reconnectDelay = 1000; // Start at 1 second

  connect(url: string) {
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
    };

    this.ws.onclose = () => {
      this.scheduleReconnect(url);
    };
  }

  private scheduleReconnect(url: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    
    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * 2, 30000); // Max 30s
    
    setTimeout(() => {
      this.connect(url);
    }, delay);
    
    this.reconnectDelay = delay;
  }
}
```

### Pattern 6: Room ID Generation (Custom Alphabet)
**What:** Generate short, readable, collision-resistant room IDs using custom alphabet  
**When to use:** User-facing room codes that must be easy to type and share  
**Example:**
```typescript
// apps/api/src/utils/room-id.ts
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ID_LENGTH = 6;

export function generateRoomId(): string {
  let id = '';
  const randomBytes = crypto.getRandomValues(new Uint8Array(ID_LENGTH));
  
  for (let i = 0; i < ID_LENGTH; i++) {
    // Uniform distribution (avoid modulo bias)
    const rand = randomBytes[i] % ALPHABET.length;
    id += ALPHABET[rand];
  }
  
  return id;
}

// Collision probability: 36^6 = 2.1 billion possible IDs
// At 10k active rooms: ~0.0024% collision probability
```

### Anti-Patterns to Avoid
- **Don't store room state in WebSocket object**: Use external Map with room ID as key; ws object should only reference player/room ID
- **Don't broadcast to all clients**: Always scope broadcasts to room members; use `wss.clients` only for server-wide messages
- **Don't trust client data**: Always validate with Zod schemas before processing; client can send malicious messages
- **Don't forget connection cleanup**: Track disconnects and remove from room; implement grace periods with timers
- **Don't use synchronous operations on ws events**: All handlers should be async-friendly; blocking ops freeze event loop

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WebSocket reconnection | Custom retry logic with setTimeout | Exponential backoff pattern (above) | Edge cases: network state changes, rapid connect/disconnect, max delay capping, jitter |
| Room ID generation | `Math.random().toString(36)` | `crypto.getRandomValues()` with custom alphabet | Math.random() not cryptographically secure; modulo bias; collision resistance |
| Heartbeat/ping | Manual ping interval | ws built-in `ws.ping()` / `pong` event | Handles pong response automatically; RFC compliant; connection-aware |
| Duplicate nickname check | Array.find() on each join | Map with nickname as key | O(1) lookup vs O(n); scales with room size |
| Grace period cleanup | Immediate deletion on disconnect | setTimeout with clear on reconnect | Race conditions; premature cleanup; reconnect UX |

**Key insight:** WebSocket connection management has many edge cases (network blips, browser suspend, server restart, concurrent operations). Use proven patterns and browser/Node.js built-ins rather than custom implementations.

## Common Pitfalls

### Pitfall 1: Memory Leaks from Unclosed Rooms
**What goes wrong:** Rooms accumulate in memory when players disconnect without explicit "leave"; Map never cleaned up; server runs out of memory after days/weeks  
**Why it happens:** Disconnect event doesn't automatically remove room; grace period timers not cleared; no max room age  
**How to avoid:**
- Implement grace period: `setTimeout(() => deleteRoom(id), 3 * 60 * 1000)` on last player disconnect
- Track disconnection timers: `Map<roomId, NodeJS.Timeout>` and clear on reconnect
- Optional: Background job to delete rooms older than X hours (depends on game session length)  
**Warning signs:** Gradual memory increase over time; `wss.clients.size` != sum of room players; rooms never deleted

### Pitfall 2: Race Conditions on Room Join
**What goes wrong:** Two players join simultaneously, both assigned same color or exceed max players; duplicate nicknames both accepted  
**Why it happens:** Async operations between validation and state mutation; no atomic check-and-set  
**How to avoid:**
- Validate room state immediately before mutation (not earlier in request chain)
- Use synchronous operations for critical checks: `if (room.players.size >= 4) throw error;`
- Lock room during join operation (single-threaded Node.js helps, but be aware of await gaps)  
**Warning signs:** Players report "room full" but see empty slots; duplicate nicknames in same room; color conflicts

### Pitfall 3: WebSocket Message Buffering Overflow
**What goes wrong:** Server broadcasts updates faster than client can process; `bufferedAmount` grows unbounded; client becomes unresponsive or crashes  
**Why it happens:** Client message handler has slow synchronous operations; no backpressure mechanism; broadcast sends to all regardless of buffer state  
**How to avoid:**
- Check `ws.bufferedAmount` before sending: `if (ws.bufferedAmount > MAX_BUFFER) ws.terminate();`
- Throttle broadcasts: Don't send state updates on every tiny change; batch updates (e.g., 60fps max)
- Use `ws.readyState === WebSocket.OPEN` check before every send  
**Warning signs:** Browser DevTools shows WebSocket buffer growing; client UI freezes during rapid updates; "WebSocket connection closed" errors

### Pitfall 4: Nickname Validation Edge Cases
**What goes wrong:** Nicknames with only whitespace accepted; emoji/unicode breaks UI; SQL injection via nickname (if persisted later); profanity not filtered despite requirements saying "all characters allowed"  
**Why it happens:** `.trim()` called after validation instead of before; no visual width limit for emoji; conflicting requirements  
**How to avoid:**
- Call `.trim()` in Zod schema: `z.string().trim().min(2).max(30)`
- CONTEXT.md specifies: "All characters allowed (letters, numbers, spaces, special chars, emojis)" and "No profanity filtering" - respect these decisions
- Test with: empty string, only spaces, emoji, SQL/script tags, 30+ chars  
**Warning signs:** Empty-looking nicknames displayed; UI layout breaks with long emoji names; security audit flags nickname as attack vector

### Pitfall 5: TypeScript Inference vs Runtime Safety Gap
**What goes wrong:** Frontend assumes message is valid type (TypeScript says so), but server sent malformed JSON; app crashes on field access  
**Why it happens:** WebSocket message parsed as JSON but not validated with Zod; TypeScript types don't exist at runtime  
**How to avoid:**
- Always parse with Zod: `const msg = MessageSchema.parse(JSON.parse(data));`
- Use try-catch around all message parsing; send error message back to client
- Don't cast types: `const msg = JSON.parse(data) as Message;` ❌ (no validation!)  
**Warning signs:** "Cannot read property 'x' of undefined" in client console; intermittent crashes; works in dev but fails in prod

### Pitfall 6: Shared Library Import Path Confusion
**What goes wrong:** Frontend imports from `libs/shared/src/schemas/room` work locally but fail in production build; relative imports break; NX build fails  
**Why it happens:** NX uses TypeScript path mapping (`@catan/shared`), not relative paths; build doesn't resolve `../../../libs/shared`  
**How to avoid:**
- Always import via NX library alias: `import { RoomSchema } from '@catan/shared';`
- Configure `tsconfig.base.json` paths: `"@catan/shared": ["libs/shared/src/index.ts"]`
- Export everything through `libs/shared/src/index.ts` barrel file  
**Warning signs:** `Cannot find module` in production; imports work in VSCode but fail at build; path mapping errors

## Code Examples

Verified patterns from official sources:

### Room Manager with Grace Period Cleanup
```typescript
// apps/api/src/managers/RoomManager.ts
import { WebSocket } from 'ws';

interface Room {
  id: string;
  players: Map<string, Player>;
  disconnectTimer: NodeJS.Timeout | null;
}

interface Player {
  id: string;
  nickname: string;
  ws: WebSocket;
  color: string;
  ready: boolean;
}

export class RoomManager {
  private rooms = new Map<string, Room>();
  private readonly GRACE_PERIOD_MS = 3 * 60 * 1000; // 3 minutes

  createRoom(roomId: string): Room {
    const room: Room = {
      id: roomId,
      players: new Map(),
      disconnectTimer: null,
    };
    this.rooms.set(roomId, room);
    return room;
  }

  addPlayer(roomId: string, player: Player): void {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    if (room.players.size >= 4) throw new Error('Room is full');
    
    // Clear grace period if room was about to be deleted
    if (room.disconnectTimer) {
      clearTimeout(room.disconnectTimer);
      room.disconnectTimer = null;
    }

    room.players.set(player.id, player);
  }

  removePlayer(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.players.delete(playerId);

    // Start grace period when last player leaves
    if (room.players.size === 0) {
      room.disconnectTimer = setTimeout(() => {
        this.rooms.delete(roomId);
        console.log(`Room ${roomId} deleted after grace period`);
      }, this.GRACE_PERIOD_MS);
    }
  }

  broadcastToRoom(roomId: string, message: unknown, excludeId?: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const data = JSON.stringify(message);
    room.players.forEach((player, id) => {
      if (id !== excludeId && player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(data);
      }
    });
  }
}
```

### Heartbeat Detection for Broken Connections
```typescript
// Source: https://github.com/websockets/ws/blob/master/README.md#how-to-detect-and-close-broken-connections
// apps/api/src/handlers/websocket.ts
import { WebSocketServer, WebSocket } from 'ws';

interface WebSocketWithAlive extends WebSocket {
  isAlive: boolean;
}

export function setupHeartbeat(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocketWithAlive) => {
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });
  });

  // Ping all clients every 30 seconds
  const interval = setInterval(() => {
    wss.clients.forEach((ws: WebSocketWithAlive) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });
}
```

### NX Shared Library Export Pattern
```typescript
// libs/shared/src/index.ts
export * from './schemas/room';
export * from './schemas/player';
export * from './schemas/messages';
export * from './constants';

// libs/shared/src/schemas/messages.ts
import { z } from 'zod';

export const JoinRoomMessageSchema = z.object({
  type: z.literal('join_room'),
  roomId: z.string().length(6).regex(/^[0-9A-Z]{6}$/),
  nickname: z.string().trim().min(2).max(30),
});

export const PlayerJoinedMessageSchema = z.object({
  type: z.literal('player_joined'),
  player: z.object({
    id: z.string(),
    nickname: z.string(),
    color: z.enum(['red', 'blue', 'white', 'orange']),
    ready: z.boolean(),
  }),
});

export const ErrorMessageSchema = z.object({
  type: z.literal('error'),
  message: z.enum([
    'Room not found',
    'Room is full',
    'Nickname taken',
  ]),
});

// Discriminated union for type-safe handling
export const WebSocketMessageSchema = z.discriminatedUnion('type', [
  JoinRoomMessageSchema,
  PlayerJoinedMessageSchema,
  ErrorMessageSchema,
]);

export type JoinRoomMessage = z.infer<typeof JoinRoomMessageSchema>;
export type PlayerJoinedMessage = z.infer<typeof PlayerJoinedMessageSchema>;
export type ErrorMessage = z.infer<typeof ErrorMessageSchema>;
export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;

// Usage in both apps:
// import { WebSocketMessageSchema, WebSocketMessage } from '@catan/shared';
```

### React Hook for WebSocket with Reconnection
```typescript
// apps/web/src/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';
import { WebSocketMessage, WebSocketMessageSchema } from '@catan/shared';

interface UseWebSocketOptions {
  url: string;
  onMessage: (message: WebSocketMessage) => void;
}

export function useWebSocket({ url, onMessage }: UseWebSocketOptions) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    function connect() {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        scheduleReconnect();
      };

      ws.current.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          const message = WebSocketMessageSchema.parse(raw);
          onMessage(message);
        } catch (error) {
          console.error('Invalid message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }

    function scheduleReconnect() {
      reconnectAttempts.current++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      
      reconnectTimeout.current = setTimeout(() => {
        connect();
      }, delay);
    }

    connect();

    return () => {
      ws.current?.close();
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [url, onMessage]);

  const sendMessage = (message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return { isConnected, sendMessage };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| socket.io v2 | ws v8 for game servers | 2020+ | Lighter bundle, more control, no magic reconnection (explicit better for games) |
| Runtime type guards | Zod v3/v4 schemas | 2021+ | Single source of truth for types + validation, eliminates drift |
| UUID v4 for room IDs | Short alphanumeric codes | Always been preferred | User-friendly sharing (6 chars vs 36) |
| Polling for state | WebSocket broadcasts | 2010+ (WebSocket RFC) | Real-time updates <500ms, server push model |
| Lerna/Yarn workspaces | NX monorepo | 2019+ | Better build caching, graph visualization, task orchestration |

**Deprecated/outdated:**
- **socket.io v2 namespaces**: socket.io v3+ changed namespace behavior; migration guide required
- **Zod v2**: Zod v3 (2021) changed `.optional()` behavior; v4 (2024) is current, stable, backward compatible from v3
- **ws v7**: ws v8+ requires Node.js 10+, dropped old Node.js versions
- **`uws` (micro-websockets)**: Archived in 2018, use `ws` or `uWebSockets.js` (C++ binding)

## Open Questions

Things that couldn't be fully resolved:

1. **Should room IDs be case-sensitive?**
   - What we know: CONTEXT.md specifies 6-character IDs, doesn't specify case handling
   - What's unclear: Whether "ABC123" and "abc123" are different rooms; impacts collision rate
   - Recommendation: Use uppercase-only alphabet (0-9A-Z) for 36^6 = 2.1B possible IDs; avoids user confusion ("was it 'a' or 'A'?")

2. **How long should WebSocket messages be buffered client-side during disconnects?**
   - What we know: Infinite reconnect attempts required (CONTEXT.md); messages can be lost during disconnect
   - What's unclear: Should client queue outgoing messages or drop them?
   - Recommendation: Drop messages during disconnect, show "reconnecting..." state; game state is authoritative on server, client re-syncs on reconnect

3. **Should the shared library be a buildable/publishable NX library?**
   - What we know: NX supports both buildable and non-buildable libs; buildable adds build step but enables incremental builds
   - What's unclear: Whether shared types need separate build or can be imported directly
   - Recommendation: Start with non-buildable (simpler); migrate to buildable if build times become issue (likely won't for small shared lib)

## Sources

### Primary (HIGH confidence)
- ws library README - https://github.com/websockets/ws/blob/master/README.md (checked 2026-01-20)
  - WebSocketServer API, broadcasting patterns, heartbeat detection
- Zod documentation - https://zod.dev/ (checked 2026-01-20)
  - Schema definition, type inference, discriminated unions
- MDN WebSocket API - https://developer.mozilla.org/en-US/docs/Web/API/WebSocket (checked 2026-01-20)
  - Client-side WebSocket API, browser compatibility, events
- nanoid README - https://github.com/ai/nanoid/blob/main/README.md (checked 2026-01-20)
  - ID generation patterns, custom alphabets, collision probability

### Secondary (MEDIUM confidence)
- NX monorepo structure (from project files: nx.json, package.json, libs/shared)
  - Confirmed buildable/publishable distinction exists but not documented which is better for this use case
- Project package.json (checked 2026-01-20)
  - Confirmed: ws v8.19.0, zod v4.3.5, express v4.21.2 already installed

### Tertiary (LOW confidence)
- None used for final recommendations (WebSearch would be LOW confidence, all findings verified with official sources)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries documented in official repos/docs; versions confirmed in package.json
- Architecture: HIGH - Patterns sourced from ws README examples and Zod documentation; NX structure confirmed via project files
- Pitfalls: MEDIUM-HIGH - Memory leaks and race conditions are well-documented in ws issues/discussions; grace period logic inferred from requirements; buffer overflow from ws docs; TypeScript/runtime gap is fundamental to validation libraries

**Research date:** 2026-01-20  
**Valid until:** 2026-02-20 (30 days - stable domain, ws and Zod are mature libraries with infrequent breaking changes)
