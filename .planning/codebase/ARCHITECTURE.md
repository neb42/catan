# Architecture

**Analysis Date:** 2026-01-17

## Pattern Overview

**Overall:** Full-stack Monorepo with Client-Server Architecture

**Key Characteristics:**
- Nx-managed monorepo with apps and libs separation
- Express API backend with WebSocket support
- React SPA frontend with component-based UI
- Feature-based module organization (scaffolded for future use)
- Shared TypeScript configuration across projects

## Layers

**API Application (`apps/api`):**
- Purpose: HTTP REST API and WebSocket server for real-time communication
- Location: `apps/api/src/`
- Contains: Express server, routes, middleware, WebSocket handlers
- Depends on: Node.js, Express, ws library
- Used by: Web frontend via HTTP and WebSocket

**Web Application (`apps/web`):**
- Purpose: Single-page React application for user interface
- Location: `apps/web/src/`
- Contains: React components, routes, hooks, API client
- Depends on: React, Mantine, TanStack Router, TanStack Query
- Used by: End users via browser

**Shared Libraries (`libs/`):**
- Purpose: Code shared across multiple apps (future)
- Location: `libs/`
- Contains: Currently empty, reserved for shared types/utilities
- Depends on: Base TypeScript config
- Used by: Both apps when libraries are added

## Data Flow

**HTTP Request Flow (API):**

1. Request received at `apps/api/src/main.ts` HTTP server
2. Express middleware chain processes request (`requestLogger` -> `cors` -> `json` -> `urlencoded`)
3. Router in `apps/api/src/routes/index.ts` matches route
4. Route handler executes and returns response
5. On error, `errorHandler` middleware formats error response

**Frontend Data Fetching:**

1. React component calls `useQuery` hook from TanStack Query
2. Query function uses `apiFetch()` from `apps/web/src/lib/api.ts`
3. Fetch request sent to `http://localhost:3000` API
4. Response cached by QueryClient with 1-minute stale time
5. Component re-renders with data

**WebSocket Connection Flow:**

1. Client connects to WebSocket server (attached to HTTP server)
2. `apps/api/src/websocket/index.ts` handles connection event
3. Connection assigned unique ID and logged
4. Messages handled via `ws.on('message')` (to be implemented)
5. Disconnection logged with reason code

**State Management:**
- Server state: In-memory (no persistence layer yet)
- Client state: TanStack Query cache for server data
- UI state: React component local state and Mantine hooks

## Key Abstractions

**Express Application Factory:**
- Purpose: Creates configured Express app instance
- Examples: `apps/api/src/app.ts`
- Pattern: Factory function `createApp()` returns fully configured Application

**API Response Types:**
- Purpose: Standardize all API responses
- Examples: `apps/api/src/types/index.ts`
- Pattern: Generic `ApiResponse<T>` wrapper with success, data, error fields

**WebSocket Message Types:**
- Purpose: Standardize WebSocket communication
- Examples: `apps/api/src/types/index.ts`
- Pattern: Generic `WebSocketMessage<T>` with type, payload, id, timestamp

**React Query Client:**
- Purpose: Configure data fetching defaults
- Examples: `apps/web/src/lib/queryClient.ts`
- Pattern: Singleton QueryClient with retry and stale time settings

**API Fetch Wrapper:**
- Purpose: Centralize HTTP requests to backend
- Examples: `apps/web/src/lib/api.ts`
- Pattern: Generic `apiFetch<T>()` with base URL and error handling

## Entry Points

**API Server:**
- Location: `apps/api/src/main.ts`
- Triggers: `npx nx serve api` or production deploy
- Responsibilities: Creates HTTP server, attaches WebSocket, starts listening on port

**Web Application:**
- Location: `apps/web/src/main.tsx`
- Triggers: Browser loading `index.html`
- Responsibilities: Mounts React app with providers (QueryClient, Mantine, Router)

**Route Root:**
- Location: `apps/web/src/routes/__root.tsx`
- Triggers: TanStack Router initialization
- Responsibilities: Wraps all routes with AppLayout component

## Error Handling

**Strategy:** Centralized error middleware on API, try-catch with Error throwing on frontend

**Patterns:**
- API errors caught by `errorHandler` middleware in `apps/api/src/middleware/errorHandler.ts`
- Custom `AppError` interface extends Error with `statusCode` and `isOperational` fields
- Frontend `apiFetch()` throws Error on non-ok response
- React Query displays error state via `query.isError`

## Cross-Cutting Concerns

**Logging:**
- API: `requestLogger` middleware logs method, URL, status, duration
- API: Console.log for WebSocket events and errors
- Frontend: Browser console (no structured logging)

**Validation:**
- API: Environment validation in `apps/api/src/config/index.ts`
- Frontend: TypeScript compile-time type checking
- Runtime validation: Not implemented (future feature)

**Authentication:**
- Not implemented
- NavLink placeholders exist for "/games" and "/settings" routes

**CORS:**
- Enabled globally via `cors()` middleware
- Currently allows all origins (development mode)

---

*Architecture analysis: 2026-01-17*
