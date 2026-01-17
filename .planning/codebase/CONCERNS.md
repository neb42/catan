# Codebase Concerns

**Analysis Date:** 2026-01-17

## Tech Debt

**Empty Feature Directories:**
- Issue: Feature directories exist but contain only SUMMARY.md files with no implementation
- Files: `apps/api/src/features/`, `apps/web/src/features/`
- Impact: Placeholder directories that don't yet serve their intended purpose; feature-based architecture not yet utilized
- Fix approach: Implement actual features or remove directories until needed

**Empty libs/ Directory:**
- Issue: Shared libraries directory is empty, no cross-app code sharing
- Files: `libs/`
- Impact: Type definitions duplicated between apps (both have `types/` directories); potential for drift
- Fix approach: Create shared library for common types like `ApiResponse`, `WebSocketMessage` when features require it

**Hardcoded API Base URL:**
- Issue: Frontend API URL is hardcoded to `http://localhost:3000`
- Files: `apps/web/src/lib/api.ts:1`
- Impact: Cannot deploy to different environments without code changes
- Fix approach: Use environment variable via Vite's `import.meta.env.VITE_API_URL` pattern

**Console-Based Logging Throughout:**
- Issue: All logging uses raw `console.log`/`console.error` without structured logging
- Files: `apps/api/src/main.ts:13`, `apps/api/src/websocket/index.ts:19,22,41,44,48,53,79`, `apps/api/src/middleware/requestLogger.ts:12`, `apps/api/src/middleware/errorHandler.ts:17`
- Impact: No log levels, no structured output, difficult to parse in production, no log rotation
- Fix approach: Introduce a logging library (pino, winston) with structured JSON output and configurable levels

**No Test Files:**
- Issue: Zero test files exist in the application code
- Files: `apps/api/`, `apps/web/`
- Impact: No confidence in correctness; refactoring is risky; regression bugs likely
- Fix approach: Set up Vitest (already in devDependencies), add tests incrementally starting with API routes and critical utilities

## Security Considerations

**No Security Middleware:**
- Risk: Missing helmet, rate limiting, and CORS origin restrictions
- Files: `apps/api/src/app.ts:14`
- Current mitigation: CORS is enabled but allows all origins (`app.use(cors())`)
- Recommendations:
  - Add `helmet` for security headers (XSS protection, content security policy)
  - Add rate limiting middleware to prevent abuse
  - Configure CORS with specific allowed origins

**No Input Validation:**
- Risk: API endpoints accept unvalidated input; potential for injection or malformed data
- Files: `apps/api/src/routes/index.ts` (health endpoint has no inputs, but future routes need this)
- Current mitigation: None
- Recommendations: Add Zod or similar schema validation for all request bodies and query parameters

**WebSocket Has No Authentication:**
- Risk: Any client can connect to WebSocket without authentication
- Files: `apps/api/src/websocket/index.ts`
- Current mitigation: None
- Recommendations: Implement connection authentication via token/cookie validation in the upgrade handler

**Error Handler Exposes Stack Traces:**
- Risk: In production, error stack traces could leak implementation details
- Files: `apps/api/src/middleware/errorHandler.ts:17`
- Current mitigation: None (always logs stack, always returns message)
- Recommendations: Only log stack traces in development; return generic messages in production

## Performance Bottlenecks

**WebSocket Connection Counter Not Unique:**
- Problem: `connectionCount` resets on server restart, causing ID collisions in logs
- Files: `apps/api/src/websocket/index.ts:36`
- Cause: Counter is local variable initialized to 0 on each `setupConnectionHandlers` call
- Improvement path: Use UUID for connection IDs or persist counter

**No Response Caching:**
- Problem: No HTTP caching headers on API responses
- Files: `apps/api/src/routes/index.ts`
- Cause: Not implemented
- Improvement path: Add `Cache-Control` headers for appropriate endpoints

## Fragile Areas

**Manual Route Registration:**
- Files: `apps/web/src/router.tsx`
- Why fragile: Routes must be manually imported and added to route tree
- Safe modification: Always add both the route file and the import/registration
- Test coverage: None

**Global WebSocket Instance:**
- Files: `apps/api/src/websocket/index.ts:5`
- Why fragile: Module-level `let wss` variable; singleton pattern with no cleanup guarantees
- Safe modification: Always check `getWebSocketServer()` result for null; use `closeWebSocket()` in shutdown
- Test coverage: None

## Scaling Limits

**Single Process Architecture:**
- Current capacity: Single Node.js process
- Limit: CPU-bound or memory-bound with one core
- Scaling path: Add PM2 cluster mode or container orchestration; WebSocket state would need Redis adapter

## Dependencies at Risk

**None Identified:**
- All dependencies are well-maintained and current
- Express 5.x, React 19, Mantine 8, TanStack Query 5 are all recent major versions

## Missing Critical Features

**No Authentication/Authorization:**
- Problem: No user identity management
- Blocks: Any feature requiring user-specific data, game ownership, multiplayer with persistent state

**No Database:**
- Problem: No persistence layer configured
- Blocks: Storing games, users, or any application state

**No Error Boundary:**
- Problem: React app has no error boundary for graceful error handling
- Files: `apps/web/src/main.tsx`
- Blocks: Production-ready error recovery

**Dead Navigation Links:**
- Problem: NavLinks in AppLayout point to routes that don't exist
- Files: `apps/web/src/components/AppLayout.tsx:34-35`
- Impact: Clicking "Games" or "Settings" will fail with no matching route

## Test Coverage Gaps

**100% Gap - No Tests Exist:**
- What's not tested: Everything
- Files: All of `apps/api/src/`, `apps/web/src/`
- Risk: Any change could introduce undetected regressions
- Priority: High - establish testing patterns before adding features

**Critical Paths to Test First:**
- API health endpoint: `apps/api/src/routes/index.ts`
- Error handler middleware: `apps/api/src/middleware/errorHandler.ts`
- Config validation: `apps/api/src/config/index.ts`
- API fetch utility: `apps/web/src/lib/api.ts`

---

*Concerns audit: 2026-01-17*
