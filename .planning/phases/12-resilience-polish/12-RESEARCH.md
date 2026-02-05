# Phase 12: Resilience & Polish - Research

**Researched:** 2026-02-05
**Domain:** WebSocket reconnection, state persistence, lobby UX, mobile responsive design
**Confidence:** HIGH

## Summary

This phase makes the multiplayer game production-ready by handling the realities of network failures, mobile usage, and user experience polish. Research focused on five key areas: WebSocket disconnect/reconnect patterns, game state persistence and restoration, multiplayer lobby ready-up systems, event log UI design, and mobile responsive patterns for board games.

The standard approach for WebSocket resilience involves three layers: (1) protocol-level heartbeat/ping-pong to detect dead connections, (2) automatic exponential backoff reconnection on the client, and (3) server-side session restoration that allows players to rejoin with their exact game state. For lobbies, the established pattern is independent color selection and ready states with a countdown that triggers when all players are ready, resettable if anyone unreadies. Mobile responsiveness requires viewport-aware CSS units (dvh instead of vh), touch-friendly target sizes (44px minimum), and collapsible panels for space-constrained screens.

Key discoveries: The ws library project is already using exponential backoff reconnection (good foundation), but needs heartbeat detection to catch silent failures. localStorage is appropriate for room codes and nicknames but should never store sensitive data. Mantine's AppShell with responsive breakpoints handles mobile sidebars cleanly. The new CSS dynamic viewport units (dvh, svh, lvh) solve the notorious mobile Safari address bar problem.

**Primary recommendation:** Implement server-side heartbeat with 30-second ping intervals, add session-based state restoration keyed by roomId+nickname, use Mantine's responsive utilities with 44px touch targets, and leverage the existing exponential backoff client (already at 1s initial, 30s max).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ws | 8.19.0 | WebSocket server/client | De facto Node.js WebSocket library, implements HyBi drafts 13-17, passes Autobahn test suite |
| React useEffect | 19.x | Connection lifecycle | Standard pattern for WebSocket cleanup and preventing memory leaks |
| localStorage API | Native | Client state persistence | Built-in browser API for persisting room codes, nicknames, preferences (5-10MB capacity) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Mantine AppShell | 8.3.x | Responsive layout | Collapsible sidebars with mobile/desktop breakpoint control |
| Mantine Notifications | 8.3.x | Toast notifications | Player reconnection alerts, connection status feedback |
| CSS dvh/svh units | Native | Mobile viewport | Replacing vh on mobile to account for dynamic browser UI |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ws | socket.io | socket.io adds automatic reconnection and room management but increases bundle size and adds abstraction layer; ws is already in use and sufficient |
| localStorage | IndexedDB | IndexedDB supports 50GB+ but adds complexity; localStorage's 5-10MB is sufficient for room codes and basic state |
| Custom backoff | Third-party retry library | Project already has working exponential backoff (1s-30s), no need to replace |

**Installation:**
```bash
# Already installed - no new dependencies needed
# ws: 8.19.0
# @mantine/core: 8.3.12
# @mantine/notifications: 8.3.13
```

## Architecture Patterns

### WebSocket Lifecycle Management

**Pattern: useEffect with Cleanup**
```typescript
// Source: https://dev.to/werliton/useeffect-with-cleanup-function-in-react-what-it-is-when-to-use-it-and-why-k18
// https://medium.com/@saundhkulwindar/useeffect-cleanup-patterns-in-react-native-4503916faa96

useEffect(() => {
  const socket = new WebSocket('wss://api.example.com');

  socket.onopen = () => { /* connection logic */ };
  socket.onmessage = (event) => { /* handle messages */ };
  socket.onerror = (error) => { /* handle errors */ };

  // CRITICAL: Return cleanup function
  return () => {
    socket.close(); // Prevents memory leaks
  };
}, [dependencies]);
```

**Why this matters:** WebSocket connections that aren't closed on component unmount cause memory leaks. Each leaked connection consumes resources and continues sending heartbeats, degrading performance over time.

### Server-Side Heartbeat Pattern

