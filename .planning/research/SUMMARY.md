# Project Research Summary

**Project:** Catan - Multiplayer Online Board Game
**Domain:** Real-time multiplayer game lobby with WebSocket state synchronization
**Researched:** 2026-01-18
**Confidence:** HIGH

## Executive Summary

Building a real-time multiplayer game lobby for Catan requires a server-authoritative architecture with WebSocket-based state synchronization. The industry standard approach uses a lightweight WebSocket server (ws library) on the backend paired with a specialized client hook (react-use-websocket) for connection management, Zustand for client state, and Zod for message validation across the client-server boundary. The lobby pattern follows an optimistic UI approach where clients predict state changes instantly but the server maintains canonical state and broadcasts updates to all players.

The recommended approach prioritizes correctness over features in Phase 1. WebSocket infrastructure must include connection cleanup, heartbeat mechanisms, and reconnection handling from day one, as retrofitting these is significantly harder than building them correctly upfront. The lobby state should remain in-memory for v0.1 (supporting 3-4 player lobbies), with server-authoritative validation for all state changes (colors, ready states, countdown) to prevent race conditions. Full state broadcasts are acceptable at this scale, though delta updates may be needed later.

Critical risks center on race conditions and state synchronization. The two most dangerous pitfalls are concurrent state updates (two players selecting the same color simultaneously) and message ordering assumptions breaking with async handlers. These must be addressed in Phase 1 through atomic server-side operations and sequential per-client message processing. Clock drift in countdown timers is mitigated by using server timestamps rather than client-side intervals. Reconnection handling should be implemented early but can use a simple "ghost player" pattern with a 30-60 second grace period.

## Key Findings

### Recommended Stack

The research confirms that modern WebSocket implementations favor lightweight, protocol-native approaches over heavier frameworks like Socket.IO. For a friends-only lobby with modern browsers, raw WebSocket provides better control and smaller bundle sizes without sacrificing functionality.

**Core technologies:**
- **ws (^8.19.0)**: Backend WebSocket server — Already in use, production-ready, handles upgrade pattern, no framework lock-in
- **react-use-websocket (^4.0.0)**: Frontend WebSocket hook — Purpose-built with auto-reconnection, exponential backoff, heartbeat, message queueing out of the box
- **Zustand (^5.0.10)**: Client state management — Minimal boilerplate, handles async naturally, supports transient updates for high-frequency messages
- **Zod (^4.3.5)**: Message validation — TypeScript-first runtime validation for untrusted WebSocket messages, zero dependencies, industry standard
- **Immer (^11.1.3)**: Immutable state updates — Simplifies nested state updates in lobby (player list, colors, ready states), prevents mutation bugs

**Supporting libraries:**
- **nanoid (^5.0.9)**: Generate unique lobby/player/message IDs, 2x faster than UUID, URL-friendly
- **date-fns (^4.1.0)**: Timestamp handling for WebSocket messages and countdown calculations

**Message protocol pattern:** Typed JSON with Zod validation using discriminated unions. Base message includes id (nanoid), type (event discriminator), timestamp (Date.now()), and typed payload. Server validates with safeParse() and sends typed errors on rejection. This provides runtime safety while maintaining TypeScript compile-time types through z.infer.

**State synchronization pattern:** Optimistic updates with server authority. Client predicts state changes for instant feedback, sends message to server, server validates and broadcasts authoritative state, client reconciles (overwrites optimistic prediction). For small lobby state (3-4 players), full state sync on each update is acceptable (<1KB per broadcast).

### Expected Features

The research reveals that multiplayer game lobbies follow well-established patterns across platforms (Steam, Board Game Arena, Unity Game Lobby). Friends-only lobbies prioritize ease of sharing (direct links/codes) over complex matchmaking, and manual host control over automated systems.

**Must have (table stakes):**
- Player list with real-time updates — Core lobby function
- Player names/nicknames — Basic identity
- Ready/unready toggle — Standard coordination mechanism
- Visual player status — See ready state, host designation, connection status
- Host-initiated game start — Standard pattern, not auto-start
- Countdown before game start — 3-5 seconds standard, prevents accidental starts
- Shareable lobby link/code — Essential for friends-only invite mechanism
- Lobby capacity limit (3-4 players) — Enforce Catan game rules
- Player disconnect handling — Show disconnected state, graceful recovery
- Leave lobby action — Explicit exit mechanism

