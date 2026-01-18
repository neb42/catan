# Phase 1: WebSocket Infrastructure - Context

**Gathered:** 2026-01-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish reliable real-time communication layer with connection management, message routing, and state synchronization patterns. This is foundational infrastructure enabling all subsequent lobby and game features.

</domain>

<decisions>
## Implementation Decisions

### Connection lifecycle
- Client IDs generated as UUID v4 on the server (random, cryptographically unique)
- Client ID sent to client after handshake message (client sends init, server responds with ID)
- Connection state tracked in-memory using Map<clientId, connection>
- 30-second grace period on disconnect before cleanup (allows brief reconnects to preserve session)

### Reconnection behavior
- Exponential backoff strategy for reconnection attempts (start at 1s, double up to 30s max)
- Unlimited retry attempts (keep trying until user closes tab)
- Client persists its ID in memory and sends it during reconnect handshake
- Connection status indicator shown to user during reconnection ("Reconnecting...")
- Clear local state and resync from server after successful reconnection
- After 30+ seconds (past grace period), server treats as new connection (session lost)

### Message format and validation
- Type + payload pattern: `{ type: 'EVENT_NAME', payload: {...} }`
- Schema validation using Zod or similar library for type-safe validation
- Invalid messages trigger error response sent back to sender
- All messages include server-generated timestamp and unique message ID

### Broadcast and routing patterns
- Room-based architecture from the start (even though v0.1 has single lobby)
- Explicit JOIN_ROOM/LEAVE_ROOM messages for room membership
- Support both room broadcast AND targeted messages to specific client IDs
- Rooms structured as objects with metadata (capacity, state, created time, etc.)

### Claude's Discretion
- Exact exponential backoff timing curve
- Message ID generation strategy
- Room metadata schema details
- Error message format specifics
- WebSocket library choice (ws vs alternatives)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard WebSocket patterns and best practices.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-websocket-infrastructure*
*Context gathered: 2026-01-18*
