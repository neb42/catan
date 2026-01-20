# Codebase Concerns

Technical debt, known issues, and areas requiring attention in the Catan-SK monorepo.

---

## Tech Debt

### 1. Scaffold-Only Implementation

**Current State: Both apps are NX-generated scaffolds with no application code**

**API (`apps/api/src/main.ts`):**
- Single file with ~20 lines of boilerplate
- No WebSocket implementation despite being listed in tech stack
- No routes, controllers, or middleware architecture
- Single `/api` endpoint returning static message
- Comment explicitly states: "This is not a production server yet!"

**Web (`apps/web/src/`):**
- Uses NX default `nx-welcome.tsx` (857 lines of inline styles/JSX)
- Generic placeholder routes ("Page 2" placeholder navigation)
- No Mantine UI integration despite being installed
- No TanStack Query/Router integration (using react-router-dom instead)
- No Zustand stores implemented
- No Zod schemas implemented

**Impact:** High - No actual game functionality exists yet

---

### 2. Installed But Unused Dependencies

| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| `@mantine/core` | ^8.3.12 | **Not used** | No MantineProvider in app |
| `@mantine/form` | ^8.3.12 | **Not used** | No forms exist |
| `@mantine/hooks` | ^8.3.12 | **Not used** | No hooks imported |
| `@tanstack/react-query` | ^5.90.19 | **Not used** | No QueryClient setup |
| `@tanstack/react-router` | ^1.153.1 | **Not used** | Using react-router-dom instead |
| `zustand` | ^5.0.10 | **Not used** | No stores created |
| `zod` | ^4.3.5 | **Not used** | No schemas defined |
| `ws` | ^8.19.0 | **Not used** | No WebSocket implementation |
| `axios` | ^1.6.0 | **Not used** | Only in test files |

**Impact:** Medium - Bloats bundle, creates confusion about actual vs intended architecture

---

### 3. Router Duplication

Both routing libraries are installed:
- `react-router-dom` ^7.12.0 (actively used in app.tsx)
- `@tanstack/react-router` ^1.153.1 (installed but unused)

**Recommendation:** Choose one and remove the other. If TanStack Router is preferred per instructions, migrate from react-router-dom.

---

## Known Bugs

### 1. E2E Test vs API Response Mismatch

**File:** [apps/api-e2e/src/api/api.spec.ts](apps/api-e2e/src/api/api.spec.ts)
```typescript
expect(res.data).toEqual({ message: 'Hello API' });
```

**Actual API response:** `{ message: 'Welcome to api!' }`

**Impact:** API E2E tests will fail

---

### 2. Port Configuration Inconsistencies

| Context | Port | Source |
|---------|------|--------|
| API main.ts | 3333 | Hardcoded default |
| API E2E tests | 3000 | `global-setup.ts`, `test-setup.ts` |
| Vite dev server | 4200 | `vite.config.mts` |
| Playwright E2E | 4200 | `playwright.config.ts` |
| copilot-instructions.md | 5173 | Documentation |
| README.md | 5173 | Documentation |

**Issue:** Documentation claims port 5173 but Vite is configured for 4200

---

## Security Considerations

### 1. No API Security Middleware

**Missing in `apps/api/src/main.ts`:**
- No CORS configuration
- No Helmet for HTTP headers
- No rate limiting
- No request body parsing (no `express.json()`)
- No input validation middleware
- No authentication/authorization

**Current error handling:** Only `server.on('error', console.error)` - no route-level error handling

---

### 2. No Environment Variable Management

- No `.env` files present
- No `.env.example` template
- Single env var used: `process.env['PORT']`
- No secrets management pattern established
- Hardcoded `localhost` in Vite config

---

### 3. Type Coercion Issues