**Should have (competitive):**
- Color selection (player choice) — Adds personality, reduces in-game confusion
- Auto-start when all ready — UX improvement (can start with manual pattern first)
- Copy link button — Small UX win for sharing
- Reconnect on disconnect — Expected in serious platforms, 30-60s grace period
- Player kick (host only) — Useful for AFK or accidental joins
- Lobby chat — Social coordination while waiting
- Visual feedback animations — Polish for state transitions

**Defer (v2+):**
- Sound effects — Polish after core UX solid
- Lobby settings (game options) — Wait until base game complete and users want variants
- Host migration — Complex, defer until proven need
- Voice chat — Assume Discord/Zoom use, high implementation complexity
- Public matchmaking — Different product vision, requires scale and moderation

**Anti-features to avoid:**
- Public matchmaking in v0.1 (requires critical mass)
- Voice chat (duplicates Discord, adds complexity)
- Complex lobby filtering (unnecessary for single shared lobby)
- Countdown interruption on un-ready (frustrating, enables trolling)

### Architecture Approach

The standard architecture for real-time lobbies uses a server-authoritative pattern with message-based communication. The backend maintains canonical state in-memory (Map of lobbies with player Sets), validates all state transitions, and broadcasts updates. The frontend uses optimistic UI for instant feedback but reconciles with server state. This prevents race conditions and cheating while maintaining responsive UX.

**Major components:**
1. **WebSocket Server (backend)** — Connection tracking by client ID, message routing to feature handlers, broadcasting to lobby participants
2. **Lobby Service (backend)** — Business logic, state mutations, validation, countdown timer management, source of truth for lobby state
3. **Connection Manager (backend)** — Maps WebSocket connections to stable client IDs, handles cleanup on disconnect, manages heartbeat/ping-pong
4. **Message Router (backend)** — Routes typed messages to appropriate handlers, validates with Zod schemas before processing
5. **WebSocket Hook (frontend)** — Connection lifecycle, reconnection with exponential backoff, message send/receive, heartbeat
6. **Lobby State Store (frontend)** — Optimistic local state, reconciliation with server updates, Zustand with Immer middleware

**Key architectural patterns:**
- **Server-authoritative state:** Client sends intents, server validates and broadcasts canonical state
- **Message-based communication:** Typed JSON protocol with Zod validation, not RPC-style
- **Optimistic UI with reconciliation:** Instant local updates, overwritten by server state
- **Connection mapping:** Separate WebSocket connection ID from persistent player/session ID for reconnection support

**Data flow for state changes:**
User action → Optimistic UI update → Send WebSocket message → Server validates → Server broadcasts authoritative state → All clients reconcile

**Project structure:**
- Backend: `features/lobby/` (service, handlers, types, constants), `websocket/` (server, router, connection manager)
- Frontend: `features/lobby/components/` (LobbyScreen, PlayerList, PlayerCard, ColorPicker, CountdownDisplay), `features/lobby/hooks/` (useLobbyWebSocket, useLobbyState, useCountdown)

### Critical Pitfalls

The research identifies seven critical pitfalls that must be addressed in Phase 1, as they are architectural and extremely difficult to retrofit.

1. **Race conditions on concurrent state updates** — Two players selecting the same color simultaneously can both succeed briefly. Prevent with atomic server-side operations, optimistic UI with rollback on rejection, and sequence numbers or version checking for state validation.

2. **Message ordering assumptions breaking with async handlers** — Despite TCP ordering, async operations (await, DB queries) can cause messages to process out of order. Prevent with per-client message queues for sequential processing, state machine validation to reject invalid transitions, and avoiding unnecessary async operations.

3. **Stale connections and memory leaks** — Disconnected clients remain in server tracking, consuming memory indefinitely. Prevent with proper close/error handlers, ping/pong heartbeat (20-30s interval), connection cleanup in both close and error events, and monitoring connection count metrics.

4. **Clock drift causing countdown desyncs** — Client-side timers drift, showing different countdown values across players. Prevent by broadcasting server countdown end time (absolute timestamp), clients calculating remaining time from server time, continuous recalculation to self-correct drift.

5. **Broadcast patterns creating state desync** — Broadcasting to "all except sender" without proper handling causes sender state to diverge. Prevent by choosing consistent pattern (broadcast to ALL including sender, sender discards optimistic state) or using correlation IDs with acknowledgments.

6. **Reconnection not restoring lobby state** — Brief network drops treat player as new, losing all state (color, ready status). Prevent with persistent session IDs (localStorage), "ghost player" grace period (30-60s), and state restoration on reconnection with valid session ID.

