# Technology Stack

**Analysis Date:** 2026-01-17

## Languages

**Primary:**
- TypeScript 5.9.2 - Used throughout both API and web applications with strict mode enabled

**Secondary:**
- JavaScript (JSX/TSX) - React components in web app

## Runtime

**Environment:**
- Node.js 22.x (v22.19.0 detected)

**Package Manager:**
- Yarn (workspaces enabled)
- Lockfile: `yarn.lock` present at root

## Frameworks

**Core:**
- Express 5.2.1 - Backend HTTP server framework (`apps/api/`)
- React 19.0.0 - Frontend UI library (`apps/web/`)
- Mantine 8.3.12 - UI component library with AppShell layout

**Routing:**
- TanStack Router 1.151.0 - Type-safe file-based routing for React

**Data Fetching:**
- TanStack Query 5.90.18 - Server state management and caching

**Real-time:**
- ws 8.19.0 - WebSocket server for real-time communication

**Build/Dev:**
- Nx 22.3.3 - Monorepo tooling, task orchestration, caching
- Vite 7.0.0 - Frontend dev server and bundler
- SWC 1.5.7 - TypeScript/JavaScript transpilation (API build)
- Vitest 4.0.0 - Testing framework (available, not fully configured)

## Key Dependencies

**Critical:**
- `@mantine/core` ^8.3.12 - UI components (AppShell, Burger, NavLink, Alert, etc.)
- `@mantine/hooks` ^8.3.12 - React hooks (useDisclosure, etc.)
- `@tanstack/react-query` ^5.90.18 - Data fetching, caching, loading states
- `@tanstack/react-router` ^1.151.0 - Type-safe routing with route trees
- `express` ^5.2.1 - HTTP server with async middleware support
- `ws` ^8.19.0 - WebSocket server implementation

**Infrastructure:**
- `dotenv` ^17.2.3 - Environment variable loading
- `cors` ^2.8.5 - Cross-origin request handling
- `tslib` ^2.3.0 - TypeScript runtime helpers

**Dev Dependencies:**
- `@nx/js` 22.3.3 - JavaScript/TypeScript Nx plugin
- `@nx/node` ^22.3.3 - Node.js application support
- `@nx/react` 22.3.3 - React application support
- `@nx/vite` 22.3.3 - Vite integration for Nx
- `@vitejs/plugin-react` ^4.2.0 - React plugin for Vite
- `prettier` ~3.6.2 - Code formatting

## Configuration

**TypeScript:**
- Root config: `tsconfig.base.json` - ES2022 target, strict mode, nodenext modules
- API config: `apps/api/tsconfig.app.json` - CommonJS output, esModuleInterop
- Web config: `apps/web/tsconfig.app.json` - ESNext modules, bundler resolution, JSX

**Environment:**
- `.env` file at workspace root (loaded via dotenv)
- `.env.example` provides template
- Required variables:
  - `PORT` - HTTP server port (default: 3000)
  - `NODE_ENV` - Environment mode: development, production, test
  - `WS_PORT` - Optional separate WebSocket port

**Nx Configuration:**
- `nx.json` - Workspace configuration
- `apps/api/project.json` - API build/serve targets
- Plugins: `@nx/js/typescript`, `@nx/vite/plugin`

**Build:**
- API: SWC compiler via `@nx/js:swc` executor
  - Config: `apps/api/.swcrc`
  - Output: CommonJS format
  - Target: ES2022
- Web: Vite bundler
  - Config: `apps/web/vite.config.mts`
  - Dev port: 4200

**Formatting:**
- Prettier config: `.prettierrc`
- Settings: `singleQuote: true`

## Platform Requirements

**Development:**
- Node.js 22.x
- Yarn (with workspaces)
- Both API (port 3000) and web (port 4200) servers for full functionality

**Production:**
- Node.js 22.x runtime for API
- Static hosting for web app (Vite build output)
- WebSocket support (shares HTTP port via upgrade)

## Monorepo Structure

**Workspaces:**
- `apps/*` - Application projects (api, web)
- `libs/*` - Shared libraries (future)

**Nx Targets:**
- `serve` - Development server with hot reload
- `build` - Production build
- `typecheck` - TypeScript type checking

---

*Stack analysis: 2026-01-17*
