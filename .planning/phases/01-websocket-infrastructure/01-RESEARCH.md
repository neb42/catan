# Phase 1: WebSocket Infrastructure - Research

**Researched:** 2026-01-18
**Domain:** Real-time WebSocket communication with Node.js
**Confidence:** HIGH

## Summary

WebSocket infrastructure for a multiplayer game requires careful attention to connection lifecycle management, message validation, reconnection strategies, and stale connection detection. The standard approach uses the `ws` library (already installed) for server-side WebSocket handling with manual ping/pong heartbeats, Zod for runtime message validation, and client-side exponential backoff reconnection.

Key architectural decisions from CONTEXT.md are well-aligned with best practices: UUID v4 client IDs (using Node.js crypto.randomUUID), room-based architecture from the start (enables future scaling), and Zod-based message validation. The 30-second grace period for reconnection is standard industry practice, balancing user experience against resource usage.

**Primary recommendation:** Implement room-based architecture immediately (even for single lobby) using Map<roomId, Map<clientId, connection>> to avoid refactoring later. Use ping/pong heartbeats for stale connection detection rather than relying solely on close events.

## Standard Stack

The established libraries/tools for WebSocket infrastructure in Node.js:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ws | 8.19.0+ | WebSocket server/client | RFC 6455 compliant, minimal overhead, production-proven, already installed |
| zod | 3.x | Runtime schema validation | Type-safe validation, zero dependencies, 2kb gzipped, industry standard |
| crypto (Node.js built-in) | N/A | UUID v4 generation | Native randomUUID() is 3x faster than uuid package, no dependencies |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nanoid | 5.x | Message ID generation | Alternative to crypto.randomUUID for shorter IDs (21 chars vs 36) |
| ulid | 2.x | Sortable message IDs | If message ordering by timestamp is needed (monotonic within same ms) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ws | Socket.IO | Socket.IO adds automatic reconnection, rooms, and fallbacks but with ~40kb overhead and breaking standard WebSocket protocol; ws gives full control |
| Zod | Yup, Joi | Zod is TypeScript-first with better inference and smaller bundle size (2kb vs 15kb+ for alternatives) |
| crypto.randomUUID | uuid package | Native crypto is 3x faster and zero dependencies; uuid only needed for v1/v3/v5 |

**Installation:**
```bash
npm install zod
# ws and crypto are already available
```

## Architecture Patterns

### Recommended Project Structure
```
apps/api/src/websocket/
├── server.ts              # WebSocket server initialization (already exists)
├── connection-manager.ts  # Client connection lifecycle and heartbeats
├── room-manager.ts        # Room-based broadcast and membership
├── message-router.ts      # Type-based message routing with validation
├── schemas/
│   ├── index.ts          # Exported schema types
│   ├── client-messages.ts # Inbound message schemas (JOIN_ROOM, etc.)
│   └── server-messages.ts # Outbound message schemas (CLIENT_ID, ERROR, etc.)
└── types.ts              # Shared WebSocket types
```

### Pattern 1: Connection Lifecycle with Heartbeats
**What:** Track connection state with in-memory Map and ping/pong for stale detection
**When to use:** All WebSocket servers (prevents zombie connections)

**Example:**
```typescript
// Source: https://github.com/websockets/ws official documentation
import { WebSocketServer, WebSocket } from 'ws';

interface ClientConnection {
  id: string;
  ws: WebSocket;
  isAlive: boolean;
  joinedAt: number;
  roomId?: string;
}

const connections = new Map<string, ClientConnection>();

function heartbeat(this: WebSocket) {
  const clientId = findClientIdBySocket(this);
  if (clientId) {
    const conn = connections.get(clientId);
    if (conn) conn.isAlive = true;
  }
}

wss.on('connection', (ws: WebSocket) => {
  const clientId = crypto.randomUUID(); // Node.js built-in, 3x faster than uuid

  connections.set(clientId, {
    id: clientId,
    ws,
    isAlive: true,
    joinedAt: Date.now()
  });

  ws.on('pong', heartbeat);
  ws.on('close', () => handleDisconnect(clientId));
  ws.on('error', (err) => console.error(`Client ${clientId} error:`, err));
});

// Ping every 30 seconds, terminate if no pong
const interval = setInterval(() => {
  connections.forEach((conn) => {
    if (conn.isAlive === false) {
      connections.delete(conn.id);
      return conn.ws.terminate();
    }

    conn.isAlive = false;
    conn.ws.ping();
  });
}, 30000);

wss.on('close', () => clearInterval(interval));
```

