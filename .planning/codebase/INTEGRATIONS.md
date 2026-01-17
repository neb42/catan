# External Integrations

**Analysis Date:** 2026-01-17

## APIs & External Services

**None detected.**

The codebase is a skeleton application with no external API integrations configured. All current functionality is self-contained between the web frontend and local API backend.

## Data Storage

**Databases:**
- None configured
- No ORM or database client installed

**File Storage:**
- Local filesystem only (no cloud storage integration)

**Caching:**
- Client-side: TanStack Query with 1-minute staleTime
  - Config: `apps/web/src/lib/queryClient.ts`
- Server-side: None configured

## Authentication & Identity

**Auth Provider:**
- None configured
- No authentication middleware or session management

**Implementation Path:**
- Middleware layer ready at `apps/api/src/middleware/`
- Would require adding auth package (e.g., passport, jwt)

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, DataDog, etc.)

**Logs:**
- Console logging only
- Request logger middleware: `apps/api/src/middleware/requestLogger.ts`
- WebSocket connection/disconnection logging: `apps/api/src/websocket/index.ts`

**Metrics:**
- None configured

## CI/CD & Deployment

**Hosting:**
- Not configured
- Web app: Vite build output suitable for static hosting
- API: Node.js application

**CI Pipeline:**
- None detected (no `.github/workflows`, no `Jenkinsfile`, etc.)

**Docker:**
- Not configured (no Dockerfile)

## Environment Configuration

**Required env vars:**
- `PORT` - API server port (default: 3000)
- `NODE_ENV` - Environment: development, production, test

**Optional env vars:**
- `WS_PORT` - Separate WebSocket port (defaults to sharing HTTP port)

**Env file locations:**
- `.env` - Root workspace (loaded by API)
- `.env.example` - Template with documentation

**Secrets location:**
- Environment variables only
- No secrets management service configured

## Internal API Communication

**Web to API:**
- HTTP fetch via custom client: `apps/web/src/lib/api.ts`
- Base URL: `http://localhost:3000` (hardcoded)
- JSON content type with error handling

```typescript
// Pattern: apps/web/src/lib/api.ts
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T>
```

**WebSocket:**
- Server: `apps/api/src/websocket/index.ts`
- Attaches to HTTP server via upgrade pattern
- Client ID tracking for connections
- No client-side WebSocket integration yet

## API Endpoints

**Current endpoints:**
- `GET /health` - Health check, returns `{ status: 'ok' }`

**API response format:**
```typescript
// Type: apps/api/src/types/index.ts
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, unknown>;
}
```

**WebSocket message format:**
```typescript
// Type: apps/api/src/types/index.ts
interface WebSocketMessage<T> {
  type: string;
  payload?: T;
  id?: string;
  timestamp?: string;
}
```

## Webhooks & Callbacks

**Incoming:**
- None configured

**Outgoing:**
- None configured

## CORS Configuration

**Current setup:**
- CORS enabled via `cors` middleware: `apps/api/src/app.ts`
- Default settings (all origins allowed)

**For production:**
- Configure specific allowed origins
- Set appropriate headers and methods

## Future Integration Points

**Recommended additions:**
- Database: PostgreSQL with Prisma or Drizzle ORM
- Authentication: Auth0, Clerk, or custom JWT
- Error tracking: Sentry
- Hosting: Vercel (web), Railway/Fly.io (API)
- CI/CD: GitHub Actions

**Existing hooks:**
- Middleware chain in `apps/api/src/app.ts`
- QueryClient provider in `apps/web/src/main.tsx`
- Feature directories ready at `apps/api/src/features/` and `apps/web/src/features/`

---

*Integration audit: 2026-01-17*
