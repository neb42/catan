# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-18)

**Core value:** Friends can play Settlers of Catan together online with full base game rules and real-time turn-based gameplay.
**Current focus:** Phase 2.1 - Setup Testing Framework with Jest (INSERTED)

## Current Position

Phase: 2.1 of 7 (Setup Testing Framework with Jest)
Plan: Ready to plan
Status: Phase 2 complete, Phase 2.1 not started (urgent insertion)
Last activity: 2026-01-19 — Phase 2 completed and verified (4/4 success criteria passed)

Progress: [███░░░░░░░] 33%

## Performance Metrics

**Velocity:**
- Total plans completed: 7
- Average duration: 3.4 min
- Total execution time: 0.4 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-websocket-infrastructure | 4 | 9min | 2.25min |
| 02-landing-and-lobby-entry | 3 | 19min | 6.3min |

**Recent Trend:**
- Last 5 plans: 01-04 (2min), 02-01 (1min), 02-02 (3min), 02-03 (15min)
- Trend: UI implementation plans take longer than schema/backend plans

*Updated after each plan completion*

## Accumulated Context

### Roadmap Evolution

- Phase 2.1 inserted after Phase 2: Setup testing framework with Jest and retroactively add tests to code (URGENT)
  - Reason: Quality assurance needed before building additional lobby features
  - Requirement: All future plans must include passing tests for completion

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Single lobby model: Friends-only use case, simplest architecture (Pending)
- No user accounts: Reduces complexity, nicknames sufficient for friend groups (Pending)
- Block late arrivals: Simpler than queue/spectator for v0.1 (Good)
- Color stealing mechanic: First-to-ready gets priority, prevents conflicts (Pending)
- 3-4 players only for v0.1: Base game first, expansion later (Good)
- Placeholder game screen: Lobby complete before building actual game (Good)

**From 01-01 (WebSocket Message Schemas):**
- Use Zod discriminatedUnion for type-safe message routing without manual type guards (Good)
- Client-generated messages have type + payload only, server adds messageId and timestamp (Good)
- Nullable clientId in HANDSHAKE enables both new connections and reconnection attempts (Good)
- Use .parse() not .safeParse() to let ZodError throw for router to catch (Good)

**From 01-02 (Connection & Room Managers):**
- Use crypto.randomUUID() not uuid package (zero dependencies, 3x faster, built-in Node.js) (Good)
- 30-second heartbeat interval matches grace period for consistent timing (Good)
- Delete empty rooms immediately (no grace period for rooms, cheap to recreate) (Good)
- RoomManager delegates to ConnectionManager for all message sending (separation of concerns) (Good)
- Grace period tracks disconnected connections for 30 seconds enabling seamless reconnection (Good)

**From 01-03 (Message Router Integration):**
- Use crypto.randomUUID() for messageId generation (consistent with clientId, no dependencies) (Good)
- Set maxPayload to 1MB to prevent DoS attacks (default 100MB is vulnerability) (Good)
- ZodError.issues contains validation errors, not .errors (TypeScript property) (Good)
- Clean up managers in closeWebSocket to prevent memory leaks (Good)
- Invalid messages don't crash server, trigger ERROR responses (graceful degradation) (Good)

**From 01-04 (Client WebSocket Infrastructure):**
- Use exponential backoff with jitter (0-25%) to prevent thundering herd during server outages (Good)
- WebSocketProvider inside QueryClientProvider enables TanStack Query to access WebSocket state (Good)
- Auto-connect on app mount ensures WebSocket ready before any route navigation (Good)
- Multiple message handlers via Set pattern enables component-level message subscriptions (Good)
- 30-second max delay matches server grace period for seamless session recovery (Good)

**From 02-01 (Nickname Message Schemas):**
- Zod trim() validation ensures whitespace-only nicknames rejected at schema level (Good)
- NICKNAME_REJECTED reason enum enables client-specific error messaging (ALREADY_TAKEN vs INVALID_FORMAT) (Good)
- Schema-level length validation (3-30 chars) provides automatic validation during message parsing (Good)

**From 02-02 (Server Nickname Validation):**
- Case-insensitive nickname validation prevents 'Alice' vs 'alice' confusion (Good)
- Hardcoded 'lobby' roomId for v0.1 single-lobby model per PROJECT.md decision (Good)
- Nickname cleanup on client leave prevents stale nickname reservations (Good)
- Room-level nickname registry using Map<clientId, nickname> follows existing clients pattern (Good)

**From 02-03 (Landing Page and Lobby Entry):**
- CSS-only animations (no JavaScript loops) for better performance and bundle size (Good)
- Client sends JOIN_ROOM after NICKNAME_ACCEPTED to wire nickname validation to room membership (Good)
- Character counter uses Array.from() for accurate emoji counting (Good)
- Inline CSS in route file for route-specific styles (index.css) (Good)

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-01-19 — Plan execution
Stopped at: Completed 02-03-PLAN.md execution, SUMMARY created
Resume file: None