### Pattern 2: Room-Based Architecture
**What:** Map<roomId, Set<clientId>> for broadcast targeting
**When to use:** From the start (even for single room) to avoid refactoring

**Example:**
```typescript
// Source: https://dev.to/hexshift/building-a-multi-room-websocket-chat-server-with-user-presence-in-nodejs-1a3d
interface Room {
  id: string;
  clients: Set<string>;
  createdAt: number;
  metadata: {
    capacity: number;
    state: 'waiting' | 'active' | 'full';
  };
}

const rooms = new Map<string, Room>();

function joinRoom(clientId: string, roomId: string): boolean {
  let room = rooms.get(roomId);

  if (!room) {
    room = {
      id: roomId,
      clients: new Set(),
      createdAt: Date.now(),
      metadata: { capacity: 4, state: 'waiting' }
    };
    rooms.set(roomId, room);
  }

  if (room.clients.size >= room.metadata.capacity) {
    return false; // Room full
  }

  room.clients.add(clientId);
  const conn = connections.get(clientId);
  if (conn) conn.roomId = roomId;

  return true;
}

function broadcastToRoom(roomId: string, message: object, excludeClientId?: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const messageStr = JSON.stringify(message);

  room.clients.forEach(clientId => {
    if (clientId === excludeClientId) return;

    const conn = connections.get(clientId);
    if (conn && conn.ws.readyState === WebSocket.OPEN) {
      conn.ws.send(messageStr);
    }
  });
}
```

### Pattern 3: Message Validation with Zod
**What:** Runtime-safe message parsing with automatic TypeScript inference
**When to use:** All incoming WebSocket messages (prevent malicious payloads)

**Example:**
```typescript
// Source: https://egghead.io/lessons/make-a-type-safe-and-runtime-safe-web-socket-communication-with-zod~efw0y
import { z } from 'zod';

// Base message wrapper
const BaseMessage = z.object({
  type: z.string(),
  payload: z.unknown(),
  messageId: z.string().optional(), // Client doesn't send, server adds
  timestamp: z.number().optional()  // Server-generated
});

// Specific message types
const JoinRoomMessage = z.object({
  type: z.literal('JOIN_ROOM'),
  payload: z.object({
    roomId: z.string(),
    clientId: z.string().uuid().optional() // For reconnection
  })
});

const ClientMessageSchema = z.discriminatedUnion('type', [
  JoinRoomMessage,
  // ... other message types
]);

type ClientMessage = z.infer<typeof ClientMessageSchema>;

// Usage in message handler
ws.on('message', (data: Buffer) => {
  try {
    const rawMessage = JSON.parse(data.toString());
    const message = ClientMessageSchema.parse(rawMessage);

    // Now message is type-safe and validated
    routeMessage(clientId, message);
  } catch (err) {
    if (err instanceof z.ZodError) {
      ws.send(JSON.stringify({
        type: 'ERROR',
        payload: { code: 'INVALID_MESSAGE', details: err.errors }
      }));
    }
  }
});
```

### Pattern 4: Client Reconnection with Exponential Backoff
**What:** Progressive retry delays to avoid overwhelming server during outages
**When to use:** All WebSocket clients (prevents thundering herd)

