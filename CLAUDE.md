# Catan Backend API

This is an Nx monorepo containing a Node.js/TypeScript/Express backend API with WebSocket support.

## Project Overview

A feature-based backend API skeleton built with:
- **Nx** - Monorepo tooling for builds and task orchestration
- **Express 5.x** - HTTP server framework
- **WebSocket (ws)** - Real-time communication support
- **TypeScript** - Type-safe development with strict mode

## Directory Structure

The codebase follows a feature-based architecture. Each directory contains a SUMMARY.md file for AI context.

### SUMMARY.md Locations

- `SUMMARY.md` - Root monorepo structure overview
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

### Key Directories

```
apps/
  api/                    # Main Express API application
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

libs/                     # Shared libraries (future)
```

## Development

### Running the Development Server

```bash
# Start the API server with hot reload
npx nx serve api

# Build the API
npx nx build api
```

### Key npm Scripts

```bash
# Run Nx targets
npx nx <target> <project>    # e.g., npx nx serve api, npx nx build api

# Typecheck the entire workspace
npx tsc --noEmit

# Typecheck just the API app
npx tsc --noEmit -p apps/api/tsconfig.app.json
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