**Pattern: Ping/Pong with Termination**
```typescript
// Source: https://www.npmjs.com/package/ws (FAQ section)
// https://oneuptime.com/blog/post/2026-01-27-websocket-heartbeat/view

const HEARTBEAT_INTERVAL = 30000; // 30 seconds (industry standard)
const HEARTBEAT_TIMEOUT = 35000;  // Grace period

function heartbeat(this: ExtendedWebSocket) {
  this.isAlive = true;
}

wss.on('connection', (ws: ExtendedWebSocket) => {
  ws.isAlive = true;
  ws.on('pong', heartbeat);

  // Send initial ping
  ws.ping();
});

// Periodic check
setInterval(() => {
  wss.clients.forEach((ws: ExtendedWebSocket) => {
    if (ws.isAlive === false) {
      return ws.terminate(); // Dead connection
    }

    ws.isAlive = false;
    ws.ping(); // Expect pong response
  });
}, HEARTBEAT_INTERVAL);
```

**Critical detail:** The ws library automatically sends pong responses to ping frames. The pattern marks connections as "dead" if they don't respond within one interval cycle.

### State Restoration Pattern

**Pattern: Session-Based Reconnection**
```typescript
// Source: https://docs.accelbyte.io/gaming-services/knowledge-base/graceful-disruption-handling/lobby-websocket-recovery/
// https://oneuptime.com/blog/post/2026-01-24-websocket-reconnection-logic/view

// Server-side session storage
interface PlayerSession {
  roomId: string;
  playerId: string;
  nickname: string;
  lastSeen: number;
  gameState: GameState;
}

// On connection
function handleReconnect(roomId: string, nickname: string) {
  const session = sessions.get(`${roomId}:${nickname}`);

  if (session && Date.now() - session.lastSeen < SESSION_TIMEOUT) {
    // Restore full game state
    return {
      type: 'reconnect_success',
      playerId: session.playerId,
      gameState: session.gameState,
      // Include any missed events if needed
    };
  }

  return { type: 'reconnect_failed', reason: 'session_expired' };
}
```

**Key insight:** Match by roomId+nickname (not just playerId) since clients lose connection state. Server keeps sessions alive for a grace period to handle brief disconnects.

### Exponential Backoff Reconnection

**Pattern: Backoff with Jitter**
```typescript
// Source: https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/retry-backoff.html
// https://www.baeldung.com/resilience4j-backoff-jitter

// Project already implements this correctly in websocket.ts
const INITIAL_DELAY = 1000;  // 1 second
const MAX_DELAY = 30000;     // 30 seconds
const MAX_ATTEMPTS = Infinity; // User decides when to stop

function calculateDelay(attempt: number): number {
  const exponential = Math.min(
    INITIAL_DELAY * Math.pow(2, attempt),
    MAX_DELAY
  );

  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.3 * exponential;
  return exponential + jitter;
}
```

**Why jitter matters:** Without jitter, all disconnected clients retry simultaneously, creating load spikes. Random jitter (±30%) spreads reconnection attempts over time.

### Lobby Ready System

**Pattern: Independent States with Countdown**
```typescript
// Source: https://docs.unity.com/ugs/manual/lobby/manual/game-lobby-sample
// https://heroiclabs.com/docs/nakama/guides/concepts/lobby/

interface LobbyPlayer {
  id: string;
  nickname: string;
  color: string;
  isReady: boolean;
}

function checkStartConditions(lobby: Lobby): boolean {
  const playerCount = lobby.players.length;
  const allReady = lobby.players.every(p => p.isReady);

  // Game starts when 3-4 players all ready
  return playerCount >= 3 && playerCount <= 4 && allReady;
}

// Countdown resets if anyone unreadies
function handleUnready(lobby: Lobby, playerId: string) {
  lobby.players.find(p => p.id === playerId).isReady = false;
  lobby.countdown = null; // Reset countdown to full duration
  broadcast(lobby, { type: 'countdown_cancelled' });
}
```

**UX insight:** Countdown creates anticipation and gives players time to notice game is starting. Resetting on unready prevents accidental starts.

### Responsive Mobile Layout

**Pattern: Mantine AppShell with Breakpoints**
```typescript
// Source: https://mantine.dev/core/app-shell/
// https://mantine.dev/styles/responsive/

<AppShell
  navbar={{
    width: { base: '100%', sm: 300 }, // Full width on mobile
    breakpoint: 'sm',                 // Toggle point
    collapsed: { mobile: !opened, desktop: false }
  }}
>
  <AppShell.Navbar>
    {/* Game log panel */}
  </AppShell.Navbar>

  <AppShell.Main>
    {/* Game board - uses dynamic viewport height */}
    <Box h="100dvh"> {/* dvh instead of vh for mobile Safari */}
      {/* Board content */}
    </Box>
  </AppShell.Main>
</AppShell>
```