**Example:**
```typescript
// Source: https://dev.to/hexshift/robust-websocket-reconnection-strategies-in-javascript-with-exponential-backoff-40n1
class ReconnectingWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 30000; // 30 seconds
  private baseDelay = 1000; // 1 second
  private clientId: string | null = null;

  connect(url: string) {
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.sendHandshake();
    };

    this.ws.onclose = () => {
      this.scheduleReconnect();
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'CLIENT_ID') {
        this.clientId = message.payload.clientId;
      }
    };
  }

  private sendHandshake() {
    this.ws?.send(JSON.stringify({
      type: 'HANDSHAKE',
      payload: { clientId: this.clientId } // null for new, UUID for reconnect
    }));
  }

  private scheduleReconnect() {
    const delay = this.getBackoffDelay();
    console.log(`Reconnecting in ${delay}ms...`);

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(this.ws!.url);
    }, delay);
  }

  private getBackoffDelay(): number {
    // Exponential backoff with jitter
    const exponentialDelay = Math.min(
      this.baseDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );

    // Add jitter (0-25% random variance) to prevent thundering herd
    const jitter = Math.random() * 0.25 * exponentialDelay;
    return Math.floor(exponentialDelay + jitter);
  }
}
```

### Anti-Patterns to Avoid
- **Relying only on 'close' event for cleanup:** Network issues can leave connections in limbo without triggering close; use ping/pong heartbeats
- **Validating auth only at connection time:** Re-validate authorization for sensitive actions; JWT can expire mid-session
- **Broadcasting to wss.clients directly:** Doesn't allow room targeting or client metadata; maintain separate connection registry
- **Using sequential IDs:** Exposes system state (connection count); use UUID v4 or nanoid
- **No message size limits:** DoS vector; set maxPayload in WebSocketServer options (default 100MB is too high)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Message validation | Custom type checking with if/else | Zod schemas | Handles edge cases (nested objects, unions, refinements), generates TypeScript types, clear error messages |
| Exponential backoff | setTimeout with Math.random | Standard formula with jitter | Prevents thundering herd, well-tested delay curves, proper max caps |
| UUID generation | Math.random + string manipulation | crypto.randomUUID() | Cryptographically secure, collision-resistant, 3x faster, RFC 4122 compliant |
| Heartbeat/ping-pong | Custom isAlive timeout tracking | ws built-in ping/pong | Protocol-level support, automatic pong responses, proper frame handling |
| Room broadcasting | Manual loop with ws.send | Room manager abstraction | Handles edge cases (closed connections, partial sends), cleaner API |

**Key insight:** WebSocket edge cases are subtle (half-closed connections, race conditions during reconnect, binary vs text frames). Use battle-tested patterns rather than reimplementing.

## Common Pitfalls

### Pitfall 1: Missing Ping/Pong Heartbeats
**What goes wrong:** Connections appear active but network path is broken (zombie connections consume resources)
**Why it happens:** WebSocket 'close' event doesn't fire for half-closed TCP connections or network partitions
**How to avoid:** Implement server-side ping/pong with 30-second intervals; terminate connections that don't respond
**Warning signs:** Growing memory usage over time, clients reporting "connected" but messages not delivered

### Pitfall 2: Reconnection Without Grace Period
**What goes wrong:** Brief network blips (WiFi handoff, mobile switching towers) create entirely new sessions
**Why it happens:** Server immediately cleans up on disconnect, client can't recover state
**How to avoid:** Keep connection metadata for 30+ seconds after disconnect; match reconnecting clients by persisted ID
**Warning signs:** Users complain about losing game state during brief disconnections

### Pitfall 3: No Message Validation
**What goes wrong:** Malformed messages crash server, malicious clients exploit type confusion
**Why it happens:** Trusting client input, assuming JSON.parse is sufficient
**How to avoid:** Validate all messages with Zod before processing; send error responses for invalid messages
**Warning signs:** Uncaught exceptions in message handlers, TypeError crashes in production

