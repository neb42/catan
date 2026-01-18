# Pitfalls Research

**Domain:** Real-time multiplayer lobby with WebSocket state synchronization
**Researched:** 2026-01-18
**Confidence:** MEDIUM

Research focused on real-time lobby systems for turn-based multiplayer games (Catan) with WebSocket state sync, color selection conflicts, ready states, and countdown timers.

## Critical Pitfalls

### Pitfall 1: Race Conditions on Concurrent State Updates (Color Selection, Ready States)

**What goes wrong:**
Multiple clients send state updates simultaneously (two players clicking the same color at nearly the same time), and without proper coordination, both clients briefly see themselves with that color until the server resolves the conflict. This creates a jarring experience where one player's UI "snaps back" to their previous state, or worse, both players end up with the same color in the actual game state.

**Why it happens:**
- WebSocket messages arrive in order per connection, but messages from different connections are processed concurrently
- Developers implement optimistic UI updates without proper rollback handling
- No server-side locking or atomic operations to coordinate concurrent updates
- Unique constraints exist in-memory only, not enforced atomically

**How to avoid:**
- Implement server-side atomic operations for all state changes (nickname assignment, color selection, ready toggle)
- Use optimistic UI updates with mandatory rollback logic when server rejects the update
- Assign sequence numbers or version numbers to lobby state; reject updates with stale versions
- For color selection: implement "server is source of truth" pattern where client requests are validated and may be rejected
- Consider using a database with unique constraints rather than in-memory state for critical uniqueness (nicknames)

**Warning signs:**
- During testing, rapidly clicking color selections results in visual "flashing" or state reversion
- Multiple users report having the same color briefly
- Console shows WebSocket message order inconsistencies
- State updates sometimes fail silently without user feedback

**Phase to address:**
Phase 1 (Lobby foundation) - This is fundamental to the entire lobby system and must be solved correctly from the start. Retrofitting race condition handling is significantly harder than building it in from the beginning.

---

### Pitfall 2: Message Ordering Assumptions Break with Async Handlers

**What goes wrong:**
Despite TCP's guarantee of message ordering, application-level async operations (await calls, database queries, external API calls) can cause messages to be processed out of order. For example: Player A sends "join lobby" then "select red color", but if the join handler has an async database lookup that takes 100ms, the color selection message might be processed first, causing the player to select a color before they're registered in the lobby.

**Why it happens:**
- Developers assume WebSocket message order === processing order
- Using `await` in message handlers pauses execution, allowing subsequent messages to start processing
- Multi-threaded or event-loop-based servers process messages concurrently
- Lack of request/response correlation IDs to track message dependencies