**File:** [apps/api/src/main.ts#L17](apps/api/src/main.ts#L17)
```typescript
const port = (process.env['PORT'] as unknown as number) || 3333;
```

**Issue:** Double type assertion (`as unknown as number`) is a code smell. If `PORT` is "abc", this becomes NaN, not a valid port.

**Better approach:**
```typescript
const port = Number(process.env.PORT) || 3333;
```

---

## Performance Bottlenecks

### 1. nx-welcome.tsx Inline Styles

**857 lines** of CSS embedded via `dangerouslySetInnerHTML` in the welcome component.

**Issues:**
- Inline styles on every render
- No CSS extraction/optimization
- Uses `dangerouslySetInnerHTML` unnecessarily
- Should be deleted once real UI development begins

---

### 2. No Build Optimization Configuration

- No code splitting configured
- No lazy loading patterns
- No bundle analysis setup
- Web build uses defaults only

---

## Fragile Areas

### 1. Test Coverage Gaps

**Current test files:**
| Test Type | Files | Status |
|-----------|-------|--------|
| Web E2E | 1 (`example.spec.ts`) | Single basic test |
| API E2E | 1 (`api.spec.ts`) | Single test, **will fail** |
| Unit tests | 0 | None exist |

**No unit test setup** - While Vitest is configured, no unit tests exist for either app.

---

### 2. No Shared Libraries

Despite NX monorepo supporting shared libraries, none exist:
- No `libs/` directory
- No shared types between frontend and backend
- No shared validation schemas
- No shared constants

**Risk:** Code duplication as features are added

---

### 3. Angular Configuration Remnants

**File:** [tsconfig.base.json](tsconfig.base.json)
```json
"angularCompilerOptions": {
  "enableI18nLegacyMessageIdFormat": false,
  "strictInjectionParameters": true,
  "strictInputAccessModifiers": true,
  "strictTemplates": true
}
```

**Issue:** This is a React project - Angular compiler options are unnecessary noise.

---

## Upgrade Paths Needed

### 1. Deprecated Transitive Dependencies

From `package-lock.json` analysis:

| Package | Status | Recommendation |
|---------|--------|----------------|
| `glob` (pre-v9) | Deprecated | Update dependencies that use it |
| `abab` | Deprecated | Use native `atob()`/`btoa()` |
| `domexception` | Deprecated | Use native `DOMException` |
| `inflight` | Deprecated | Memory leak concerns |
| `npmlog` | Deprecated | No longer supported |
| `stable` | Deprecated | Native `Array.sort()` is stable |
| `string_decoder` | Deprecated | Use `@exodus/bytes` |

**Note:** These are transitive dependencies from NX/tooling, not direct project deps.

---

### 2. ESLint Configuration

**Current:** Legacy `.eslintrc.json` format

**Issue:** ESLint 9+ uses flat config format (`eslint.config.js`). Project has ESLint ^9.39.2 but legacy config file.

**Missing TypeScript-ESLint rules:**
```json
{
  "plugins": ["@typescript-eslint"],
  // But no @typescript-eslint rules defined
}
```

---

## Missing Pieces

### 1. WebSocket Implementation (Documented but Not Built)

**README claims:**
> Express backend with WebSocket support

**Actual:** No WebSocket code exists. `ws` package is installed but unused.

---

### 2. Game Logic (Core Feature Not Started)

This is a Catan board game implementation but:
- No game state management
- No game rules/logic
- No board representation
- No player management
- No turn handling

---

### 3. API-Web Communication

- No API base URL configuration
- No HTTP client setup (axios installed but not configured)
- No shared API types
- No proxy configuration for development

---

### 4. Development Infrastructure

**Missing:**
- No Husky pre-commit hooks
- No lint-staged configuration
- No CI/CD pipeline configuration
- No Docker configuration
- No environment-specific configs

---

## Recommended Priority Fixes

### Immediate (Before Development)
1. Delete `nx-welcome.tsx` and scaffold real app structure
2. Fix port consistency (pick 4200 or 5173, update docs)
3. Fix API E2E test expectation
4. Add MantineProvider to main.tsx
5. Remove Angular compiler options

### Short-term (Early Development)
1. Add CORS middleware to API
2. Add `express.json()` middleware
3. Choose one router (TanStack or react-router-dom)
4. Create shared `libs/` for types
5. Add `.env.example` template

### Medium-term (As Features Develop)
1. Implement WebSocket or remove from docs
2. Add unit test examples
3. Migrate to ESLint flat config
4. Add pre-commit hooks
5. Remove unused dependencies

---

## Summary

| Category | Count | Severity |
|----------|-------|----------|
| Tech Debt Items | 3 | High - apps are scaffolds only |
| Known Bugs | 2 | Medium - test failures, port confusion |
| Security Gaps | 3 | High - no middleware, no validation |
| Performance Issues | 2 | Low - not yet relevant |
| Fragile Areas | 3 | Medium - no tests, no shared libs |
| Upgrade Needs | 2 | Low - transitive deps, ESLint config |
| Missing Features | 4 | High - core functionality absent |

**Bottom Line:** This is a freshly scaffolded NX monorepo with infrastructure in place but zero application code. The primary concern is not technical debt per se, but the gap between documented architecture (WebSocket, Mantine, TanStack, game logic) and reality (NX defaults).
