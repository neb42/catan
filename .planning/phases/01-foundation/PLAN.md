wave: 1
depends_on: []
files_modified:
  - .planning/phases/01-foundation/PLAN.md
  - libs/shared/**
  - apps/api/src/**
  - apps/web/src/**
autonomous: false
---

## Tasks
<tasks>
  <task id="T0" owner="ai">Scaffold libs/shared workspace library (Nx or manual) with build/test setup so Phase 1 contracts have a home</task>
  <task id="T1" owner="ai">Define shared contracts in libs/shared (Zod schemas, TS types, error codes, room/nickname rules, REST payloads, WS envelope)</task>
  <task id="T2" owner="ai">Implement room manager in api (create/join/leave, in-memory store, TTL cleanup, validation) with unit tests</task>
  <task id="T3" owner="ai">Expose REST endpoints for room lifecycle wired to shared schemas and room manager with error handling and contract tests</task>
  <task id="T4" owner="ai">Add WebSocket server for lobby events (hello handshake, lobby_state broadcast, player_joined/left, ping/pong, reconnect support) backed by room manager</task>
  <task id="T5" owner="ai">Replace NxWelcome with create/join flows using TanStack Query + Zod; persist session (roomId, playerId, nickname) in Zustand; surface validation errors</task>
  <task id="T6" owner="ai">Implement lobby UI with WebSocket wiring (connect after create/join, render player list, share room code, leave handling)</task>
  <task id="T7" owner="ai">Add reliability touches: heartbeat/backoff, reconnect handshake, input validation messaging, and error toasts</task>
  <task id="T8" owner="ai">Add coverage: room manager unit tests, REST contract tests, WS happy path + latency check; update STATE/ROADMAP as needed</task>
</tasks>

## Verification Criteria
- libs/shared exists and exports Zod schemas/types for room, player, envelope, errors, and validation constraints
- REST endpoints create/join/leave rooms with schema validation and return playerId and roomId using shared contracts
- WebSocket server sends lobby_state and player_joined/left broadcasts within target latency budget (<500ms in test harness)
- Frontend can create a room, join with nickname, and see lobby updates in real time using WS events
- Client sessions persist roomId/playerId for reconnect; leave flow removes player from lobby
- Tests cover room manager logic, REST contracts, and at least one end-to-end WS flow with latency assertion

## must_haves
- User can create a room and receive a shareable room ID
- User can join a room by ID with a nickname enforced by validation
- Real-time lobby updates via WebSocket for joins/leaves
- Shared types/schemas enforce contracts across client and server
- Basic error handling for invalid room ID or nickname

## Gap Fixes (revision)
- T0: Create libs/shared library scaffold so schemas/types can be added where none exist today.
- T1: Fill libs/shared with Zod schemas for roomId/nickname rules, REST payloads, WS envelopes, error codes, and re-exported TS types consumed by api and web.
- T2/T3: Build room manager (in-memory with TTL cleanup), validation using shared schemas, and REST create/join/leave routes returning roomId/playerId with typed errors.
- T4: Add WebSocket server handling hello/ping/pong, lobby_state broadcast, and player_joined/player_left events wired to room manager data.
- T5/T6: Replace NxWelcome with create/join forms using Zod + TanStack Query; store session (roomId, playerId, nickname) in Zustand; connect WebSocket after create/join and render lobby player list and shareable room code; handle leave.
- T7: Add client reliability touches (heartbeat/backoff, validation messaging, error toasts) and persist session for reconnect.
- T8: Add tests: room manager unit coverage, REST contract tests for create/join/leave, and a happy-path WS flow with latency budget assertion.