**Mobile-specific:** Below `sm` breakpoint (768px), navbar displays at 100% width and is controlled by toggle. Above breakpoint, it's a fixed-width sidebar. The `dvh` unit adjusts for mobile browser UI automatically.

### Touch Target Sizing

**Pattern: 44px Minimum Targets**
```typescript
// Source: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
// https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/

// Mantine Button already meets this
<Button size="md"> {/* Default: 36px height */}
  {/* Add padding for touch */}
  <Box p="xs"> {/* Total: 44px+ */}
    Action
  </Box>
</Button>

// For custom interactive elements
.touchTarget {
  min-width: 44px;
  min-height: 44px;
  /* W3C WCAG 2.1 AAA recommendation */
}
```

**Critical for mobile:** Fingers are larger than mouse pointers and obscure the target. 44x44px ensures comfortable tapping without mis-clicks.

### localStorage Persistence Pattern

**Pattern: Initialize from Storage, Sync on Change**
```typescript
// Source: https://medium.com/@roman_j/mastering-state-persistence-with-local-storage-in-react-a-complete-guide-1cf3f56ab15c
// https://peerdh.com/blogs/programming-insights/implementing-local-storage-for-persistent-game-state-in-javascript

// Initialize state from localStorage
const [roomCode, setRoomCode] = useState(() => {
  const saved = localStorage.getItem('catan:lastRoomCode');
  return saved ? JSON.parse(saved) : '';
});

// Sync to localStorage on changes
useEffect(() => {
  if (roomCode) {
    localStorage.setItem('catan:lastRoomCode', JSON.stringify(roomCode));
  }
}, [roomCode]);

// NEVER store in localStorage:
// - Passwords, tokens
// - Credit card info
// - PII (personal data)
//
// OK to store:
// - Room codes
// - Nicknames
// - UI preferences
```

**Security note:** localStorage is vulnerable to XSS attacks. Only store non-sensitive data. Use HttpOnly cookies for authentication tokens.

### Anti-Patterns to Avoid

- **Using vh on mobile:** The classic `100vh` bleeds past the viewport when Safari's address bar is visible. Use `100dvh` instead (dynamic viewport height adjusts automatically).

- **Reconnecting without cleanup:** Creating new WebSocket connections without closing old ones in useEffect cleanup causes memory leaks and duplicate message handlers.

- **No heartbeat detection:** Relying only on connection close events misses silent failures (TCP timeout is 15+ minutes). Implement ping/pong heartbeats at 30-second intervals.

- **Synchronous reconnection:** All clients retrying simultaneously creates load spikes. Add random jitter (±30%) to exponential backoff timing.

- **Hover-only interactions on mobile:** Touch devices don't have hover states. Make interactive elements visually distinct in their default state.

- **Storing sensitive data in localStorage:** localStorage is vulnerable to XSS. Never store passwords, tokens, or PII. Use for room codes and preferences only.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WebSocket reconnection | Custom retry loop | Exponential backoff pattern (already implemented) | Need jitter to prevent thundering herd, max delay cap, attempt counting. Edge cases: browser sleep, network switches |
| Connection health detection | Checking connection state | Server-side ping/pong heartbeat | TCP connections can be "half-open" (silently dead). Detecting this takes 15+ minutes without heartbeat |
| Mobile viewport sizing | 100vh calculations | CSS dvh/svh/lvh units | Mobile browsers dynamically show/hide UI (address bar, tabs). dvh automatically adjusts, custom JS doesn't reliably track |
| Toast notifications | Custom overlay system | Mantine Notifications | Handles stacking, positioning, auto-dismiss, accessibility (ARIA), animations. Building equivalent is 200+ lines |
| Responsive breakpoints | Media query hooks | Mantine's built-in responsive props | Handles SSR hydration, uses CSS not JS (no flicker), automatically memoized |
| Touch target sizing | Custom padding calculations | CSS min-width/min-height: 44px | WCAG guidelines require precise sizing. CSS enforces it automatically, manual padding breaks with content changes |

