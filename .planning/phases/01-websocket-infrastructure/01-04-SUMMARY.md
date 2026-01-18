---
phase: 01-websocket-infrastructure
plan: 04
subsystem: websocket
tags: [websocket, react, reconnection, exponential-backoff, react-context]

# Dependency graph
requires:
  - phase: 01-01
    provides: WebSocket message schemas (Zod)
  - phase: 01-02
    provides: Server-side connection and room management
  - phase: 01-03
    provides: Message router integration with WebSocket server
provides:
  - Client-side ReconnectingWebSocket class with exponential backoff
  - React WebSocket context for global connection state
  - Automatic WebSocket connection on app load
affects: [01-05, lobby-features]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Client-side reconnection with exponential backoff (1s base, 30s max, 0-25% jitter)
    - React context for WebSocket state management
    - Client ID persistence for session recovery

key-files:
  created:
    - apps/web/src/lib/websocket.ts
    - apps/web/src/lib/websocket-context.tsx
  modified:
    - apps/web/src/main.tsx

key-decisions:
  - "Use exponential backoff with jitter (0-25%) to prevent thundering herd during server outages"
  - "WebSocketProvider inside QueryClientProvider enables TanStack Query to access WebSocket state"
  - "Auto-connect on app mount ensures WebSocket ready before any route navigation"
  - "Multiple message handlers via Set pattern enables component-level message subscriptions"

patterns-established:
  - "ReconnectingWebSocket class: Encapsulates reconnection logic, clientId persistence, status tracking"
  - "WebSocket React context: Global connection state accessible via useWebSocket hook"
  - "Status transitions: connecting → connected → disconnected → reconnecting"

# Metrics
duration: 2min
completed: 2026-01-18
---

# Phase 01 Plan 04: Client WebSocket Infrastructure Summary

**ReconnectingWebSocket client with exponential backoff (1s-30s), React context for global connection state, and automatic connection on app load**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-18T14:05:17Z
- **Completed:** 2026-01-18T14:06:57Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- ReconnectingWebSocket class with exponential backoff reconnection (1s base, 30s max, 0-25% jitter)
- Client ID persistence for seamless session recovery within server's 30-second grace period
- React WebSocket context providing global access to connection status, clientId, and sendMessage
- WebSocket automatically connects on app load, ready before user navigates to any route

## Task Commits

Each task was committed atomically:

1. **Task 1: Build ReconnectingWebSocket client with exponential backoff** - `1314985` (feat)
2. **Task 2: Create WebSocket React context and integrate into app** - `ae6ef79` (feat)

## Files Created/Modified
- `apps/web/src/lib/websocket.ts` - ReconnectingWebSocket class with exponential backoff, clientId persistence, message handler registration
- `apps/web/src/lib/websocket-context.tsx` - WebSocketContext and WebSocketProvider for global connection state
- `apps/web/src/main.tsx` - Integrated WebSocketProvider into app (inside QueryClientProvider, wrapping MantineProvider and RouterProvider)

## Decisions Made

**1. Exponential backoff with 0-25% jitter**
- Prevents thundering herd problem when server recovers from outage
- Formula: `Math.min(baseDelay * Math.pow(2, attempts), maxDelay) + random(0-25%)`
- Aligns with RESEARCH.md best practices

**2. 30-second max delay matches server grace period**
- Server preserves disconnected connections for 30 seconds (from 01-02)
- Client reconnection attempts happen within this window
- Enables seamless session recovery for brief network interruptions

**3. WebSocketProvider placement**
- Inside QueryClientProvider: TanStack Query can access WebSocket state if needed
- Outside RouterProvider: WebSocket available to all routes globally
- Ensures connection established before route navigation

**4. Multiple message handlers via Set**
- Allows components to register their own message handlers
- Handlers called in addition to context's onMessage callback
- Enables component-level message subscriptions without modifying context

**5. Unlimited reconnection attempts**
- CONTEXT.md specifies unlimited retry (acceptable for v0.1 localhost)
- RESEARCH.md Pitfall 8 notes battery drain concern for production
- Future: Consider max duration circuit breaker (e.g., 5 minutes then show "server unavailable")

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

WebSocket client infrastructure complete. Ready for:
- Plan 01-05: End-to-end WebSocket testing
- Future lobby features: Components can use `useWebSocket()` hook to access connection state and send messages
- Connection status UI: Components can display "Reconnecting..." indicator based on `status` from context

**Blockers:** None

**Notes:**
- Client ID is tracked in React state (`clientId`) and accessible via `useWebSocket().clientId`
- Connection status exposed for UI indicators: `connecting`, `connected`, `reconnecting`, `disconnected`
- Message sending: `sendMessage({ type: 'JOIN_ROOM', payload: { roomId: 'lobby' } })` sends only when connection open

---
*Phase: 01-websocket-infrastructure*
*Completed: 2026-01-18*