7. **Unique nickname validation race windows** — Two players claiming same nickname simultaneously can both succeed. Prevent with atomic "claim if available" operations, no separate check-then-claim, synchronous check-and-set in message handler (JavaScript single-threaded), and clear success/failure responses.

## Implications for Roadmap

Based on research, the suggested phase structure prioritizes WebSocket infrastructure correctness before building lobby features. The architecture requires a solid foundation of connection management, message routing, and state synchronization before layering on color selection, countdown, and polish.

### Phase 1: WebSocket Infrastructure and Basic Lobby

**Rationale:** All lobby features depend on reliable WebSocket communication. Research shows that retrofitting connection cleanup, heartbeat, and reconnection handling is significantly harder than building it correctly upfront. Phase 1 must establish the foundation: connection lifecycle, message routing with validation, and basic lobby join/leave with player list synchronization.

**Delivers:** Working WebSocket server with connection tracking, message router with Zod validation, connection manager with cleanup and heartbeat, basic lobby service with join/leave, frontend WebSocket hook with reconnection and exponential backoff, lobby screen showing real-time player list.

**Addresses features:**
- Player list with real-time updates (table stakes)
- Player names/nicknames (table stakes)
- Shareable lobby link/code (table stakes)
- Lobby capacity limit (table stakes)
- Player disconnect handling (table stakes)
- Leave lobby action (table stakes)

**Avoids pitfalls:**
- Stale connections and memory leaks (heartbeat + cleanup from start)
- Message ordering assumptions (sequential per-client queue from start)
- Reconnection doesn't restore state (session ID persistence from start)
- Broadcast patterns creating state desync (establish pattern early)

**Research needs:** Standard patterns, no additional research needed beyond this summary.

### Phase 2: Color Selection and Ready System

**Rationale:** With infrastructure proven, add the coordination mechanisms. Color selection demonstrates the race condition prevention patterns (atomic operations, optimistic UI with rollback) that will be reused for ready states. Research shows these features are tightly coupled in the architecture (both use optimistic updates and server validation) and should be built together to establish the state synchronization pattern.

**Delivers:** Color picker UI with optimistic selection, server-side color conflict validation with first-come-first-served, rollback on rejection with user feedback, ready toggle button, server validation of ready state changes, visual indicators for ready status.

**Addresses features:**
- Color selection (differentiator, should have)
- Ready/unready toggle (table stakes)
- Visual player status showing ready state (table stakes)

**Uses stack:**
- Zustand with Immer for optimistic state updates and rollback
- Zod for color and ready message validation
- React-use-websocket's optimistic send/receive pattern

**Implements architecture:**
- Server-authoritative state pattern with optimistic UI
- Message-based communication with typed payloads
- Validation and error handling with clear user feedback

**Avoids pitfalls:**
- Race conditions on concurrent updates (atomic color validation, ready state)
- Broadcast patterns creating state desync (sender reconciles with server state)
- Unique constraint validation (color uniqueness enforced atomically)

**Research needs:** Standard patterns, no additional research needed.

### Phase 3: Countdown Timer and Game Start

**Rationale:** Countdown depends on ready system (triggers when all ready) and demonstrates the clock synchronization pattern. Research emphasizes that countdown must use server timestamps, not client-side timers, to prevent drift. This is a good test of the broadcast and state sync patterns before moving to actual gameplay.

**Delivers:** Server-side countdown timer starting when all players ready (minimum 2 players), countdown tick broadcasts every second with remaining time, client countdown display calculating from server timestamp, countdown cancellation if player un-readies, game start broadcast at countdown zero, navigation to game screen.

**Addresses features:**
- Host-initiated game start (table stakes) — Auto-start when all ready, host can also manually trigger
- Countdown before game start (table stakes)
- Auto-start when all ready (differentiator, should have)

**Uses stack:**
- Date-fns for timestamp calculations
- Server-side timer utility
- WebSocket broadcast pattern for countdown ticks

**Implements architecture:**
- Server-authoritative timing (no client-side countdown)
- Continuous state broadcast pattern (tick messages)
- State transition logic (waiting → countdown → starting)

**Avoids pitfalls:**
- Clock drift causing countdown desyncs (server timestamp pattern)
- Broadcast consistency for time-sensitive updates

**Research needs:** Standard patterns, no additional research needed.

