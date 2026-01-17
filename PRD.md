# PRD: Nx Frontend App Skeleton

## Introduction

Set up an Nx frontend application in the existing monorepo using React, Vite, TypeScript, TanStack Router, TanStack Query, and Mantine UI. The app will include a complete AppShell layout with header, navbar, footer, and main content area. Each directory will contain a SUMMARY.md file describing its purpose for CLAUDE.md integration.

## Goals

- Create a new `web` application in the existing Nx workspace alongside the `api` app
- Configure Vite as the build tool with React and TypeScript
- Set up Mantine UI with AppShell (header, navbar, footer, main content)
- Configure TanStack Router with a single home page route
- Configure TanStack Query connected to the existing API at `localhost:3000`
- Document each directory with SUMMARY.md files for AI context

## User Stories

### US-001: Create Nx React/Vite Application
**Description:** As a developer, I want a React application scaffolded in the Nx workspace so that I have a runnable frontend.

**Acceptance Criteria:**
- [x] `apps/web/` directory created using `nx generate @nx/react:application`
- [x] Vite configured as the bundler (not webpack)
- [x] `apps/web/src/main.tsx` entry point exists
- [x] `apps/web/project.json` with build/serve targets
- [x] `apps/web/tsconfig.json` and `apps/web/tsconfig.app.json` exist
- [x] `apps/web/index.html` exists
- [x] App runs with `npx nx serve web` (displays default React page)
- [x] SUMMARY.md in `apps/web/` explaining the application
- [x] Typecheck passes

### US-002: Install and Configure Mantine
**Description:** As a developer, I want Mantine UI library configured so that I can use its components.

**Acceptance Criteria:**
- [x] `@mantine/core` and `@mantine/hooks` packages installed
- [x] `@mantine/core/styles.css` imported in main.tsx
- [x] `MantineProvider` wrapping the app in main.tsx
- [x] Mantine color scheme set to auto (respects system preference)
- [x] Typecheck passes
- [x] Verify Mantine is working by running the app

### US-003: Install and Configure TanStack Router
**Description:** As a developer, I want TanStack Router configured so that I have type-safe routing.

**Acceptance Criteria:**
- [x] `@tanstack/react-router` package installed
- [x] `apps/web/src/routes/` directory created
- [x] Root route file created at `apps/web/src/routes/__root.tsx`
- [x] Index route file created at `apps/web/src/routes/index.tsx` (home page)
- [x] Router instance created and configured in `apps/web/src/router.tsx`
- [x] Router integrated in main.tsx with `RouterProvider`
- [x] SUMMARY.md in `apps/web/src/routes/` explaining routing
- [x] Typecheck passes
- [x] Verify routing works by running the app

### US-004: Install and Configure TanStack Query
**Description:** As a developer, I want TanStack Query configured and connected to the API so that I can fetch data.

**Acceptance Criteria:**
- [x] `@tanstack/react-query` package installed
- [x] `QueryClient` created with sensible defaults in `apps/web/src/lib/queryClient.ts`
- [x] `QueryClientProvider` wrapping the app in main.tsx
- [x] API base URL configured as `http://localhost:3000` in `apps/web/src/lib/api.ts`
- [x] Helper fetch function exported for use with queries
- [x] `apps/web/src/lib/` directory has SUMMARY.md
- [x] Typecheck passes

### US-005: Create AppShell Layout Component
**Description:** As a developer, I want a Mantine AppShell layout so that the app has consistent navigation structure.

**Acceptance Criteria:**
- [x] `apps/web/src/components/` directory created
- [x] `apps/web/src/components/AppLayout.tsx` created with Mantine AppShell
- [x] AppShell includes Header with app title "Catan"
- [x] AppShell includes Navbar (left side) with placeholder navigation links
- [x] AppShell includes Footer with copyright text
- [x] AppShell includes Main content area that renders children/outlet
- [x] Navbar is collapsible on mobile (burger menu in header)
- [x] SUMMARY.md in `apps/web/src/components/` explaining components
- [x] Typecheck passes

### US-006: Integrate AppShell with Router
**Description:** As a developer, I want the AppShell integrated with the router so that all pages use the layout.

**Acceptance Criteria:**
- [ ] Root route (`__root.tsx`) renders AppLayout component
- [ ] AppLayout renders `<Outlet />` in main content area
- [ ] Home page route displays welcome content inside the layout
- [ ] Home page includes a TanStack Query call to `/health` endpoint to verify API connection
- [ ] Health status displayed on home page (shows "API Connected" or error)
- [ ] Typecheck passes
- [ ] Verify changes work in browser (layout visible, health check works)

### US-007: Create Directory Structure with SUMMARY.md Files
**Description:** As a developer, I want all directories documented with SUMMARY.md files so that AI assistants understand the codebase.

**Acceptance Criteria:**
- [ ] `apps/web/src/hooks/` directory created with SUMMARY.md (for custom hooks)
- [ ] `apps/web/src/types/` directory created with SUMMARY.md (for TypeScript types)
- [ ] `apps/web/src/utils/` directory created with SUMMARY.md (for utility functions)
- [ ] `apps/web/src/features/` directory created with SUMMARY.md (for feature modules)
- [ ] Each SUMMARY.md describes the directory's purpose and what code belongs there
- [ ] Typecheck passes

### US-008: Update Root CLAUDE.md
**Description:** As a developer, I want CLAUDE.md updated to include the web app so that AI assistants understand the full monorepo.

**Acceptance Criteria:**
- [ ] CLAUDE.md updated with web app overview
- [ ] Lists all new SUMMARY.md file locations for web app
- [ ] Documents how to run the web development server (`npx nx serve web`)
- [ ] Documents that web app connects to API at localhost:3000
- [ ] Notes that both apps should be running for full functionality
- [ ] Typecheck passes

## Non-Goals

- No actual feature implementations (auth, game logic, etc.)
- No additional pages beyond home
- No state management beyond TanStack Query
- No testing framework setup
- No CI/CD configuration
- No production build optimization
- No environment variable configuration (hardcoded localhost:3000 is fine)

## Technical Considerations

- Use Nx 17+ with `@nx/react` and `@nx/vite` plugins
- TanStack Router uses file-based routing convention
- Mantine v7+ requires explicit CSS import
- AppShell responsive behavior built into Mantine component
- Keep dependencies minimal for skeleton
- Web app will run on different port than API (Vite default is 5173 or 4200)
