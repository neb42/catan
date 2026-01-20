# Phase 01: Foundation – Research & Planning Notes

## Scope & Outcomes
- Build the lobby foundation: room lifecycle (create/join/leave), nickname capture, WebSocket plumbing for real-time lobby updates (<500ms target), and shared contracts (types, Zod schemas, constants).
- Deliverables: `libs/shared` package, API endpoints (create/join/leave), WebSocket connection & routing, lobby UI (room list + join form), validation and basic error handling.

## Definition of Ready (planning checklist)
- Lock room ID format (length, alphabet) and nickname rules (length bounds, charset, uniqueness policy) with matching regex/constants.
- Decide max players per room and cleanup policy (on-empty removal vs TTL sweep) to control memory.
- Choose HTTP + WS handshake: REST create/join returns `roomId`/`playerId`, WS `hello` authenticates those values, then subscribe to room channel.
- Finalize envelope shape for WS/HTTP errors and success responses; align error codes with UX copy.
- Confirm whether lobby list is required (server exposes list of active rooms) or only join-by-code; align UI accordingly.
- Latency measurement plan: include timestamp echo (`ping/pong`), target <500ms round-trip for lobby events.
- Testing scope agreed: unit (schemas, room manager), integration (create+join, WS broadcast), manual latency sanity.

## Architecture Shape (proposed)
- Shared contracts: `libs/shared/src` exports Zod schemas + inferred TS types for Room, Player, Lobby events (client⇄server), error codes, room ID format, validation constraints (nickname length, allowed chars).
- Backend (Express + WS): REST for create/join/leave; WebSocket server for lobby events; room manager module holds in-memory state (Room → players, metadata, createdAt, status). Thin controller → service → room manager for testability.
- Frontend (React + Vite + Mantine + TanStack Query/Router + Zustand):
  - REST via TanStack Query for create/join; store auth-ish session (roomId, playerId, nickname) in Zustand.
  - WebSocket client hooks (connect on lobby screen once roomId is known; auto-reconnect with backoff; heartbeat/ping?).
  - UI: create form, join form, room list (from WS broadcast), participant list.

## Data & Contracts to Define Early
- Room ID: short, uppercase alpha (e.g., 6 chars A-Z) or nanoid with constrained alphabet; regex and length constants shared.
- Nickname: required, trim, length bounds (e.g., 2–20), allowed chars; server trims/normalizes; client pre-validates.
- Player identity: server issues `playerId` (UUID/nanoid) on create/join; returned via REST; used for WebSocket identify messages.
- REST shapes:
  - POST /rooms → { roomId, playerId, nickname }
  - POST /rooms/:roomId/join → { roomId, playerId, nickname }
  - POST /rooms/:roomId/leave → 204 or { ok: true }
- WebSocket messages (versioned):
  - Client→Server: `hello` (roomId, playerId, nickname), `ping`, `leave`.
  - Server→Client: `lobby_state` (room + players), `player_joined`, `player_left`, `error`, `pong`.
  - Envelope: { type, data, ts?, version } with schema validation both ends.
- Errors: shared enum + codes (e.g., ROOM_NOT_FOUND, ROOM_FULL, NICKNAME_REQUIRED, VALIDATION_ERROR). Map to HTTP 400/404/409 and WS error frames.

## Room Manager & Concurrency Considerations
- In-memory store for Phase 01 (fast, simple). Data structures: Map<roomId, RoomState>; RoomState contains players Map, createdAt, lastUpdate.
- Operations atomic per room (synchronous JS is fine; guard against double joins and ghost leaves). Validate inputs using shared schemas.
- Cleanup strategy: time-to-live idle rooms (setInterval sweep) or max age; optional cap on total rooms.
- WebSocket session tracking: map ws → { roomId, playerId }; on close, trigger leave + broadcast.

## WebSocket Infrastructure
- Server: use `ws` library with Express server; per-connection handler validates first `hello` before subscribing to room; reject if invalid room/nickname. Broadcast with simple fan-out over connections per room.
- Heartbeats: `ping`/`pong` or ws `heartbeat` to detect dead connections (<500ms target implies need to close stale sockets quickly, but start with 30s heartbeat). On heartbeat failure, clean up membership.
- Backpressure: small payloads; avoid large state; serialize events once per broadcast.
- Versioning: include `version: 1` in envelope to future-proof.

## Frontend Lobby UX Notes
- Screens: landing with create/join cards; after joining, show lobby view (room code, share affordance, player list reactive via WS, leave button).
- Validation UX: inline errors for room ID format and nickname required; disabled submit while invalid; surface server errors (toast or banner).
- Real-time updates: connect WS after successful create/join; optimistic add self to list; reconcile with server `lobby_state`.

## Performance & Reliability Targets
- Broadcast latency budget: server processes message + broadcast ≤100ms; network variance remainder. Keep payload small (<2KB). Measure with timestamps in events.
- Reconnects: auto-reconnect with capped backoff; upon reconnect, resend `hello` with same playerId to re-associate.
- Debounce broadcast storms: not needed now; but ensure single broadcast per join/leave.

## Validation & Security
- Trust server validation first; client mirrors schemas for UX only.
- Sanitize nickname (trim, collapse spaces?); reject empty after trim.
- Rate limits (soft): optional per-IP create/join throttle (later), but note as risk.
- CORS/WebSocket origin check for dev only; ensure no arbitrary origins in prod config.

## Testing Strategy (Phase 01)
- Unit: room manager create/join/leave, validation failures, duplicate join, leave non-member.
- Contract tests: shared Zod schemas round-trip, REST handlers request/response validation.
- WS integration (happy path): connect → hello → receive lobby_state; join/leave broadcasts.
- Latency check: simple measurement of server broadcast turnaround in test harness.

## Risks & Mitigations
- Ghost players after network drop → heartbeat + close cleanup.
- Room ID collisions → check before create; retry generation.
- Race conditions on reconnect → require `hello` before accepting other client messages; last-writer-wins on same playerId.
- Over-broad error messages → use codes + user-friendly messages; log internal detail server-side.

## Implementation Order (suggested for 1-week window)
1) Shared schemas/types/constants in `libs/shared` (roomId rules, nickname rules, message envelopes, error codes).
2) Room manager (in-memory) with tests.
3) REST endpoints wired to room manager + validation.
4) WebSocket server wrapping room manager + validation + broadcasts.
5) Frontend flows: create/join forms with schemas, query mutations; connect WS and render lobby list.
6) Polish: error displays, leave handling, heartbeat/reconnect basics.

## Open Questions to Resolve Early
- Exact room ID format and length? (6 uppercase letters suggested.)
- Max players per room? (default 4? 6?)
- Room persistence beyond memory? (Phase 01 likely no; note for later.)
- Heartbeat interval and reconnect backoff parameters?
- Do we expose a room list endpoint for browsing, or only known room IDs? (Phase 01 deliverable mentions room list—derive from server state?)
