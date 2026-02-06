---
phase: 13-deployment
plan: 01
subsystem: infra
tags: [docker, express, static-serving, cloud-run, deployment]

# Dependency graph
requires:
  - phase: 12-resilience-polish
    provides: Complete working application
provides:
  - Multi-stage Docker build for production deployment
  - Express API serving both WebSocket and frontend static files
  - Optimized build context for fast Docker builds
affects: [13-02, 13-03, 13-04]

# Tech tracking
tech-stack:
  added: [Dockerfile, .dockerignore, express.static]
  patterns:
    [multi-stage-build, static-file-serving, spa-fallback, container-networking]

key-files:
  created:
    - Dockerfile
    - .dockerignore
  modified:
    - apps/api/src/main.ts

key-decisions:
  - 'Use Node 20 Alpine base image for minimal footprint (~40MB base)'
  - 'Three-stage build: deps (all deps) → build (NX compile) → runtime (prod deps only)'
  - 'Static files served with 1-year cache, HTML with no-cache for SPA routing'
  - 'SPA fallback route after all API routes for client-side routing'
  - 'Server binds to 0.0.0.0 with dynamic PORT env var for container compatibility'

patterns-established:
  - 'Multi-stage Docker builds: separate dependency installation, building, and runtime'
  - 'Express static middleware: serve built frontend from API server'
  - 'Container best practices: non-root user, dynamic PORT, 0.0.0.0 binding'

# Metrics
duration: 5 min
completed: 2026-02-05
---

# Phase 13 Plan 01: Docker Multi-Stage Build Summary

**Single-container deployment with Express serving both WebSocket API and frontend static files, optimized for minimal image size (450MB)**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-05T20:16:05Z
- **Completed:** 2026-02-05T20:21:43Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Multi-stage Dockerfile builds both web and api apps using NX
- Production image excludes dev dependencies and runs as non-root user
- Docker build context optimized from 488MB to 692 bytes (99.9% reduction)
- Express API serves frontend static files with proper caching headers
- SPA routing fallback ensures all routes serve index.html
- Container binds to 0.0.0.0 and respects PORT env var for Cloud Run compatibility

## Task Commits

Each task was committed atomically:

1. **Task 1: Create multi-stage Dockerfile** - `a01add5` (feat)
2. **Task 2: Create .dockerignore for build optimization** - `fad5656` (feat)
3. **Task 3: Configure Express to serve frontend static files** - `97cc69b` (feat)

## Files Created/Modified

- `Dockerfile` - Three-stage build (deps, build, runtime) with Node 20 Alpine, non-root user, outputs to dist/api and dist/web
- `.dockerignore` - Comprehensive exclusions (node_modules, .nx, dist, git, IDE, tests, planning, designs)
- `apps/api/src/main.ts` - Static file serving middleware, SPA fallback route, 0.0.0.0 binding, PORT env var

## Decisions Made

**Multi-stage build pattern:**
Three stages separate dependency installation, application building, and production runtime. This keeps the final image minimal (450MB) by excluding dev dependencies and build tools.

**Static file serving strategy:**
Express serves built frontend via `express.static` middleware with aggressive caching (1 year) for assets but no-cache for HTML files. SPA fallback route (`app.get('*')`) ensures client-side routing works correctly.

**Container networking:**
Server binds to `0.0.0.0` instead of `localhost` to accept external connections in container environment. PORT env var defaults to 3333 locally but can be overridden (Cloud Run injects PORT=8080).

**Build context optimization:**
.dockerignore excludes unnecessary files (node_modules reinstalled in container, dist rebuilt, tests not needed in production). Reduced build context from 488MB to 692 bytes improves build speed.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## Next Phase Readiness

Ready for 13-02-PLAN.md (Terraform Cloud Run infrastructure).

Docker image builds successfully and serves both API and frontend. Container is production-ready for Cloud Run deployment.

---

_Phase: 13-deployment_
_Completed: 2026-02-05_