**Key insight:** Network failures are not exceptional—they are expected. All resilience patterns (heartbeat, exponential backoff, state restoration) handle cases that look rare but happen frequently in production (mobile network switches, browser sleep, proxy timeouts, etc.).

## Common Pitfalls

### Pitfall 1: Memory Leaks from Unclosed WebSockets
**What goes wrong:** Component unmounts but WebSocket connection remains open, continuing to send/receive messages and heartbeats. Over time, memory usage grows and performance degrades.

**Why it happens:** Forgetting to return cleanup function in useEffect, or closing connection in wrong lifecycle (e.g., componentWillUnmount instead of useEffect return).

**How to avoid:** Always return cleanup function that calls `socket.close()` in the same useEffect that creates the connection. Verify with React DevTools that connections close on unmount.

**Warning signs:**
- Multiple WebSocket connections in browser Network tab
- Memory usage climbing over time
- Duplicate messages appearing
- "Can't perform state update on unmounted component" warnings

### Pitfall 2: Silent Connection Failures Without Heartbeat
**What goes wrong:** Connection appears open but is actually dead. No messages flow, but no error is raised. Users sit indefinitely waiting for moves that never arrive.

**Why it happens:** TCP connections can be "half-open"—one side thinks it's connected, the other thinks it's closed. This happens after network switches, proxy timeouts, or NAT table expirations. Without heartbeat, detection takes 15+ minutes.

**How to avoid:** Implement server-side ping/pong heartbeat at 30-second intervals. Terminate connections that don't respond to ping within grace period (35 seconds).

**Warning signs:**
- Users report "game froze" but no error message
- WebSocket shows "connected" but messages don't arrive
- Works on localhost but fails in production (different network conditions)

### Pitfall 3: Race Conditions in Reconnection Flow
**What goes wrong:** Client reconnects before server processes disconnect. Server creates new player instead of restoring session. Player appears twice in game with different IDs.

**Why it happens:** WebSocket close event is asynchronous. Server's `onclose` handler may fire after client's reconnection attempt. If matching by WebSocket object instead of session key, server doesn't recognize reconnection.

**How to avoid:** Use session-based matching (roomId + nickname) instead of WebSocket identity. Keep sessions alive for grace period (30-60 seconds) after disconnect. Reject duplicate connections with same session key.

**Warning signs:**
- Same player appears twice in lobby
- "Player joined" notification for reconnecting player
- Player loses their color/ready state on reconnect

### Pitfall 4: Mobile Safari Address Bar Breaking Layout
**What goes wrong:** Interface sized with `100vh` bleeds past visible viewport when Safari's address bar is showing. Bottom buttons are cut off, users can't access actions.

**Why it happens:** On mobile, `100vh` is calculated as if browser UI is hidden (maximum viewport). When address bar appears, actual visible height shrinks, but `100vh` doesn't update.

**How to avoid:** Use CSS dynamic viewport units: `100dvh` (adjusts automatically), `100svh` (small viewport, assumes UI visible), `100lvh` (large viewport, assumes UI hidden). For this game, use `dvh` for full-height containers.

