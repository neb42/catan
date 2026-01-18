---
phase: 01-websocket-infrastructure
plan: 01
subsystem: infra
tags: [zod, websocket, validation, typescript]

# Dependency graph
requires:
  - phase: skeleton
    provides: "Express API with WebSocket server setup"
provides:
  - "Zod runtime validation for all WebSocket messages"
  - "Type-safe client and server message schemas with discriminated unions"
  - "Foundation for message router and connection manager"
affects: [01-websocket-infrastructure, connection-management, message-routing]

# Tech tracking
tech-stack:
  added: [zod@4.3.5]
  patterns:
    - "Discriminated union pattern for WebSocket message routing"
    - "Type + payload message structure with server-generated metadata"
    - "Schema-first development with automatic TypeScript type inference"

key-files:
  created:
    - apps/api/src/websocket/schemas/client-messages.ts
    - apps/api/src/websocket/schemas/server-messages.ts
    - apps/api/src/websocket/schemas/index.ts
  modified:
    - apps/api/tsconfig.app.json

key-decisions:
  - "Use Zod discriminatedUnion for type-safe message routing without manual type guards"
  - "Client-generated messages have type + payload only, server adds messageId and timestamp"
  - "Nullable clientId in HANDSHAKE enables both new connections and reconnection attempts"
  - "Use .parse() not .safeParse() to let ZodError throw for router to catch"

patterns-established:
  - "Message schema pattern: discriminated union on 'type' field for automatic TypeScript narrowing"
  - "Server messages include messageId and timestamp for correlation and debugging"
  - "Barrel exports from index.ts for convenient importing of schemas and types"

# Metrics
duration: 3min
completed: 2026-01-18
---

# Phase 01 Plan 01: WebSocket Message Schemas Summary

**Zod-validated WebSocket message schemas with discriminated unions for type-safe client-server communication**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-18T13:50:56Z
- **Completed:** 2026-01-18T13:54:13Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Installed Zod 4.x for runtime schema validation with TypeScript type inference
- Defined client message schemas (HANDSHAKE, JOIN_ROOM) with discriminated union pattern
- Defined server message schemas (CLIENT_ID, ERROR, ROOM_JOINED) with messageId and timestamp metadata
- Established type-safe message validation foundation for message router and connection manager

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Zod dependency** - `1fcb575` (chore)
2. **Task 2: Define Zod message schemas** - `aa00fcf` (feat)

## Files Created/Modified
- `package.json` - Added zod@4.3.5 dependency
- `apps/api/src/websocket/schemas/client-messages.ts` - HANDSHAKE and JOIN_ROOM schemas with discriminated union
- `apps/api/src/websocket/schemas/server-messages.ts` - CLIENT_ID, ERROR, and ROOM_JOINED schemas with metadata
- `apps/api/src/websocket/schemas/index.ts` - Barrel exports for all schemas and types
- `apps/api/tsconfig.app.json` - Fixed moduleResolution inheritance from base config

## Decisions Made

**Zod discriminatedUnion pattern:**
- Uses `z.discriminatedUnion('type', [...])` for automatic TypeScript type narrowing in switch statements
- Eliminates need for manual type guards when routing messages
- Provides excellent error messages when invalid message type received

**Server-generated metadata:**
- Server messages include `messageId` and `timestamp` fields not present in client messages
- Enables request/response correlation and debugging timeline
- Server adds these fields before sending, not validated from client input

**Nullable clientId in HANDSHAKE:**
- `clientId: z.string().uuid().nullable()` enables two flows:
  - `null` = new connection (server generates UUID)
  - `UUID` = reconnection attempt (server restores session if within grace period)

**Error handling with .parse():**
- Schemas use `.parse()` not `.safeParse()` to throw ZodError
- Message router will catch ZodError and convert to ERROR response
- Simpler error handling than checking success/error objects

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed TypeScript config moduleResolution conflict**
- **Found during:** Task 2 (schema file creation)
- **Issue:** `apps/api/tsconfig.app.json` overrode `moduleResolution: "node"` which conflicted with base config's `customConditions` setting requiring `nodenext` moduleResolution
- **Fix:** Removed `moduleResolution: "node"` override from tsconfig.app.json to inherit `nodenext` from base config
- **Files modified:** apps/api/tsconfig.app.json
- **Verification:** `npx tsc --noEmit -p apps/api/tsconfig.app.json` passes without errors
- **Committed in:** aa00fcf (Task 2 commit)

**2. [Rule 3 - Blocking] Used --legacy-peer-deps flag for npm install**
- **Found during:** Task 1 (Zod installation)
- **Issue:** npm install failed due to existing peer dependency conflicts between @swc/core versions (unrelated to Zod)
- **Fix:** Used `npm install zod --legacy-peer-deps` to bypass peer dependency resolution conflicts
- **Files modified:** package.json, package-lock.json
- **Verification:** Zod successfully installed and importable
- **Committed in:** 1fcb575 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking issues)
**Impact on plan:** Both fixes essential for task completion. No scope creep - resolved existing project configuration issues.

## Issues Encountered

None - plan executed smoothly after resolving blocking configuration issues.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for next phase:**
- Message schemas defined and validated for all initial WebSocket events
- TypeScript types automatically inferred from schemas for type-safe development
- Discriminated union pattern enables clean message routing implementation
- Foundation ready for connection manager and message router implementation

**No blockers or concerns:**
- Schemas are extensible - new message types can be added without breaking existing code
- Pattern is established for future message schema additions

---
*Phase: 01-websocket-infrastructure*
*Completed: 2026-01-18*