### Pitfall 4: Broadcast to All Instead of Room
**What goes wrong:** Information leakage (players see other games' state), poor performance at scale
**Why it happens:** wss.clients.forEach is simpler than room management
**How to avoid:** Implement room architecture from day one; maintain Map<roomId, Set<clientId>>
**Warning signs:** Message count grows O(n^2) with connections instead of O(players per room)

### Pitfall 5: No Authentication/Authorization
**What goes wrong:** Any client can send admin actions, join full rooms, or impersonate others
**Why it happens:** WebSocket doesn't have built-in auth like HTTP; developers forget to add it
**How to avoid:** Validate permissions for each message type, not just at connection time
**Warning signs:** Security audits flag WebSocket endpoints, unauthorized state changes occur

### Pitfall 6: Missing Reconnection UI State
**What goes wrong:** Users don't know why app stopped working, close tab during brief network issue
**Why it happens:** Reconnection logic exists but no visual feedback to user
**How to avoid:** Show "Reconnecting..." status during backoff, clear indicator when connection lost
**Warning signs:** Support tickets about "broken app" during WiFi issues

### Pitfall 7: Synchronous Broadcast Blocking
**What goes wrong:** Slow client (bufferedAmount high) blocks broadcasting to other clients
**Why it happens:** ws.send is synchronous; doesn't check if socket is writeable
**How to avoid:** Check ws.readyState === WebSocket.OPEN and bufferedAmount before sending
**Warning signs:** Latency spikes when one client has poor network, message delays cascade

### Pitfall 8: Unbounded Reconnection Attempts
**What goes wrong:** Client battery drain retrying dead server forever, DDoS during outages
**Why it happens:** "Unlimited retry" sounds robust but lacks circuit breaker
**How to avoid:** Exponential backoff caps at 30s (CONTEXT decision), but consider max duration (e.g., 5 minutes) then show "server unavailable"
**Warning signs:** Mobile users report battery drain, server sees sustained high connection rate during outages

## Code Examples

Verified patterns from official sources:

### Server Initialization with Heartbeat
```typescript
// Source: https://github.com/websockets/ws official documentation
import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';

export function initializeWebSocket(httpServer: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({
    server: httpServer,
    maxPayload: 1024 * 1024, // 1MB limit (not 100MB default)
    clientTracking: true
  });

  const connections = new Map<string, { ws: WebSocket; isAlive: boolean }>();

  function heartbeat(this: WebSocket) {
    // Called when pong received
    this.isAlive = true;
  }

  wss.on('connection', (ws: WebSocket) => {
    const clientId = crypto.randomUUID();

    ws.isAlive = true;
    ws.on('error', console.error);
    ws.on('pong', heartbeat);

    connections.set(clientId, { ws, isAlive: true });

    // Send client their ID
    ws.send(JSON.stringify({
      type: 'CLIENT_ID',
      payload: { clientId },
      timestamp: Date.now()
    }));
  });

  // Heartbeat check every 30 seconds
  const interval = setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {
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

  return wss;
}
```

### Zod Message Schemas
```typescript
// Source: https://zod.dev official documentation
import { z } from 'zod';

// Client -> Server messages
export const HandshakeMessage = z.object({
  type: z.literal('HANDSHAKE'),
  payload: z.object({
    clientId: z.string().uuid().nullable() // null = new, UUID = reconnect
  })
});

export const JoinRoomMessage = z.object({
  type: z.literal('JOIN_ROOM'),
  payload: z.object({
    roomId: z.string()
  })
});

export const ClientMessageSchema = z.discriminatedUnion('type', [
  HandshakeMessage,
  JoinRoomMessage
  // Add more message types
]);

export type ClientMessage = z.infer<typeof ClientMessageSchema>;

// Server -> Client messages
export const ClientIdMessage = z.object({
  type: z.literal('CLIENT_ID'),
  payload: z.object({
    clientId: z.string().uuid()
  }),
  messageId: z.string(),
  timestamp: z.number()
});

export const ErrorMessage = z.object({
  type: z.literal('ERROR'),
  payload: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional()
  }),
  messageId: z.string(),
  timestamp: z.number()
});

// Usage
function handleMessage(clientId: string, data: Buffer) {
  try {
    const raw = JSON.parse(data.toString());
    const message = ClientMessageSchema.parse(raw);

    // Type-safe routing
    switch (message.type) {
      case 'HANDSHAKE':
        handleHandshake(clientId, message.payload);
        break;
      case 'JOIN_ROOM':
        handleJoinRoom(clientId, message.payload);
        break;
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendError(clientId, 'INVALID_MESSAGE', err.errors);
    }
  }
}
```

### Room Manager Pattern
```typescript
// Source: https://dev.to/hexshift/building-a-multi-room-websocket-chat-server-with-user-presence-in-nodejs-1a3d
interface Room {
  id: string;
  clients: Set<string>;
  metadata: {
    capacity: number;
    state: 'waiting' | 'active' | 'finished';
    createdAt: number;
  };
}

export class RoomManager {
  private rooms = new Map<string, Room>();
  private clientRooms = new Map<string, string>(); // clientId -> roomId

  createRoom(roomId: string, capacity: number = 4): Room {
    const room: Room = {
      id: roomId,
      clients: new Set(),
      metadata: {
        capacity,
        state: 'waiting',
        createdAt: Date.now()
      }
    };

    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(clientId: string, roomId: string): boolean {
    let room = this.rooms.get(roomId);

    if (!room) {
      room = this.createRoom(roomId);
    }

    if (room.clients.size >= room.metadata.capacity) {
      return false;
    }

    room.clients.add(clientId);
    this.clientRooms.set(clientId, roomId);
    return true;
  }

  leaveRoom(clientId: string): void {
    const roomId = this.clientRooms.get(clientId);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (room) {
      room.clients.delete(clientId);

      // Cleanup empty rooms
      if (room.clients.size === 0) {
        this.rooms.delete(roomId);
      }
    }

    this.clientRooms.delete(clientId);
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getClientRoom(clientId: string): Room | undefined {
    const roomId = this.clientRooms.get(clientId);
    return roomId ? this.rooms.get(roomId) : undefined;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| uuid npm package | crypto.randomUUID() | Node.js 14.17.0 (2021) | 3x faster, zero dependencies, built-in |
| Socket.IO for everything | ws library for control | Ongoing (2024-2026) | Lower overhead, standard protocol compliance, explicit architecture |
| Manual reconnection logic | Exponential backoff with jitter | Established pattern (2020+) | Prevents thundering herd, better UX during outages |
| TypeScript types only | Zod runtime validation | 2020+ adoption | Runtime safety, prevents malicious payloads, auto-generates types |
| Timer-based heartbeats | WebSocket ping/pong frames | Always available, now standard practice | Protocol-level support, proper detection of broken connections |

**Deprecated/outdated:**
- **permessage-deflate compression:** High memory/CPU cost; modern thinking is compress at application layer if needed, not per-message
- **Separate WebSocket port (WS_PORT):** HTTP upgrade pattern is now standard (shares port, simpler infrastructure)
- **Client tracking disabled:** clientTracking: false was optimization; modern servers handle Set iteration fine, tracking enables proper cleanup

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal reconnection timeout for mobile networks**
   - What we know: 30-second grace period is standard, exponential backoff caps at 30s
   - What's unclear: Whether mobile network handoffs (5-10s) need special handling vs WiFi (1-2s)
   - Recommendation: Start with standard 30s grace period; monitor real-world metrics if mobile users report issues

2. **Message ID strategy: UUID vs ULID vs nanoid**
   - What we know: All are collision-resistant; ULID is sortable by timestamp; nanoid is shortest (21 chars)
   - What's unclear: Whether message ordering by ID is needed (CONTEXT doesn't specify)
   - Recommendation: Use crypto.randomUUID() (no dependency) unless ordering required, then ULID

3. **Room cleanup timing**
   - What we know: Empty rooms should be deleted to prevent memory leaks
   - What's unclear: Whether to cleanup immediately on last player leave or keep for potential reconnect
   - Recommendation: Immediate cleanup (rooms are cheap to recreate); if reconnect-to-room needed, add grace period

4. **Client authentication strategy**
   - What we know: No user accounts (CONTEXT), nickname-based, friends-only
   - What's unclear: How to prevent impersonation if client ID is only auth (anyone can send someone else's UUID)
   - Recommendation: Low priority for v0.1 (trusted friends); for production consider shared room password or server-generated session tokens

## Sources

### Primary (HIGH confidence)
- [ws GitHub Repository](https://github.com/websockets/ws) - Official WebSocket library documentation and API reference
- [ws API Documentation](https://github.com/websockets/ws/blob/master/doc/ws.md) - Complete API details for WebSocketServer and WebSocket classes
- [Zod Official Documentation](https://zod.dev/) - Schema definition, validation, and TypeScript integration
- [Node.js crypto.randomUUID()](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID) - Native UUID generation API
- [Node.js crypto module (Refine)](https://refine.dev/blog/node-js-uuid/) - UUID generation methods and performance comparison

### Secondary (MEDIUM confidence)
- [WebSocket Ping/Pong Implementation (VideoSDK)](https://www.videosdk.live/developer-hub/websocket/ping-pong-frame-websocket) - Heartbeat pattern documentation
- [Building Multi-Room WebSocket Chat (DEV.to)](https://dev.to/hexshift/building-a-multi-room-websocket-chat-server-with-user-presence-in-nodejs-1a3d) - Room architecture patterns
- [Robust WebSocket Reconnection with Exponential Backoff (DEV.to)](https://dev.to/hexshift/robust-websocket-reconnection-strategies-in-javascript-with-exponential-backoff-40n1) - Client-side reconnection implementation
- [Type-safe WebSocket with Zod (egghead.io)](https://egghead.io/lessons/make-a-type-safe-and-runtime-safe-web-socket-communication-with-zod~efw0y) - Message validation patterns
- [WebSocket Best Practices (Voodoo Engineering)](https://medium.com/voodoo-engineering/websockets-on-production-with-node-js-bdc82d07bb9f) - Production deployment guidance
- [WebSocket at Scale (OneUpTime)](https://oneuptime.com/blog/post/2026-01-06-nodejs-websocket-socketio-scaling/view) - Scaling patterns with pub/sub
- [WebSocket State Synchronization (cetra3)](https://cetra3.github.io/blog/synchronising-with-websocket/) - State sync with JSON Patch
- [nanoid vs ULID Performance (Medium)](https://prabeshthapa.medium.com/optimizing-your-system-with-the-right-unique-id-uuid-ulid-or-nanoid-78bf8b7bf200) - ID generation comparison
- [WebSocket Architecture Best Practices (Ably)](https://ably.com/topic/websocket-architecture-best-practices) - Production patterns

### Tertiary (LOW confidence - for context only)
- [WebSocket Security Pitfalls (Medium)](https://medium.com/@jacobdiamond/websocket-security-pitfalls-in-action-a85706d4d00e) - Security considerations
- [WebSocket Common Mistakes (Postman Blog)](https://blog.postman.com/websocket-connection-failed/) - Troubleshooting guide
- [WebSocket Security Vulnerabilities (Ably)](https://ably.com/topic/websocket-security) - 9 common security issues
- [ws vs Socket.IO Comparison (DEV.to)](https://dev.to/alex_aslam/nodejs-websockets-when-to-use-ws-vs-socketio-and-why-we-switched-di9) - Library comparison

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - ws library is already installed, Zod is industry standard, crypto.randomUUID is built-in
- Architecture: HIGH - Patterns verified from official documentation and multiple authoritative sources
- Pitfalls: MEDIUM-HIGH - Cross-referenced from production experience articles (2025-2026) and official docs

**Research date:** 2026-01-18
**Valid until:** ~30 days (WebSocket patterns are stable; Zod/ws major versions unlikely to change rapidly)
