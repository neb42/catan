# Catan-SK Architecture

## Overall Pattern

**NX Monorepo** with a **React Web Frontend** + **Express API Backend** architecture.

This is a full-stack TypeScript monorepo for implementing the Catan board game, using NX for workspace management, build orchestration, and code sharing.

```
┌─────────────────────────────────────────────────────────────────┐
│                         NX Workspace                            │
├──────────────────────────┬──────────────────────────────────────┤
│      Frontend (web)      │           Backend (api)              │
│      React + Vite        │         Express + WebSocket          │
│      Port: 4200          │           Port: 3333                 │
└──────────────────────────┴──────────────────────────────────────┘
```

## Key Characteristics

| Aspect | Description |
|--------|-------------|
| **Monorepo Tool** | NX 22.x with plugin-based architecture |
| **Language** | TypeScript (strict mode) across all apps |
| **Build System** | Vite (web), Webpack (api) |
| **Package Manager** | npm |
| **Testing** | Playwright (web E2E), Jest (API E2E), Vitest (unit) |
| **Code Quality** | ESLint + Prettier integration |

## Architectural Layers

### 1. Presentation Layer (apps/web)
- **Technology**: React 19, Vite 7, Mantine UI 8
- **State Management**: Zustand (client), TanStack Query (server)
- **Routing**: React Router DOM (with TanStack Router available)
- **Validation**: Zod for schema validation
- **Responsibility**: 
  - Render game UI and components
  - Handle user interactions
  - Manage client-side state
  - Communicate with backend via HTTP/WebSocket

### 2. API Layer (apps/api)
- **Technology**: Express 4, Node.js
- **Real-time**: WebSocket (ws library)
- **Validation**: Zod for request/response schemas
- **Responsibility**:
  - Serve REST API endpoints
  - Handle WebSocket connections for real-time game state
  - Process game logic
  - Static asset serving

### 3. Shared Configuration Layer
- **tsconfig.base.json**: Shared TypeScript settings with path aliases
- **nx.json**: NX plugins and generator defaults
- **.eslintrc.json / .prettierrc**: Unified code style

## Data Flow

### HTTP Request Flow
```
┌────────────┐     HTTP GET/POST      ┌────────────┐
│   React    │ ───────────────────────▶│  Express   │
│    App     │                         │    API     │
│ (web:4200) │ ◀───────────────────────│ (api:3333) │
└────────────┘     JSON Response       └────────────┘
```

### WebSocket Flow (Real-time)
```
┌────────────┐     WS Connection       ┌────────────┐
│   React    │ ═══════════════════════▶│  Express   │
│    App     │ ◀═══════════════════════│    API     │
│            │   Bi-directional Msgs   │            │
└────────────┘                         └────────────┘
```

### Current API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api` | Health check / welcome message |
| GET | `/assets/*` | Static asset serving |

## Key Abstractions

### Path Aliases
Configured in `tsconfig.base.json`:
- `@web/*` → `apps/web/src/*`
- `@api/*` → `apps/api/src/*`

### NX Plugins (Inferred Targets)
From `nx.json`, these plugins auto-configure build targets:
- `@nx/vite/plugin` - Vite build/serve/test for web
- `@nx/webpack/plugin` - Webpack build/serve for api
- `@nx/playwright/plugin` - E2E testing for web

### Project Types
- `application` - Deployable apps (web, api)
- Implicit dependencies link E2E projects to their apps

## Entry Points

### Web Application
| File | Purpose |
|------|---------|
| `apps/web/index.html` | HTML entry, loads main.tsx |
| `apps/web/src/main.tsx` | React root render with BrowserRouter |
| `apps/web/src/app/app.tsx` | Root component with routing |

### API Application
| File | Purpose |
|------|---------|
| `apps/api/src/main.ts` | Express server initialization |

### E2E Tests
| File | Purpose |
|------|---------|
| `apps/web-e2e/src/example.spec.ts` | Playwright web tests |
| `apps/api-e2e/src/api/api.spec.ts` | Jest API tests |

## Error Handling Patterns

### API Layer
- Express error handler via `server.on('error', console.error)`
- Standard Express middleware chain (not yet customized)

### E2E Test Layer
- Global setup/teardown in `api-e2e/src/support/`
  - `global-setup.ts` - Waits for port availability before tests
  - `global-teardown.ts` - Kills port after tests
  - `test-setup.ts` - Configures axios base URL

### Build Layer
- TypeScript strict mode catches type errors at compile time
- ESLint + Prettier enforce code quality

## Configuration Files

### Build Configuration
| File | Purpose |
|------|---------|
| `apps/web/vite.config.mts` | Vite bundler config for React |
| `apps/api/webpack.config.js` | Webpack config for Node.js |
| `tsconfig.base.json` | Shared TS compiler options |

### Testing Configuration
| File | Purpose |
|------|---------|
| `apps/web-e2e/playwright.config.ts` | Playwright browser testing |
| `apps/api-e2e/jest.config.cts` | Jest API testing |

### NX Configuration
| File | Purpose |
|------|---------|
| `nx.json` | Workspace plugins and generator defaults |
| `apps/*/project.json` | Per-project targets and metadata |

## Development Workflow

```
npm install                 # Install dependencies
npx nx serve web           # Start frontend (localhost:4200)
npx nx serve api           # Start backend (localhost:3333)
npx nx build <project>     # Production build
npx nx e2e <project>-e2e   # Run E2E tests
npx nx graph               # Visualize dependencies
```

## Future Architecture Considerations

Based on dependencies in `package.json`, the following are available but not yet fully implemented:
- **TanStack Router** - File-based routing alternative
- **TanStack Query** - Server state caching
- **Mantine Core/Forms/Hooks** - UI component library
- **Zustand** - Client state management
- **WebSocket (ws)** - Real-time game state sync
