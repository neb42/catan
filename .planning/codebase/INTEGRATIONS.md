# External Integrations

## Current Status

This is a **freshly scaffolded** NX monorepo with minimal boilerplate. Most integrations are **not yet implemented** but the dependencies are installed and ready for use.

---

## WebSocket

### Configuration
| Property | Value |
|----------|-------|
| Package | `ws` ^8.19.0 |
| Status | **Dependency installed, not yet implemented** |
| Type | Server-side WebSocket |

### Notes
- The `ws` package is listed in dependencies
- No WebSocket server implementation found in `apps/api/src/main.ts`
- Intended for real-time game communication (per README)

### Planned Usage
- Real-time game state synchronization
- Player action broadcasting
- Game room management

---

## External APIs

### Status: **None configured**

No external API integrations detected in the codebase.

---

## Databases

### Status: **None configured**

No database dependencies or configurations found:
- No Prisma
- No TypeORM
- No MongoDB driver
- No PostgreSQL client
- No Redis client
- No SQLite

### Notes
- May need to add database for game state persistence
- Consider: PostgreSQL, MongoDB, or Redis for real-time game data

---

## Authentication

### Status: **None configured**

No authentication libraries detected:
- No JWT packages
- No Passport.js
- No OAuth libraries
- No session management

### Notes
- Will likely need authentication for multiplayer features
- Consider: JWT for stateless auth, or session-based for game state

---

## Third-Party Services

### Status: **None configured**

No third-party service integrations found:
- No analytics (Google Analytics, Mixpanel, etc.)
- No error tracking (Sentry, LogRocket, etc.)
- No payment processing
- No email services
- No cloud storage

---

## Internal API Communication

### Current Implementation

The web app does not yet have API integration configured. However, the infrastructure is ready:

| Frontend Tool | Package | Version | Status |
|---------------|---------|---------|--------|
| HTTP Client | Axios | ^1.6.0 | Installed |
| Server State | TanStack Query | ^5.90.19 | Installed |

### API Endpoints (Currently Available)

| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/api` | `{ message: 'Welcome to api!' }` |

### E2E Test Setup

The API E2E tests use Axios with base URL configuration:
- Host: `localhost`
- Port: `3333`
- Base URL: `http://localhost:3333`

---

## Environment Variables

### Status: **None configured**

No `.env` files found. Environment variables in use:

| Variable | Location | Purpose |
|----------|----------|---------|
| `PORT` | `apps/api/src/main.ts` | API server port (default: 3333) |
| `BASE_URL` | `apps/web-e2e/playwright.config.ts` | E2E test base URL |
| `HOST` | `apps/api-e2e/src/support/test-setup.ts` | API test host |

---

## Integration Readiness

### Installed but Unused

These packages are installed and ready for integration:

| Package | Purpose | Implementation Status |
|---------|---------|----------------------|
| `ws` | WebSocket server | Not implemented |
| `axios` | HTTP client | Not implemented in web app |
| `@tanstack/react-query` | Server state | Not implemented |
| `@tanstack/react-router` | Routing | Installed, using react-router-dom instead |
| `zod` | Validation | Not implemented |
| `zustand` | State management | Not implemented |
| `@mantine/*` | UI components | Not implemented |

---

## Recommended Next Steps

1. **WebSocket Setup**: Implement WebSocket server in API for real-time game updates
2. **API Routes**: Add game-related endpoints (create game, join game, make move)
3. **Database**: Choose and configure database for game state persistence
4. **Authentication**: Add player authentication for multiplayer support
5. **Environment Config**: Create `.env` files for configuration management
