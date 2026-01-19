<!-- 
SYNC IMPACT REPORT v1.0.0
========================
Version Change: None (Initial Constitution) → 1.0.0
Status: Initial publication - establishes foundational governance
Templates Updated:
  ✅ plan-template.md - verified "Constitution Check" section alignment
  ✅ spec-template.md - verified requirements structure
  ✅ tasks-template.md - verified phase organization matches principles
Date: 2026-01-19
-->

# Catan-SK Constitution

A full-stack board game implementation monorepo governed by principles of type safety, 
independent app testing, clear separation of concerns, and pragmatic feature delivery.

## Core Principles

### I. Full-Stack Monorepo Architecture

The codebase is organized as a single NX workspace containing two independently deployable 
applications: React web frontend (apps/web) and Node.js Express backend API (apps/api).

**Non-negotiable requirements:**
- All code lives in the `/apps` directory—no library packages outside this structure
- Frontend and backend share only: TypeScript configuration, ESLint/Prettier rules, NX tooling
- Each app must be independently buildable, testable, and deployable
- Path aliases (@web/*, @api/*) enable clear imports; cross-app imports forbidden

**Rationale**: Monorepo simplicity with explicit boundaries prevents "shared library creep" 
while maintaining team agility and rapid iteration.

### II. Type-Safe TypeScript Always

Every file written (source, tests, configuration) MUST be TypeScript. No JavaScript allowed.

**Non-negotiable requirements:**
- `tsconfig.base.json` enforces `strict: true`
- No `any` types except in test fixtures or vendor declarations
- All dependencies must have public type definitions (@types/* or built-in)
- Function signatures require explicit return types
- Break strict mode ONLY if justified in code review; document the exception

**Rationale**: Type safety catches 40% of potential runtime errors at compile time, 
reducing debugging cycles and enabling fearless refactoring.

### III. Test-First, Independent Verification

Features are developed TDD-style: write acceptance tests → watch them fail → implement → 
pass → refactor. Each user story must be independently testable without deploying the 
entire application.

**Non-negotiable requirements:**
- Contract tests (request/response validation) written before endpoints
- Integration tests verify cross-component flows within a single app
- Unit tests for business logic (services, utils)
- Tests marked [P] in tasks.md can run in parallel
- No feature completes without passing tests

**Rationale**: Test-first development documents requirements, reduces rework, and 
enables safe refactoring. Independent test isolation accelerates local development 
and unblocks parallel work.

### IV. Explicit Data Models & Validation

Schemas and data models are the contract between frontend and backend. Use Zod for 
runtime validation; TypeScript types ensure compile-time alignment.

**Non-negotiable requirements:**
- All API request/response payloads defined in Zod schemas
- Frontend forms backed by Zod validation
- Database models explicitly typed
- Breaking schema changes trigger MAJOR version bump
- API changelog documents all breaking changes

**Rationale**: Data contracts prevent silent failures, enable contract testing, and 
provide a single source of truth for API versioning.

### V. Feature Independence & MVP Slicing

Features are designed and implemented as independently deployable user stories. Each 
story (P1, P2, P3) delivers measurable value without requiring others to be complete.

**Non-negotiable requirements:**
- User stories must be prioritized (P1 = MVP, P2 = nice-to-have, P3 = future)
- P1 features deployable without P2/P3
- Stories organized in tasks.md as independent Phase phases
- Each story includes acceptance criteria and independent test strategy
- Documentation (spec.md, plan.md) tied to story priorities

**Rationale**: Incremental delivery enables earlier user feedback, reduces risk of 
scope creep, and allows parallel team work without integration chaos.

### VI. Pragmatic DevOps & Observability

The system logs structured data, exposes runtime errors clearly, and remains debuggable 
in production. No feature ships without understanding how it fails.

**Non-negotiable requirements:**
- Structured logging with context (userId, requestId, timestamp)
- Error responses include actionable error codes and messages
- WebSocket events logged at key points (connect, authenticate, disconnect)
- Environment configuration via .env files (secrets never committed)
- Build artifacts stored in `dist/` directory

**Rationale**: Production issues are debugged via logs; clear error messages reduce 
support burden and improve user experience.

## Development Workflow

### Phases & Checkpoints

1. **Setup (Phase 1)**: Project scaffolding, tooling, configuration
2. **Foundational (Phase 2)**: Database, authentication, core middleware — blocks all user stories
3. **User Stories (Phase 3+)**: Parallel implementation by priority (P1 → P2 → P3)
4. **Polish (Final Phase)**: Cross-cutting concerns, documentation, hardening

Each phase has an explicit checkpoint; stories can only proceed once the preceding 
phase is complete.

### Code Review & Merge Criteria

All PRs require:
- Passing TypeScript compilation (`npx tsc --noEmit`)
- Passing all tests (`npx nx test`)
- ESLint/Prettier compliance (`npx eslint .`, `npx prettier --check .`)
- Documentation updates if behavior changes
- Confirmation of constitution principle alignment

### Deployment Assumptions

- Frontend deployable independently of backend (API contract documented)
- Backend API versioning via endpoint prefix (v1/, v2/) or headers
- Breaking changes to shared schemas = MAJOR version bump
- Migrations scripted and reversible

## Governance

**Amendment Process**: Constitution changes require proposal, team discussion, and 
documented rationale. Version bumps follow semantic versioning:
- MAJOR: Principle removals or redefinitions (rare)
- MINOR: New principles or expanded guidance
- PATCH: Clarifications, wording fixes

**Compliance Verification**: Every feature spec (spec.md) and plan (plan.md) includes 
a "Constitution Check" section listing applicable principles and confirming alignment 
before implementation.

**Guidance Documents**: Runtime development guidance in `.specify/` templates; this 
constitution defines foundational governance. When they diverge, constitution wins.

**Version**: 1.0.0 | **Ratified**: 2026-01-19 | **Last Amended**: 2026-01-19