### Phase 4: Reconnection and Error Handling Polish

**Rationale:** With core features complete, harden the system for production. Research shows reconnection is expected in serious platforms and should include a grace period where disconnected players are held in "ghost" state. Error handling polish ensures all validation failures show clear user feedback.

**Delivers:** Session ID persistence in localStorage, ghost player state on disconnect (30-60s grace period), full state restoration on reconnection, connection status UI (connecting/connected/disconnected), loading states on all actions, error messages for all validation failures (nickname taken, color taken, can't start game), rate limiting on client messages.

**Addresses features:**
- Reconnect on disconnect (differentiator, should have)
- All table stakes features now production-ready

**Avoids pitfalls:**
- Reconnection doesn't restore state (complete solution)
- Silent failures (all errors now have user feedback)
- No rate limiting (DoS protection)

**Research needs:** Standard patterns, no additional research needed.

### Phase 5: Optional Polish (Chat, Animations, Sounds)

**Rationale:** After core system is production-ready, add UX polish based on user feedback. Research shows these are nice-to-have, not critical for launch. Can be prioritized based on actual user requests during testing.

**Delivers:** Lobby chat (if requested), visual feedback animations for joins/leaves/ready changes, sound effects for events, copy link button for easy sharing, player kick functionality (host only).

**Addresses features:**
- Lobby chat (differentiator, should have if requested)
- Visual feedback animations (differentiator, should have)
- Copy link button (differentiator, should have)
- Player kick (differentiator, should have)

**Research needs:** Standard UI patterns, no additional research needed.

### Phase Ordering Rationale

- **Infrastructure first:** WebSocket connection management, cleanup, and heartbeat are architectural foundations. Retrofitting is costly and error-prone. Build correctly from day one.

- **State sync pattern established early:** Color selection and ready system demonstrate the optimistic UI + server authority pattern that will be reused throughout. Getting this right in Phase 2 informs all future features.

- **Countdown tests the architecture:** Server timestamps and broadcast synchronization are complex patterns. Proving them with countdown before building actual game logic validates the architecture.

- **Hardening before polish:** Reconnection and error handling are production requirements. Polish (chat, animations) is deferred until core system is solid.

- **Defer complexity:** Host migration, lobby settings, and voice chat are complex features with unclear value for friends-only MVP. Research shows most users rely on external voice (Discord). Validate need before building.

### Research Flags

**Phases with standard patterns (no additional research needed):**
- **Phase 1:** WebSocket infrastructure is well-documented, extensive sources confirm patterns
- **Phase 2:** Color selection and ready systems use established multiplayer patterns
- **Phase 3:** Countdown timer synchronization has clear best practices from gaming sources
- **Phase 4:** Reconnection patterns are standard across realtime platforms
- **Phase 5:** UI polish is standard web development

**Future phases that may need research:**
- **Game state synchronization (post-lobby):** Catan board state is more complex than lobby, may need research on board game state management patterns
- **Persistence layer (if added):** Currently in-memory only, adding database for lobby history may need research on WebSocket + DB patterns
- **Scaling beyond single server:** Redis pub/sub patterns documented but not deeply researched, would need phase-specific research

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommended libraries verified with official npm data, version compatibility confirmed, React 19 compatibility verified |
| Features | MEDIUM | Based on established platforms (Board Game Arena, Steam, Unity) and well-documented patterns, but some friends-only specific decisions are inferred |
| Architecture | HIGH | Multiple authoritative sources agree on server-authoritative state, message-based communication, optimistic UI patterns for multiplayer lobbies |
| Pitfalls | MEDIUM | Race conditions, reconnection, and clock drift patterns verified across multiple sources, but some specifics inferred from general WebSocket guidance |

**Overall confidence:** HIGH

The stack recommendations are verified against official sources and npm package data. The architecture patterns have strong consensus across multiplayer gaming sources (Pusher, Ably, Unity, major tutorials). Feature expectations are based on analysis of established platforms. Pitfalls are documented across realtime systems but some are generalized from broader WebSocket guidance rather than lobby-specific sources.

### Gaps to Address

- **Color conflict resolution UX:** Research identifies the race condition and prevention (atomic server validation) but doesn't specify optimal user feedback. Decision needed: show "taken" error, auto-select next available, or show all taken colors as disabled?

- **Reconnection grace period duration:** Research suggests 30-60 seconds but optimal duration depends on typical network recovery times. May need adjustment based on real-world testing.

- **Full state vs delta updates:** Research confirms full state is acceptable for small lobbies (3-4 players) but threshold for needing delta updates is unclear. Monitor message sizes and bandwidth during testing.

- **Message rate limiting thresholds:** Research recommends rate limiting but doesn't specify thresholds for lobby actions. Typical recommendation is 10 msg/sec but may need tuning based on legitimate use patterns.

- **Countdown duration:** Research mentions 3-5 seconds standard but doesn't have Catan-specific guidance. 5 seconds seems reasonable for friends playing together (less urgent than competitive matchmaking).

- **Host migration priority:** Research identifies this as complex and possibly unnecessary for friends-only, but doesn't have strong data on how often hosts disconnect mid-lobby. Monitor during testing to validate defer decision.

## Sources

### Stack Research (HIGH confidence)
- [Zod Official Docs](https://zod.dev/) — Schema validation patterns, version 4.3.5 confirmed
- [Zustand GitHub](https://github.com/pmndrs/zustand) — State management patterns, v5.0.10 confirmed, 15.4M weekly downloads
- [react-use-websocket GitHub](https://github.com/robtaussig/react-use-websocket) — Official docs confirm v4.0.0 features (reconnection, heartbeat, message queueing)
- [npm package data](https://www.npmjs.com/) — Version numbers and compatibility verified for all recommended packages
- [Immer Official Docs](https://immerjs.github.io/immer/) — Immutable update patterns, Zustand integration confirmed

### Feature Research (MEDIUM confidence)
- [Board Game Arena - CATAN](https://en.boardgamearena.com/gamepanel?game=catan) — Leading platform analysis for feature expectations
- [Steam Matchmaking & Lobbies](https://partner.steamgames.com/doc/features/multiplayer/matchmaking) — Lobby patterns from major gaming platform
- [Unity Game Lobby Sample](https://docs.unity.com/ugs/manual/lobby/manual/game-lobby-sample) — Ready states, countdown, color filtering patterns
- [PlayFab Lobby and Matchmaking](https://learn.microsoft.com/en-us/gaming/playfab/multiplayer/lobby/lobby-and-matchmaking) — Lobby communication patterns
- [Game UI Database - Pre-Game & Lobby](https://www.gameuidatabase.com/index.php?scrn=43) — Visual design pattern analysis

### Architecture Research (HIGH confidence)
- [WebSocket Architecture Best Practices - Ably](https://ably.com/topic/websocket-architecture-best-practices) — Authoritative guide on WebSocket patterns
- [Gabriel Gambetta - Client-Side Prediction](https://www.gabrielgambetta.com/client-side-prediction-server-reconciliation.html) — Authoritative source on optimistic UI and server reconciliation
- [react-use-websocket GitHub](https://github.com/robtaussig/react-use-websocket) — React integration patterns confirmed
- [Building Multiplayer Game Using WebSockets - DEV](https://dev.to/sauravmh/building-a-multiplayer-game-using-websockets-1n63) — Lobby-specific implementation patterns
- [Unity Game Lobby Sample - GitHub](https://github.com/Unity-Technologies/com.unity.services.samples.game-lobby) — Reference implementation

### Pitfalls Research (MEDIUM confidence)
- [WebSockets guarantee order - so why are my messages scrambled?](https://www.sitongpeng.com/writing/websockets-guarantee-order-so-why-are-my-messages-scrambled) — Message ordering pitfall, well-documented
- [Syncing Countdown Timers Across Multiple Clients](https://medium.com/@flowersayo/syncing-countdown-timers-across-multiple-clients-a-subtle-but-critical-challenge-384ba5fbef9a) — Clock drift prevention patterns
- [Handling Race Conditions in Real-Time Apps](https://dev.to/mattlewandowski93/handling-race-conditions-in-real-time-apps-49c8) — Race condition patterns and prevention
- [Understanding Ping Pong Frame WebSocket (2025)](https://www.videosdk.live/developer-hub/websocket/ping-pong-frame-websocket) — Heartbeat mechanism documentation
- [Keepalive and latency - websockets documentation](https://websockets.readthedocs.io/en/stable/topics/keepalive.html) — Connection cleanup patterns
- [Why I Never Use Optimistic Updates](https://dev.to/criscmd/why-i-never-use-optimistic-updates-and-why-you-might-regret-it-too-4jem) — Counterpoint on optimistic UI complexity

---
*Research completed: 2026-01-18*
*Ready for roadmap: Yes*