**How to avoid:**
- Use per-client message queues that process one message at a time (sequential processing per client)
- Assign sequence numbers to messages and validate state transitions are legal
- For Node.js specifically: Be aware that `async` message handlers can interleave; consider using a queue library like `p-queue` for per-client serialization
- Implement state machine validation: reject invalid transitions (can't select color if not in lobby)
- Avoid `await` for operations that don't require it (e.g., use synchronous operations where possible)

**Warning signs:**
- "Player not found" errors when player is definitely connected
- State transitions fail with "invalid state" despite appearing valid from client's perspective
- Intermittent errors that don't reproduce reliably
- Different behavior when message handlers have different async latencies

**Phase to address:**
Phase 1 (Lobby foundation) - Message ordering must be handled correctly before building any complex features. This is architectural and hard to fix later.

---

### Pitfall 3: Stale Connections and Memory Leaks from Missing Cleanup

**What goes wrong:**
Players disconnect (close browser, network drop) but their connection objects remain in the server's connection tracking, consuming memory indefinitely. Over time, the server accumulates thousands of "ghost" connections, eventually running out of memory or showing incorrect player counts ("Lobby shows 47 players but only 3 are actually connected").

**Why it happens:**
- Missing or improper close/error handlers on WebSocket connections
- Connection arrays grow but never shrink
- References to player objects prevent garbage collection
- Heartbeat/ping-pong mechanism not implemented or not enforced
- Network failures don't always trigger WebSocket 'close' events immediately

**How to avoid:**
- Implement mandatory close and error event handlers that remove connections from tracking
- Use WeakMap or proper cleanup in close handlers to allow garbage collection
- Implement ping/pong heartbeat mechanism (send ping every 20-30 seconds, close if no pong within 30 seconds)
- Log connection count metrics and monitor for growth over time
- Use `ws.terminate()` instead of `ws.close()` when forcibly removing stale connections
- Check `readyState` before sending messages; remove connection if state is CLOSING or CLOSED

**Warning signs:**
- Server memory usage grows continuously over time, never decreases
- Player count in lobbies doesn't match actual connected users
- Logs show WebSocket 'send' errors for closed connections
- Server becomes unresponsive after running for hours/days
- Connection array length keeps growing in debugging

**Phase to address:**
Phase 1 (Lobby foundation) - Memory leaks compound over time. Must be prevented from day one, especially during development when servers run for extended periods.

---

### Pitfall 4: Clock Drift Causes Countdown Desyncs

**What goes wrong:**
The ready countdown shows different times on different clients. One player sees "2 seconds" while another sees "5 seconds", or the game starts for some players before others see "0". This breaks the shared experience and causes confusion, especially if countdown cancellation happens at the last second.

**Why it happens:**
- Using client-side `setInterval` or `Date.now()` to track countdown
- Client clocks drift by 50-200ms over short periods
- Network latency varies per client (one client might receive "countdown started" 300ms after another)
- Calculating remaining time from elapsed duration instead of end time
- Not accounting for the time it takes for messages to arrive

**How to avoid:**
- Server broadcasts countdown end time (absolute timestamp), not countdown duration
- Clients calculate remaining time as `serverEndTime - currentClientTime` on each tick
- Continuously recalculate from server time to self-correct for drift
- Set server end time a few seconds in the future (buffer) to ensure all clients receive message before countdown starts
- Use server timestamps in all messages; clients adjust for their own clock offset
- For cancellation: broadcast immediately with authoritative "countdown cancelled" message

**Warning signs:**
- During testing, different browser windows show different countdown values
- Countdown reaches zero at different times on different clients
- Players report game starting "early" or countdown never reaching zero
- Countdown appears to speed up or slow down instead of smooth 1-second decrements

**Phase to address:**
Phase 1 (Lobby foundation) - The ready/countdown system is a core feature of v0.1. Clock synchronization must be built correctly from the start.

---

### Pitfall 5: Broadcast Patterns Create State Desync

**What goes wrong:**
Server broadcasts state changes to all clients "except sender" to avoid echoing, but the sender's optimistic update and the server's actual state diverge. For example: sender changes nickname from "Bob" to "Alice", sees "Alice" immediately (optimistic), but server rejects it due to duplicate and sends "nickname rejected" only to sender, while other clients never knew about the attempted change. Now sender sees "Alice" but server has "Bob".

**Why it happens:**
- Broadcasting to "all except sender" is a common pattern but breaks optimistic updates
- Server response might be sent only to sender, not broadcast
- No version numbers or transaction IDs to correlate optimistic updates with server responses
- Client doesn't know whether to trust its optimistic state or wait for server confirmation
- Rollback logic missing or incomplete

**How to avoid:**
- Choose one of two patterns consistently:
  - **Pattern A:** Server broadcasts to ALL clients (including sender). Sender discards optimistic state and uses server state.
  - **Pattern B:** Server sends acknowledgment to sender, then broadcasts to others. Sender waits for ack before committing optimistic update.
- Use message correlation IDs: client sends `requestId`, server echoes it in response
- Implement proper rollback: if server rejects, revert UI to previous state with user feedback
- For critical updates (nickname, ready state), prefer "server confirms, then update UI" over optimistic updates
- Log both optimistic and confirmed states in dev mode to catch desyncs early

**Warning signs:**
- Sender sees different state than other lobby members
- "Refresh fixes it" becomes a common occurrence
- Duplicate nicknames or colors appear despite validation
- Ready states are inconsistent across clients
- Client state "drifts" away from server state over time

**Phase to address:**
Phase 1 (Lobby foundation) - Broadcast patterns are fundamental to all real-time features. Getting this wrong means every feature will have sync bugs.

---

### Pitfall 6: Reconnection Doesn't Restore Lobby State

**What goes wrong:**
Player's WiFi drops for 2 seconds, browser reconnects WebSocket, but player is now in a blank lobby or sees themselves as "not ready" when they were ready before disconnect. Other players see them as "left the lobby" and the countdown was cancelled. When reconnection happens, it's too late — they're treated as a new player.

**Why it happens:**
- No session/player ID persistence across connections
- Server treats each WebSocket connection as a new player
- Lobby state is tied to connection object, not player identity
- No "reconnection window" grace period
- Client doesn't store enough state to request restoration
- No mechanism to distinguish "new player" from "returning player"

**How to avoid:**
- Assign persistent session IDs (stored in client localStorage/sessionStorage) separate from WebSocket connection ID
- On connection, client sends session ID; server checks if that session exists in any lobby
- Implement "ghost player" state: when connection drops, mark player as "disconnected" for 30-60 seconds before removing
- During ghost period: hold their color, ready state, lobby position
- On reconnection with valid session ID: restore full state and broadcast "Player reconnected"
- For countdown: consider pausing or cancelling if a ready player disconnects
- Track both connection ID and player/session ID separately

**Warning signs:**
- Any network blip kicks players from lobby entirely
- Players report "having to rejoin and reconfigure" after brief disconnects
- Lobby state resets frequently in poor network conditions
- Testing with browser dev tools "offline" mode shows complete state loss
- Mobile users (who frequently switch networks) complain about lobby stability

**Phase to address:**
Phase 1 (Lobby foundation) - Reconnection handling is critical for production. Can be stubbed in early development but must be implemented before any real testing with multiple users.

---

### Pitfall 7: Unique Nickname Validation Has Race Windows

**What goes wrong:**
Two players simultaneously try to claim the nickname "Steve". Both clients check "is Steve available?" at nearly the same time, both see "yes", both send "claim Steve", and both succeed briefly. Server either accepts both (duplicate nicknames) or rejects the second one after the first player already sees success. This is especially problematic if nicknames are checked via a separate "check availability" endpoint before the actual claim.

**Why it happens:**
- Check-then-act race condition: checking availability and claiming are two separate operations
- No atomic "claim if available" operation
- In-memory Set/Map for nicknames without proper locking
- No database unique constraints to enforce server-side
- WebSocket messages from different connections processed concurrently

**How to avoid:**
- Use atomic operations: single "try claim nickname" message that checks and claims atomically
- If using a database: add unique constraint on nickname column; handle duplicate key errors gracefully
- In-memory: use synchronous check-and-set in the message handler (JavaScript is single-threaded; avoid async between check and set)
- Don't expose separate "check availability" endpoint; do it as part of the claim operation
- Return clear success/failure responses with reason codes
- For optimistic UI: show nickname as "pending" until server confirms

**Warning signs:**
- Duplicate nicknames appear in lobby occasionally
- Rapid clicking "join" button by multiple users causes duplicates
- Race condition only appears under load testing or concurrent users
- "Nickname taken" errors appear after client showed "available"

**Phase to address:**
Phase 1 (Lobby foundation) - Unique nicknames are a fundamental requirement. Race conditions here undermine the entire lobby's integrity.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| No heartbeat/ping-pong implementation | Faster development, fewer messages | Stale connections accumulate, memory leaks, incorrect player counts | Never - implement from day one |
| Optimistic updates without rollback | Feels snappy and responsive | State desyncs accumulate, "refresh to fix" becomes common | Never - rollback is mandatory for correctness |
| In-memory lobby state only (no persistence) | Simple architecture, fast | Can't recover from server restart, no reconnection support | Acceptable for MVP/prototype, but plan migration path |
| Broadcasting to "all except sender" without proper handling | Reduces message count | Sender's state diverges from others | Never - causes subtle bugs that are hard to diagnose |
| Client-side countdown timers | Easy to implement | Clock drift causes desyncs | Never - always use server timestamps for shared time |
| No message sequence numbers | Simpler message format | Can't detect out-of-order processing or dropped messages | Acceptable if using reliable patterns (sequential per-client queues) |
| Synchronous message handlers only | No async complexity | Can't do database lookups, external API calls | Acceptable for MVP if all data is in-memory |
| No correlation IDs for request/response | Simpler protocol | Hard to match responses to requests, breaks concurrent operations | Acceptable for simple request-response, required for complex flows |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| AWS API Gateway WebSocket | Assuming message order is guaranteed | API Gateway doesn't guarantee ordering; implement sequence numbers or use other infrastructure |
| Redis Pub/Sub for multi-instance sync | Not handling subscription race conditions on startup | Ensure state is loaded before subscribing to updates; use Redis streams for guaranteed delivery |
| Load balancers with WebSockets | Using round-robin without sticky sessions | Configure sticky sessions or use Redis/DB for shared state across instances |
| WebSocket library (ws) | Not handling `error` and `close` events separately | Both events need handlers; `error` may fire without `close` in some scenarios |
| React useEffect WebSocket | Creating connection on every render | Use dependency array correctly and cleanup function to close connection |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Broadcasting every state change to all clients | Works fine initially | Batch updates; send deltas instead of full state; throttle broadcasts | 10+ lobbies with 50+ total clients |
| Storing full message history in memory | Useful for debugging | Cap message history; use circular buffer or TTL | 100+ messages per lobby |
| No backpressure handling on send | Messages always send | Check buffer size; implement queuing; detect slow clients | 20+ concurrent clients with varying network speeds |
| Linear search through connection list for broadcasts | Simple code | Use Map/Set for O(1) lookups; index by player ID | 50+ concurrent connections |
| Sending full lobby state on every update | Easy to implement | Send incremental updates (deltas); only full state on join | 6+ players per lobby with frequent updates |
| No rate limiting on client messages | Responsive to all input | Implement per-client rate limiting; reject rapid-fire messages | Malicious client or buggy code causes server overload |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| No rate limiting on WebSocket messages | Client can spam server, DoS attack, crash server | Implement per-connection message rate limits (e.g., 10 msg/sec) |
| Trusting client-reported state | Client claims "I'm ready" and server accepts blindly | Server validates all state transitions; client requests, server decides |
| No validation on nickname/color changes | Client sends malicious data (XSS, SQL injection if persisted) | Validate and sanitize all inputs; enforce max length, allowed characters |
| Broadcasting sensitive data to all clients | Player IP addresses, session tokens leaked | Only broadcast public data; use per-client messages for sensitive info |
| No authentication on WebSocket connection | Anyone can join any lobby | Require session token on connection; validate before allowing lobby actions |
| Allowing arbitrary lobby IDs | Client can guess lobby IDs and join private games | Use UUIDs for lobby IDs; implement password/invite system for private lobbies |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading states on actions | Click "ready" → nothing happens → confusion | Show immediate feedback ("Waiting for server..."), then success/error |
| Silent failures on state changes | Nickname rejected but no error shown | Always show user feedback for rejections with clear reason ("Nickname taken") |
| No reconnection indicator | Connection drops → user sees frozen UI → frustration | Show "Disconnected - Reconnecting..." banner; auto-reconnect in background |
| Countdown cancels with no explanation | Countdown stops → users confused why | Broadcast reason ("Countdown cancelled: Player X unreadied") |
| Color stolen without feedback | Your color changes suddenly → confusing | Show notification "Player X took your color" when color is stolen |
| No "player joined/left" messages | Player list changes mysteriously | Broadcast and display "[Player] joined the lobby" events |
| Ready states toggle invisibly | Can't tell who's ready at a glance | Use clear visual indicators (checkmarks, colors, "Ready" badges) |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **WebSocket connection:** Often missing error/close event handlers - verify cleanup runs on both events
- [ ] **Heartbeat mechanism:** Often missing or not enforced - verify stale connections are removed after timeout
- [ ] **Optimistic updates:** Often missing rollback on failure - verify UI reverts with user feedback when server rejects
- [ ] **Broadcast logic:** Often broadcasts to "all except sender" without proper state sync - verify sender state matches others
- [ ] **Countdown timer:** Often uses client-side timers - verify using server timestamp and continuous recalculation
- [ ] **Reconnection handling:** Often treats reconnect as new player - verify session persistence and state restoration
- [ ] **Race condition handling:** Often assumes sequential processing - verify atomic operations or locking for concurrent updates
- [ ] **Message ordering:** Often assumes WebSocket order === processing order - verify async handlers don't interleave
- [ ] **Memory cleanup:** Often missing connection reference cleanup - verify memory doesn't grow over time
- [ ] **Unique constraints:** Often validated client-side only - verify server-side atomic enforcement (DB or in-memory locking)
- [ ] **Error feedback:** Often fails silently - verify all rejections show clear user feedback
- [ ] **State synchronization:** Often out of sync after a few operations - verify periodic full-state sync or version checking

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Race conditions in production | HIGH | Add sequence numbers to all messages; implement version checking; may require protocol change |
| Memory leak from stale connections | MEDIUM | Implement connection cleanup; restart server; add monitoring/alerting |
| Clock drift desyncs | LOW | Switch countdown to server timestamp pattern; redeploy client |
| Broadcast pattern state desync | HIGH | Refactor broadcast logic; add correlation IDs; may require client update |
| No reconnection support | MEDIUM | Add session ID persistence; implement reconnection logic; client update required |
| Message ordering issues | HIGH | Implement per-client message queues; refactor async handlers; significant architectural change |
| Duplicate nicknames | LOW | Add database unique constraint or in-memory atomic checks; data cleanup script |
| Missing heartbeat | MEDIUM | Add ping/pong mechanism; redeploy server; add monitoring |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Race conditions on state updates | Phase 1 | Load test with 10 concurrent users rapidly changing colors/ready states; no duplicates or desyncs |
| Message ordering with async handlers | Phase 1 | Add artificial async delays in handlers; verify state transitions still valid |
| Stale connections and memory leaks | Phase 1 | Run server for 24 hours with connect/disconnect cycles; memory stays stable |
| Clock drift countdown desyncs | Phase 1 | Open lobby in 5+ browsers; verify countdown shows same value within 200ms |
| Broadcast pattern state desync | Phase 1 | Test sender vs. other clients after state changes; verify identical state |
| Reconnection doesn't restore state | Phase 1 | Disconnect client mid-lobby; reconnect; verify state fully restored |
| Unique nickname race condition | Phase 1 | Concurrent load test: 20 users claim same nickname; verify only 1 succeeds |

## Sources

### WebSocket State Synchronization & Scaling
- [WebSocket architecture best practices to design robust realtime system](https://ably.com/topic/websocket-architecture-best-practices)
- [Making a multiplayer web game with websocket that can be scalable to millions of users](https://medium.com/@dragonblade9x/making-a-multiplayer-web-game-with-websocket-that-can-be-scalable-to-millions-of-users-923cc8bd4d3b)
- [WebSockets in realtime gaming: Achieving low latency gameplay](https://pusher.com/blog/websockets-realtime-gaming-low-latency/)

### Race Conditions & Concurrency
- [Handling Race Conditions in Real-Time Apps](https://dev.to/mattlewandowski93/handling-race-conditions-in-real-time-apps-49c8)
- [Handling Race Condition in Distributed System - GeeksforGeeks](https://www.geeksforgeeks.org/computer-networks/handling-race-condition-in-distributed-system/)
- [The Art of Staying in Sync: How Distributed Systems Avoid Race Conditions](https://medium.com/@alexglushenkov/the-art-of-staying-in-sync-how-distributed-systems-avoid-race-conditions-f59b58817e02)

### Reconnection & Connection Management
- [WebSockets for Game Development: Unlock Real-Time Gameplay in 2025](https://playgama.com/blog/general/understanding-websockets-a-beginners-guide-for-game-development/)
- [Understanding Ping Pong Frame WebSocket: Protocol, Implementation & Real-World Use (2025)](https://www.videosdk.live/developer-hub/websocket/ping-pong-frame-websocket)
- [Keeping WebSocket connections alive](https://developers.ringcentral.com/guide/notifications/websockets/heart-beats)

### Message Ordering & State Consistency
- [WebSockets guarantee order - so why are my messages scrambled?](https://www.sitongpeng.com/writing/websockets-guarantee-order-so-why-are-my-messages-scrambled)
- [Delivery guarantees | Socket.IO](https://socket.io/docs/v4/delivery-guarantees)
- [Solving eventual consistency in frontend - LogRocket Blog](https://blog.logrocket.com/solving-eventual-consistency-frontend/)

### Clock Synchronization & Countdown Timers
- [Syncing Countdown Timers Across Multiple Clients — A Subtle but Critical Challenge](https://medium.com/@flowersayo/syncing-countdown-timers-across-multiple-clients-a-subtle-but-critical-challenge-384ba5fbef9a)
- [Game Networking (2) - Time, Tick, Clock Synchronisation](https://daposto.medium.com/game-networking-2-time-tick-clock-synchronisation-9a0e76101fe5)

### Optimistic Updates & Rollback
- [Understanding optimistic UI and React's useOptimistic Hook - LogRocket Blog](https://blog.logrocket.com/understanding-optimistic-ui-react-useoptimistic-hook/)
- [Why I Never Use Optimistic Updates (And Why You Might Regret It Too)](https://dev.to/criscmd/why-i-never-use-optimistic-updates-and-why-you-might-regret-it-too-4jem)
- [Optimistic updates with concurrency control](https://medium.com/first-resonance-engineering/optimistic-updates-with-concurrency-control-6f1b07b8e98d)

### Memory Leaks & Connection Cleanup
- [Memory leak? · Issue #804 · websockets/ws](https://github.com/websockets/ws/issues/804)
- [How I Fixed A Node Memory Leak - SES](https://softwareengineeringstandard.com/2022/08/03/how-i-fixed-a-node-memory-leak/)
- [Keepalive and latency - websockets 16.0 documentation](https://websockets.readthedocs.io/en/stable/topics/keepalive.html)

### Broadcast Patterns
- [Broadcasting - websockets 16.0 documentation](https://websockets.readthedocs.io/en/stable/topics/broadcast.html)
- [Send message to everyone except sender · Issue #465 · websockets/ws](https://github.com/websockets/ws/issues/465)
- [WebSocket broadcasting with JavaScript and Bun](https://dev.to/robertobutti/websocket-broadcasting-with-javascript-and-bun-3mkf)

---
*Pitfalls research for: Real-time multiplayer lobby with WebSocket state synchronization (Catan online)*
*Researched: 2026-01-18*
