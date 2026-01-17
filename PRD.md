# PRD: Nx Backend API Skeleton

## Introduction

Set up an Nx monorepo with a Node/TypeScript/Express backend API skeleton. The project will use a feature-based folder structure with WebSocket support. Each directory will contain a SUMMARY.md file describing its purpose for CLAUDE.md integration.

## Goals

- Create an Nx workspace with a single `api` application
- Establish a feature-based directory structure
- Configure Express with WebSocket support
- Set up environment configuration with dotenv
- Document each directory with SUMMARY.md files for AI context

## User Stories

### US-001: Initialize Nx Workspace
**Description:** As a developer, I want an Nx workspace initialized so that I have a monorepo foundation for the backend API.

**Acceptance Criteria:**
- [x] Nx workspace created with `apps/` and `libs/` directories
- [x] TypeScript configured as the default language
- [x] `package.json` exists with Nx dependencies
- [x] `nx.json` configured for the workspace
- [x] `tsconfig.base.json` exists at root
- [x] SUMMARY.md created at workspace root explaining the monorepo structure
- [x] Typecheck passes

### US-002: Create Express API Application
**Description:** As a developer, I want an Express application scaffolded in the Nx workspace so that I have a runnable server.

**Acceptance Criteria:**
- [x] `apps/api/` directory created
- [x] `apps/api/src/main.ts` entry point exists
- [x] Express server configured to start on port from environment
- [x] `apps/api/project.json` with build/serve targets
- [x] `apps/api/tsconfig.app.json` and `apps/api/tsconfig.json` exist
- [x] SUMMARY.md in `apps/api/` explaining the application
- [x] Typecheck passes

### US-003: Set Up Environment Configuration
**Description:** As a developer, I want environment variables loaded from a .env file so that I can configure the app without code changes.

**Acceptance Criteria:**
- [x] `dotenv` package installed
- [x] `.env.example` file at root with documented variables (PORT, NODE_ENV, WS_PORT)
- [x] `.env` added to `.gitignore`
- [x] `apps/api/src/config/` directory created with `index.ts` exporting typed config
- [x] Config loaded and validated at app startup
- [x] SUMMARY.md in `apps/api/src/config/` explaining configuration management
- [x] Typecheck passes

### US-004: Create Core Directory Structure
**Description:** As a developer, I want the feature-based directory structure created so that I have a consistent place for all code.

**Acceptance Criteria:**
- [x] `apps/api/src/features/` directory created (empty, for future features)
- [x] `apps/api/src/middleware/` directory created
- [x] `apps/api/src/routes/` directory created
- [x] `apps/api/src/utils/` directory created
- [x] `apps/api/src/types/` directory created
- [x] `apps/api/src/constants/` directory created
- [x] `apps/api/src/models/` directory created
- [x] `apps/api/src/services/` directory created
- [x] Each directory has a SUMMARY.md file describing its purpose
- [x] Typecheck passes

### US-005: Set Up Express App Structure
**Description:** As a developer, I want the Express app properly structured with middleware and route mounting so that I have a foundation to build on.

**Acceptance Criteria:**
- [x] `apps/api/src/app.ts` created with Express app configuration
- [x] JSON body parsing middleware configured
- [x] CORS middleware configured
- [x] Health check route at `GET /health` returns `{ status: 'ok' }`
- [x] Route mounting pattern established in `apps/api/src/routes/index.ts`
- [x] Error handling middleware in `apps/api/src/middleware/errorHandler.ts`
- [x] Request logging middleware in `apps/api/src/middleware/requestLogger.ts`
- [x] SUMMARY.md updated in middleware and routes directories
- [x] Typecheck passes

### US-006: Add WebSocket Support
**Description:** As a developer, I want WebSocket support integrated so that real-time communication is available.

**Acceptance Criteria:**
- [x] `ws` package installed with types
- [x] `apps/api/src/websocket/` directory created
- [x] WebSocket server initialization in `apps/api/src/websocket/index.ts`
- [x] WebSocket server attached to HTTP server in `main.ts`
- [x] Basic connection/disconnection logging implemented
- [x] SUMMARY.md in `apps/api/src/websocket/` explaining WebSocket setup
- [x] Typecheck passes

### US-007: Add Base Type Definitions
**Description:** As a developer, I want shared type definitions established so that I have type safety across the application.

**Acceptance Criteria:**
- [x] `apps/api/src/types/index.ts` with common types exported
- [x] `AppConfig` type defined for environment config
- [x] `ApiResponse<T>` generic type for standardized responses
- [x] `WebSocketMessage` type for WS communication
- [x] SUMMARY.md in types directory updated with type documentation approach
- [x] Typecheck passes

### US-008: Add Utility and Constants Foundations
**Description:** As a developer, I want utility functions and constants scaffolded so that I have a place for shared code.

**Acceptance Criteria:**
- [x] `apps/api/src/utils/index.ts` with placeholder export
- [x] `apps/api/src/constants/index.ts` with HTTP status codes and common constants
- [x] `apps/api/src/constants/httpStatus.ts` with status code constants
- [x] SUMMARY.md files updated in utils and constants directories
- [x] Typecheck passes

### US-009: Update Root CLAUDE.md
**Description:** As a developer, I want CLAUDE.md at the root to reference all SUMMARY.md files so that AI assistants understand the codebase structure.

**Acceptance Criteria:**
- [ ] `CLAUDE.md` updated with project overview
- [ ] Lists all SUMMARY.md file locations
- [ ] Describes the feature-based architecture pattern
- [ ] Documents how to run the development server
- [ ] Documents key npm scripts
- [ ] Typecheck passes

## Non-Goals

- No actual feature implementations (auth, users, etc.)
- No database setup or ORM configuration
- No testing framework setup
- No CI/CD configuration
- No Docker configuration
- No production deployment configuration
- No API documentation (Swagger/OpenAPI)

## Technical Considerations

- Use Nx 17+ with the `@nx/node` and `@nx/express` plugins
- TypeScript strict mode enabled
- ES modules preferred where possible
- Keep dependencies minimal for skeleton
- WebSocket server shares port with HTTP server (upgrade pattern) or uses separate port based on config
