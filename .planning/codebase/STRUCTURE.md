# Codebase Structure

**Analysis Date:** 2026-01-17

## Directory Layout

```
catan/
├── apps/
│   ├── api/                    # Express backend API (port 3000)
│   │   ├── src/
│   │   │   ├── main.ts         # Server entry point
│   │   │   ├── app.ts          # Express app factory
│   │   │   ├── config/         # Environment configuration
│   │   │   ├── constants/      # HTTP status codes, app constants
│   │   │   ├── features/       # Feature modules (empty scaffold)
│   │   │   ├── middleware/     # Express middleware
│   │   │   ├── models/         # Data models (empty scaffold)
│   │   │   ├── routes/         # API route definitions
│   │   │   ├── services/       # Business logic (empty scaffold)
│   │   │   ├── types/          # TypeScript type definitions
│   │   │   ├── utils/          # Utility functions
│   │   │   └── websocket/      # WebSocket server setup
│   │   ├── project.json        # Nx project configuration
│   │   └── tsconfig.*.json     # TypeScript configs
│   └── web/                    # React frontend (port 4200)
│       ├── src/
│       │   ├── main.tsx        # React entry point
│       │   ├── router.tsx      # TanStack Router config
│       │   ├── components/     # React components
│       │   ├── features/       # Feature modules (empty scaffold)
│       │   ├── hooks/          # Custom React hooks
│       │   ├── lib/            # Shared utilities (QueryClient, API)
│       │   ├── routes/         # TanStack Router route files
│       │   ├── types/          # TypeScript type definitions
│       │   ├── utils/          # Utility functions
│       │   └── assets/         # Static assets
│       ├── index.html          # HTML template
│       ├── vite.config.mts     # Vite configuration
│       └── tsconfig.*.json     # TypeScript configs
├── libs/                       # Shared libraries (empty, for future)
├── .planning/                  # Planning and analysis documents
├── nx.json                     # Nx workspace configuration
├── tsconfig.base.json          # Base TypeScript config
├── package.json                # Root package dependencies
└── CLAUDE.md                   # AI assistant instructions
```

## Directory Purposes

**`apps/api/src/config/`:**
- Purpose: Environment variable loading and validation
- Contains: Config object with port, nodeEnv, wsPort
- Key files: `apps/api/src/config/index.ts`

**`apps/api/src/constants/`:**
- Purpose: Application-wide constants
- Contains: HTTP status codes, error messages, timing constants
- Key files: `apps/api/src/constants/index.ts`, `apps/api/src/constants/httpStatus.ts`

**`apps/api/src/features/`:**
- Purpose: Self-contained feature modules (future)
- Contains: Empty scaffold for feature-based architecture
- Key files: None yet

**`apps/api/src/middleware/`:**
- Purpose: Express request/response middleware
- Contains: Error handling, request logging
- Key files: `apps/api/src/middleware/errorHandler.ts`, `apps/api/src/middleware/requestLogger.ts`

**`apps/api/src/routes/`:**
- Purpose: API endpoint definitions and routing
- Contains: Router with route handlers
- Key files: `apps/api/src/routes/index.ts`

**`apps/api/src/types/`:**
- Purpose: Shared TypeScript type definitions
- Contains: ApiResponse, WebSocketMessage interfaces
- Key files: `apps/api/src/types/index.ts`

**`apps/api/src/websocket/`:**
- Purpose: WebSocket server initialization and handlers
- Contains: Server setup, connection management
- Key files: `apps/api/src/websocket/index.ts`

**`apps/web/src/components/`:**
- Purpose: Reusable React components
- Contains: AppLayout with Mantine AppShell
- Key files: `apps/web/src/components/AppLayout.tsx`

**`apps/web/src/lib/`:**
- Purpose: Shared utilities and configuration
- Contains: QueryClient, API fetch wrapper
- Key files: `apps/web/src/lib/queryClient.ts`, `apps/web/src/lib/api.ts`

**`apps/web/src/routes/`:**
- Purpose: TanStack Router route definitions
- Contains: Root route, index (home) route
- Key files: `apps/web/src/routes/__root.tsx`, `apps/web/src/routes/index.tsx`

## Key File Locations

**Entry Points:**
- `apps/api/src/main.ts`: API server startup
- `apps/web/src/main.tsx`: React app bootstrap

**Configuration:**
- `apps/api/src/config/index.ts`: Runtime environment config
- `apps/web/src/lib/queryClient.ts`: TanStack Query config
- `apps/web/vite.config.mts`: Frontend build config
- `nx.json`: Monorepo task configuration
- `tsconfig.base.json`: Shared TypeScript settings

**Core Logic:**
- `apps/api/src/app.ts`: Express application factory
- `apps/api/src/routes/index.ts`: Route definitions
- `apps/api/src/websocket/index.ts`: WebSocket server
- `apps/web/src/router.tsx`: Frontend routing setup

**Testing:**
- No test files currently exist
- Nx supports `*.spec.ts` and `*.test.ts` patterns

## Naming Conventions

**Files:**
- `camelCase.ts` for TypeScript modules: `requestLogger.ts`, `errorHandler.ts`
- `PascalCase.tsx` for React components: `AppLayout.tsx`
- `index.ts` for directory barrel exports
- `__root.tsx` for TanStack Router root route

**Directories:**
- `lowercase` for all directories: `middleware/`, `routes/`, `components/`
- Plural form for collections: `routes/`, `components/`, `types/`
- Singular for concepts: `config/`, `websocket/`

## Where to Add New Code

**New API Feature:**
- Primary code: `apps/api/src/features/{feature-name}/`
- Routes: `apps/api/src/routes/{feature-name}.ts` (then import in `index.ts`)
- Types: `apps/api/src/types/{feature-name}.ts` or extend `index.ts`
- Tests: `apps/api/src/features/{feature-name}/*.spec.ts`

**New Frontend Feature:**
- Primary code: `apps/web/src/features/{feature-name}/`
- Routes: `apps/web/src/routes/{route-path}.tsx`
- Tests: `apps/web/src/features/{feature-name}/*.test.tsx`

**New React Component:**
- Implementation: `apps/web/src/components/{ComponentName}.tsx`
- Shared/feature: `apps/web/src/features/{feature}/components/`

**New Page Route:**
- File: `apps/web/src/routes/{path}.tsx` (e.g., `games.tsx` for `/games`)
- Register in: `apps/web/src/router.tsx` routeTree

**New API Middleware:**
- Implementation: `apps/api/src/middleware/{middlewareName}.ts`
- Register in: `apps/api/src/app.ts` middleware chain

**Utilities:**
- API helpers: `apps/api/src/utils/`
- Web helpers: `apps/web/src/lib/` (shared) or `apps/web/src/utils/` (general)

**Shared Libraries:**
- Create in: `libs/{lib-name}/`
- Import with: `@catan/{lib-name}` (configure in tsconfig paths)

## Special Directories

**`.planning/`:**
- Purpose: GSD planning and codebase analysis documents
- Generated: Yes (by GSD commands)
- Committed: User discretion

**`dist/`:**
- Purpose: Build output directory
- Generated: Yes (by nx build)
- Committed: No (gitignored)

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes (by yarn install)
- Committed: No (gitignored)

**`.nx/`:**
- Purpose: Nx cache and internal state
- Generated: Yes (by Nx)
- Committed: No (gitignored)

**`SUMMARY.md` Files:**
- Purpose: AI context for each directory
- Generated: Manually created
- Committed: Yes
- Locations: Every significant directory has one

---

*Structure analysis: 2026-01-17*
