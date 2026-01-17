# Catan Monorepo

This is an Nx monorepo containing a full-stack application with a Node.js/TypeScript/Express backend API and a React/Vite frontend.

## Project Overview

A feature-based full-stack application skeleton built with:
- **Nx** - Monorepo tooling for builds and task orchestration
- **TypeScript** - Type-safe development with strict mode

### Backend (apps/api)
- **Express 5.x** - HTTP server framework
- **WebSocket (ws)** - Real-time communication support

### Frontend (apps/web)
- **React 18** - UI library
- **Vite** - Fast build tool and dev server
- **Mantine v8** - UI component library with AppShell layout
- **TanStack Router** - Type-safe file-based routing
- **TanStack Query** - Data fetching and caching

## Directory Structure

The codebase follows a feature-based architecture. Each directory contains a SUMMARY.md file for AI context.

### SUMMARY.md Locations

#### Root
- `SUMMARY.md` - Root monorepo structure overview

#### API App (apps/api)
- `apps/api/SUMMARY.md` - API application overview
- `apps/api/src/config/SUMMARY.md` - Environment configuration
- `apps/api/src/constants/SUMMARY.md` - Application constants and HTTP status codes
- `apps/api/src/features/SUMMARY.md` - Feature modules (empty, for future use)
- `apps/api/src/middleware/SUMMARY.md` - Express middleware (error handling, logging)
- `apps/api/src/models/SUMMARY.md` - Data models
- `apps/api/src/routes/SUMMARY.md` - Route mounting and API endpoints
- `apps/api/src/services/SUMMARY.md` - Business logic services
- `apps/api/src/types/SUMMARY.md` - Shared TypeScript type definitions
- `apps/api/src/utils/SUMMARY.md` - Utility functions
- `apps/api/src/websocket/SUMMARY.md` - WebSocket server setup

#### Web App (apps/web)
- `apps/web/SUMMARY.md` - Web application overview
- `apps/web/src/components/SUMMARY.md` - React components (AppLayout, etc.)
- `apps/web/src/features/SUMMARY.md` - Feature modules (empty, for future use)
- `apps/web/src/hooks/SUMMARY.md` - Custom React hooks
- `apps/web/src/lib/SUMMARY.md` - Shared utilities (QueryClient, API helpers)
- `apps/web/src/routes/SUMMARY.md` - TanStack Router route definitions
- `apps/web/src/types/SUMMARY.md` - Shared TypeScript type definitions
- `apps/web/src/utils/SUMMARY.md` - Utility functions

### Key Directories

```
apps/
  api/                    # Express API application (port 3000)
    src/
      main.ts             # Entry point - starts HTTP and WebSocket servers
      app.ts              # Express app factory with middleware
      config/             # Environment configuration (dotenv)
      constants/          # HTTP status codes, app constants
      features/           # Feature modules (future)
      middleware/         # Express middleware (errorHandler, requestLogger)
      models/             # Data models (future)
      routes/             # Route definitions and mounting
      services/           # Business logic services (future)
      types/              # Shared TypeScript types (ApiResponse, WebSocketMessage)
      utils/              # Utility functions
      websocket/          # WebSocket server initialization

  web/                    # React/Vite frontend application (port 4200)
    src/
      main.tsx            # Entry point - renders React app with providers
      router.tsx          # TanStack Router configuration
      components/         # React components (AppLayout with Mantine AppShell)
      features/           # Feature modules (future)
      hooks/              # Custom React hooks
      lib/                # Shared utilities (QueryClient, API helpers)
      routes/             # TanStack Router route definitions
      types/              # Shared TypeScript types
      utils/              # Utility functions

libs/                     # Shared libraries (future)
```

## Development

### Running the Development Servers

For full functionality, both the API and web app should be running:

```bash
# Start the API server with hot reload (port 3000)
npx nx serve api

# Start the web app with hot reload (port 4200)
npx nx serve web

# Build projects
npx nx build api
npx nx build web
```

**Note:** The web app connects to the API at `http://localhost:3000`. Run both servers for the health check and API features to work.

### Key npm Scripts

```bash
# Run Nx targets
npx nx <target> <project>    # e.g., npx nx serve api, npx nx build api

# Typecheck the entire workspace
npx tsc --noEmit

# Typecheck just the API app
npx tsc --noEmit -p apps/api/tsconfig.app.json

# Typecheck just the web app
npx nx typecheck @catan/web
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

- `PORT` - HTTP server port (default: 3000)
- `NODE_ENV` - Environment: development, production, test (default: development)
- `WS_PORT` - WebSocket port (optional, shares HTTP port by default)

## Feature-Based Architecture

This codebase uses a feature-based architecture pattern:

1. **Features** are self-contained modules in `apps/api/src/features/`
2. **Shared code** lives in dedicated directories:
   - `types/` for shared TypeScript types
   - `utils/` for utility functions
   - `constants/` for app-wide constants
   - `middleware/` for Express middleware
3. **Each directory** has a SUMMARY.md explaining its purpose
4. **Libraries** in `libs/` can be created for code shared across multiple apps

## API Endpoints

- `GET /health` - Health check endpoint, returns `{ status: 'ok' }`

## WebSocket

The WebSocket server attaches to the same HTTP server using the upgrade pattern. Connection and disconnection events are logged with unique client IDs.