**Warning signs:**
- Layout works in desktop browser but breaks on mobile
- Bottom UI cut off on initial page load
- Users report "can't see buttons" on phones
- Scrolling required to access actions (when it shouldn't be)

### Pitfall 5: Storing Sensitive Data in localStorage
**What goes wrong:** A single XSS attack steals all data in localStorage. User credentials, game state, personal info all exposed.

**Why it happens:** localStorage is accessible to any JavaScript on the same origin. If attacker injects script (via XSS), they can read/write localStorage freely. Data persists indefinitely.

**How to avoid:**
- NEVER store: passwords, tokens, credit card info, PII
- OK to store: room codes, nicknames, UI preferences (theme, language)
- For auth tokens: use HttpOnly cookies instead (not accessible to JavaScript)
- Validate/sanitize all user input before storing

**Warning signs:**
- Storing user authentication in localStorage
- Base64-encoding sensitive data (not real encryption)
- No input validation before localStorage.setItem
- localStorage keys named "password", "token", "secret"

### Pitfall 6: Touch Targets Too Small for Mobile
**What goes wrong:** Users on mobile tap wrong button repeatedly, mis-click hex tiles, can't select cards reliably. Frustrating experience, high error rate.

**Why it happens:** Designing with mouse in mind (pixel-perfect clicking) instead of touch (finger-sized targets). Fingers are larger than mouse pointers and obscure the target location.

**How to avoid:** Enforce minimum 44x44px touch targets (W3C WCAG 2.1 AAA guideline). For critical actions, use 48x48px (Material Design recommendation). Test on actual devices with different finger sizes.

**Warning signs:**
- Users report "hard to tap buttons on phone"
- High rate of accidental clicks
- Interactive elements smaller than 44px
- Buttons directly adjacent without spacing

### Pitfall 7: Thundering Herd on Reconnection
**What goes wrong:** Server goes down briefly. When it returns, all 1000+ disconnected clients retry simultaneously, overloading server and causing another failure.

**Why it happens:** Exponential backoff without jitter creates synchronized retry attempts. All clients use same backoff formula (1s, 2s, 4s...), so they retry at same time.

**How to avoid:** Add random jitter to retry delay: `delay = baseDelay * 2^attempt + random(0, 0.3 * delay)`. This spreads reconnection attempts over a window instead of single moment.

**Warning signs:**
- Server recovers but immediately crashes again
- Load spikes at regular intervals (2s, 4s, 8s...)
- Retry logic works for single client but fails at scale
- Monitoring shows synchronized traffic patterns

## Code Examples

Verified patterns from official sources:

### Server-Side Heartbeat Implementation
```typescript
// Source: https://www.npmjs.com/package/ws (official FAQ)
// Source: https://oneuptime.com/blog/post/2026-01-27-websocket-heartbeat/view

import { WebSocket, WebSocketServer } from 'ws';

interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
  playerId?: string;
}

const HEARTBEAT_INTERVAL = 30000; // 30 seconds

function heartbeat(this: ExtendedWebSocket) {
  this.isAlive = true;
}

export function setupHeartbeat(wss: WebSocketServer) {
  // Mark connection alive on pong response
  wss.on('connection', (ws: ExtendedWebSocket) => {
    ws.isAlive = true;
    ws.on('pong', heartbeat);

    // Send initial ping
    ws.ping();
  });

  // Periodic health check
  const interval = setInterval(() => {
    wss.clients.forEach((ws: ExtendedWebSocket) => {
      if (ws.isAlive === false) {
        console.log('Terminating dead connection:', ws.playerId);
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping(); // Expect pong before next cycle
    });
  }, HEARTBEAT_INTERVAL);

  // Clean up on server shutdown
  wss.on('close', () => {
    clearInterval(interval);
  });
}
```

### Client-Side Reconnection with User Feedback
```typescript
// Source: https://oneuptime.com/blog/post/2026-01-15-websockets-react-real-time-applications/view
// Source: https://medium.com/@shalabhasunny/websocket-integration-in-react-a-custom-hook-approach-with-react-use-websocket-bf310dad0512

import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';

function useWebSocketWithReconnect(url: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    let mounted = true;
    let reconnectAttempt = 0;
    let reconnectTimer: NodeJS.Timeout;

    function connect() {
      if (!mounted) return;

      const socket = new WebSocket(url);

      socket.onopen = () => {
        if (!mounted) return;
        console.log('WebSocket connected');
        setStatus('connected');
        setWs(socket);
        reconnectAttempt = 0; // Reset counter on success

        notifications.show({
          message: 'Connected to game',
          color: 'green',
        });
      };

      socket.onclose = () => {
        if (!mounted) return;
        console.log('WebSocket closed');
        setStatus('disconnected');
        setWs(null);

        // Schedule reconnection with exponential backoff
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttempt), // 1s, 2s, 4s, 8s...
          30000 // Max 30 seconds
        );
        const jitter = Math.random() * 0.3 * delay;

        reconnectTimer = setTimeout(() => {
          reconnectAttempt++;
          setStatus('connecting');
          connect();
        }, delay + jitter);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        notifications.show({
          message: 'Connection error',
          color: 'red',
        });
      };
    }

    connect();

    // CRITICAL: Cleanup function
    return () => {
      mounted = false;
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [url]); // Only reconnect if URL changes

  return { ws, status };
}
```

### Session-Based State Restoration
```typescript
// Source: https://docs.accelbyte.io/gaming-services/knowledge-base/graceful-disruption-handling/lobby-websocket-recovery/
// Source: https://oneuptime.com/blog/post/2026-01-24-websocket-reconnection-logic/view

interface PlayerSession {
  roomId: string;
  playerId: string;
  nickname: string;
  lastSeen: number;
  ws: WebSocket | null;
}

const sessions = new Map<string, PlayerSession>();
const SESSION_TIMEOUT = 60000; // 1 minute grace period

function handleJoinOrReconnect(
  ws: WebSocket,
  roomId: string,
  nickname: string
) {
  const sessionKey = `${roomId}:${nickname}`;
  const existingSession = sessions.get(sessionKey);

  if (existingSession) {
    const timeSinceDisconnect = Date.now() - existingSession.lastSeen;

    if (timeSinceDisconnect < SESSION_TIMEOUT) {
      // Reconnection - restore session
      console.log(`Player ${nickname} reconnecting to ${roomId}`);

      existingSession.ws = ws;
      existingSession.lastSeen = Date.now();

      const room = roomManager.getRoom(roomId);
      ws.send(JSON.stringify({
        type: 'reconnect_success',
        playerId: existingSession.playerId,
        room: serializeRoom(room),
      }));

      // Notify other players
      roomManager.broadcastToRoom(roomId, {
        type: 'player_reconnected',
        nickname,
      }, ws); // Exclude reconnecting player

      return;
    }
  }

  // New connection - create session
  const playerId = generatePlayerId();
  const session: PlayerSession = {
    roomId,
    playerId,
    nickname,
    lastSeen: Date.now(),
    ws,
  };

  sessions.set(sessionKey, session);

  // Normal join flow
  roomManager.addPlayer(roomId, {
    id: playerId,
    nickname,
    color: null,
    isReady: false,
  });
}

function handleDisconnect(ws: WebSocket, sessionKey: string) {
  const session = sessions.get(sessionKey);
  if (!session) return;

  // Mark as disconnected but keep session
  session.ws = null;
  session.lastSeen = Date.now();

  console.log(`Player ${session.nickname} disconnected, session kept for ${SESSION_TIMEOUT}ms`);

  // Notify room
  roomManager.broadcastToRoom(session.roomId, {
    type: 'player_disconnected',
    playerId: session.playerId,
    nickname: session.nickname,
  });

  // Clean up expired sessions
  setTimeout(() => {
    const current = sessions.get(sessionKey);
    if (current && current.lastSeen === session.lastSeen) {
      // Session wasn't updated (no reconnect), remove it
      sessions.delete(sessionKey);
      roomManager.removePlayer(session.roomId, session.playerId);
    }
  }, SESSION_TIMEOUT);
}
```

### Mantine Responsive Layout with Touch Targets
```typescript
// Source: https://mantine.dev/core/app-shell/
// Source: https://mantine.dev/styles/responsive/

import { AppShell, Box, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export function GameLayout() {
  const [mobileNavOpened, { toggle }] = useDisclosure();

  return (
    <AppShell
      navbar={{
        width: { base: '100%', sm: 300 }, // Full width on mobile, 300px on desktop
        breakpoint: 'sm', // 768px
        collapsed: { mobile: !mobileNavOpened, desktop: false },
      }}
      padding="md"
    >
      <AppShell.Navbar p="md">
        {/* Game Log Panel */}
        <Box>
          <h2>Game Log</h2>
          {/* Log entries - oldest first, scroll down for latest */}
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>
        {/* Main game board - use dynamic viewport height for mobile */}
        <Box
          h="100dvh" // dvh adjusts for mobile Safari address bar
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Mobile nav toggle - hidden on desktop */}
          <Button
            onClick={toggle}
            hiddenFrom="sm" // Hide when viewport >= sm (768px)
            size="md" // 36px height + padding = 44px touch target
          >
            Toggle Log
          </Button>

          {/* Game board */}
          <Box flex={1}>
            {/* Hex grid here */}
          </Box>

          {/* Action buttons - ensure 44px touch targets */}
          <Box
            style={{
              display: 'flex',
              gap: 8, // Space between targets
            }}
          >
            <Button
              size="md"
              style={{ minWidth: 44, minHeight: 44 }} // Enforce touch target
            >
              Roll Dice
            </Button>
            <Button
              size="md"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              End Turn
            </Button>
          </Box>
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
```

### localStorage Persistence Pattern
```typescript
// Source: https://medium.com/@roman_j/mastering-state-persistence-with-local-storage-in-react-a-complete-guide-1cf3f56ab15c
// Source: https://blog.pixelfreestudio.com/best-practices-for-persisting-state-in-frontend-applications/

import { useState, useEffect } from 'react';

// Safe localStorage wrapper with error handling
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Initialize from localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Sync to localStorage on change
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
      // Handle quota exceeded, etc.
    }
  };

  return [storedValue, setValue];
}

// Usage
function GameConnection() {
  const [lastRoomCode, setLastRoomCode] = useLocalStorage('catan:lastRoomCode', '');
  const [nickname, setNickname] = useLocalStorage('catan:nickname', '');

  // Auto-fill on page load
  useEffect(() => {
    if (lastRoomCode) {
      console.log('Auto-filling room code:', lastRoomCode);
    }
  }, []);

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      setLastRoomCode(roomCode); // Persists for next visit
      setNickname(nicknameInput); // Persists for next visit
      joinRoom(roomCode, nicknameInput);
    }}>
      <input
        defaultValue={lastRoomCode}
        placeholder="Room Code"
      />
      <input
        defaultValue={nickname}
        placeholder="Nickname"
      />
      <button type="submit">Join</button>
    </form>
  );
}

// SECURITY NOTE: NEVER store sensitive data
// ❌ localStorage.setItem('token', authToken);
// ❌ localStorage.setItem('password', password);
// ✅ localStorage.setItem('catan:nickname', nickname);
// ✅ localStorage.setItem('catan:theme', 'dark');
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 100vh for mobile | 100dvh (dynamic viewport height) | 2022-2023 | Solves mobile Safari address bar problem; layout automatically adjusts as browser UI shows/hides |
| Custom media query hooks | CSS responsive props + useMediaQuery | Mantine v7+ (2023) | Eliminates hydration mismatches in SSR; uses CSS instead of JS for better performance |
| setTimeout reconnect | Exponential backoff with jitter | Industry standard by 2020 | Prevents thundering herd; scales to thousands of concurrent reconnections |
| Token in localStorage | HttpOnly cookies for auth | OWASP guidance (updated 2023) | Prevents XSS token theft; localStorage appropriate only for non-sensitive data |
| Hover states for interactivity | Touch-first design with visual distinction | Mobile-first era (2018+) | Touch devices have no hover; default state must be clear |
| Manual ping/pong | ws library's built-in pong | ws v8.x (current) | Library automatically responds to pings; simpler than manual implementation |

**Deprecated/outdated:**
- **socket.io for new projects**: Was standard for automatic reconnection, but modern clients (like this project) implement reconnection manually with ws library, avoiding the extra abstraction and bundle size. socket.io still valid for existing projects but not needed for new ones.
- **vh on mobile**: Use dvh instead. The old vh causes layouts to bleed past viewport when mobile browser UI is visible.
- **WCAG 2.5.5 (AAA) target size**: Now superseded by WCAG 2.5.8 (AA) which requires minimum 24px but recommends 44px as best practice. Use 44px for optimal usability.

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal session timeout duration**
   - What we know: Industry uses 30-60 seconds for real-time games; AccelByte SDK recommends 60 seconds
   - What's unclear: Whether Catan's turn-based nature allows longer timeout (2-3 minutes) without hurting UX
   - Recommendation: Start with 60 seconds, monitor reconnection success rate, adjust if users complain about "session expired" errors

2. **Browser sleep handling**
   - What we know: When browser tab goes to sleep (mobile background, laptop sleep), WebSocket closes but reconnection timer may not fire immediately
   - What's unclear: Whether we need Page Visibility API to handle wake-up explicitly
   - Recommendation: Test on mobile devices; if reconnection after sleep is slow, add visibilitychange listener to immediately reconnect on wake

3. **Game log scrolling behavior**
   - What we know: Chat-style (oldest first, scroll down) is standard for event logs
   - What's unclear: Whether to auto-scroll to latest on new events, or let user scroll freely
   - Recommendation: Auto-scroll only if user is already at bottom (within 50px); otherwise preserve scroll position. This is standard chat behavior.

4. **Disconnect overlay vs inline warning**
   - What we know: User wants full-screen blocking overlay for disconnects
   - What's unclear: Whether brief disconnects (< 2 seconds) should show overlay or just inline warning
   - Recommendation: Delay overlay by 2 seconds; show small inline "Reconnecting..." toast immediately. This prevents jarring overlay flash for brief network hiccups.

5. **Mobile landscape orientation**
   - What we know: Board games typically need both portrait and landscape support
   - What's unclear: Optimal layout for landscape (sidebar left/right vs bottom panel)
   - Recommendation: Test both orientations; likely sidebar on left/right in landscape (more horizontal space), bottom sheet in portrait (more vertical space)

## Sources

### Primary (HIGH confidence)
- ws library npm documentation: https://www.npmjs.com/package/ws - Connection lifecycle, ping/pong API
- MDN WebSocket server guide: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers - Ping/pong frame spec, close codes
- Mantine AppShell documentation: https://mantine.dev/core/app-shell/ - Responsive sidebar patterns
- Mantine responsive styles: https://mantine.dev/styles/responsive/ - Breakpoints, visibility utilities, responsive props
- W3C WCAG 2.1 Target Size: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html - Touch target sizing (44px)
- AWS Prescriptive Guidance: https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/retry-backoff.html - Exponential backoff with jitter
- OWASP HTML5 Security: https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html - localStorage security

### Secondary (MEDIUM confidence)
- OneUptime WebSocket guides (2026): https://oneuptime.com/blog/post/2026-01-27-websocket-heartbeat/view - Heartbeat implementation patterns
- OneUptime reconnection logic (2026): https://oneuptime.com/blog/post/2026-01-24-websocket-reconnection-logic/view - State restoration best practices
- React WebSocket integration (2026): https://oneuptime.com/blog/post/2026-01-15-websockets-react-real-time-applications/view - useEffect patterns
- AccelByte lobby recovery: https://docs.accelbyte.io/gaming-services/knowledge-base/graceful-disruption-handling/lobby-websocket-recovery/ - Session-based reconnection
- Web.dev viewport units: https://web.dev/blog/viewport-units - dvh/svh/lvh explanation and browser support
- Medium localStorage guide: https://medium.com/@roman_j/mastering-state-persistence-with-local-storage-in-react-a-complete-guide-1cf3f56ab15c - React localStorage patterns
- Smashing Magazine touch targets: https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/ - Mobile touch sizing best practices

### Tertiary (LOW confidence)
- Unity lobby sample: https://docs.unity.com/ugs/manual/lobby/manual/game-lobby-sample - Ready-up countdown patterns (Unity-specific but transferable)
- Game UI Database: https://www.gameuidatabase.com/ - Visual reference for lobby and log UIs
- Nakama lobby guide: https://heroiclabs.com/docs/nakama/guides/concepts/lobby/ - Ready state management patterns
- Board Game Arena mobile: https://en.boardgamearena.com/doc/Your_game_mobile_version - Board game responsive design considerations
- React responsive libraries: https://www.npmjs.com/package/react-responsive - Alternative to Mantine (not needed but good reference)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - ws library is de facto standard, Mantine already in use, localStorage is native API
- Architecture: HIGH - All patterns verified with official documentation (MDN, Mantine, ws library) and multiple 2026 sources
- Pitfalls: HIGH - Each pitfall verified with authoritative sources (OWASP, W3C, production experience articles)
- Don't hand-roll: MEDIUM - Based on industry consensus (multiple sources agree) but specific to this tech stack
- State of the art: MEDIUM - Timing of changes verified with release notes, but "outdated" assessment is subjective
- Open questions: LOW - These are genuinely unresolved; answers will come from user testing

**Research date:** 2026-02-05
**Valid until:** 2026-03-05 (30 days - stable domain with mature patterns)

**Notes:**
- WebSocket reconnection patterns are well-established and stable
- Mobile responsive design evolving slowly (dvh support now universal)
- Mantine API stable in v8.x (no major breaking changes expected)
- Security best practices (localStorage, XSS) are stable guidance
- Ready-up system is standard game design pattern
