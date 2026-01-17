# Coding Conventions

**Analysis Date:** 2026-01-17

## Naming Patterns

**Files:**
- Backend: `camelCase.ts` for all TypeScript files (e.g., `errorHandler.ts`, `requestLogger.ts`, `httpStatus.ts`)
- Frontend: `PascalCase.tsx` for React components (e.g., `AppLayout.tsx`)
- Frontend: `camelCase.ts` for non-component files (e.g., `queryClient.ts`, `api.ts`)
- Route files: `__root.tsx` for root route, `index.tsx` for index routes (TanStack Router convention)

**Functions:**
- Use `camelCase` for all function names
- Prefix factory functions with `create` (e.g., `createApp`, `createRouter`, `createRootRoute`)
- Prefix getter functions with `get` (e.g., `getWebSocketServer`)
- Prefix initialization functions with `initialize` (e.g., `initializeWebSocket`)
- Prefix validation functions with `validate` (e.g., `validateEnv`)

**Variables:**
- Use `camelCase` for variables and parameters
- Use `UPPER_SNAKE_CASE` for constants (e.g., `HTTP_OK`, `API_BASE_URL`, `DEFAULT_PORT`)
- Prefix unused parameters with underscore (e.g., `_req`, `_next`)

**Types:**
- Use `PascalCase` for interfaces and type aliases
- Suffix response types with `Response` (e.g., `ApiResponse`, `HealthResponse`)
- Suffix props interfaces with `Props` (e.g., `AppLayoutProps`)
- Suffix config interfaces with `Config` (e.g., `AppConfig`)

## Code Style

**Formatting:**
- Tool: Prettier 3.6.x
- Config file: `.prettierrc`
- Key settings:
  - `singleQuote: true` - Use single quotes for strings
  - Default Prettier settings for everything else (2 space indent, semicolons, etc.)

**Linting:**
- No ESLint configured at project level
- Nx generators configured with `"linter": "none"`
- TypeScript strict mode enabled for type checking

**TypeScript Strictness:**
- Strict mode enabled (`"strict": true`)
- No implicit returns (`"noImplicitReturns": true`)
- No unused locals (`"noUnusedLocals": true`)
- No fallthrough cases in switch (`"noFallthroughCasesInSwitch": true`)
- No implicit override (`"noImplicitOverride": true`)

## Import Organization

**Order:**
1. Node built-in modules (e.g., `http`, `path`)
2. External packages (e.g., `express`, `react`, `@mantine/core`)
3. Internal absolute imports (e.g., `../config`, `./routes`)

**Path Aliases:**
- None configured currently
- Relative imports used throughout (e.g., `../components/AppLayout`, `./lib/queryClient`)

**Import Style:**
- Named imports preferred: `import { Router, Request, Response } from 'express'`
- Default imports for modules that export defaults: `import cors from 'cors'`
- Type imports when only importing types: `export type { AppConfig } from '../config'`
- Namespace imports for React DOM: `import * as ReactDOM from 'react-dom/client'`

## Error Handling

**Backend Patterns:**
- Custom `AppError` interface extends `Error` with `statusCode` and `isOperational` properties
- Centralized error handler middleware at `apps/api/src/middleware/errorHandler.ts`
- Error responses follow consistent structure: `{ status: 'error', statusCode, message }`
- Use `throw new Error()` for synchronous errors with descriptive messages
- Log errors with `console.error()` including stack trace

**Frontend Patterns:**
- Use TanStack Query's built-in error states (`isError`, `error`)
- API errors thrown as `new Error()` with status code and status text
- Display user-friendly error messages in UI using Mantine `Alert` component

**API Fetch Pattern:**
```typescript
if (!response.ok) {
  throw new Error(`API error: ${response.status} ${response.statusText}`);
}
```

## Logging

**Framework:** Console (built-in)

**Backend Patterns:**
- Request logging middleware at `apps/api/src/middleware/requestLogger.ts`
- Format: `[ISO_TIMESTAMP] METHOD PATH STATUS_CODE - DURATION_MS`
- WebSocket events prefixed with `[WebSocket]`
- Error logs prefixed with `[ERROR]`
- Server startup logged with port and environment mode

**Frontend Patterns:**
- No logging framework configured
- Use browser console for development debugging

## Comments

**When to Comment:**
- JSDoc comments for exported functions, interfaces, and types
- Single-line comments for explaining non-obvious code
- Comments before middleware usage to explain purpose

**JSDoc/TSDoc:**
- Use `/** */` style for documentation comments
- Include `@param` and `@returns` descriptions where helpful
- Document interfaces with descriptions for each property

**Example Pattern:**
```typescript
/**
 * Standardized API response wrapper type.
 * All API endpoints should return responses in this format.
 */
export interface ApiResponse<T = unknown> {
  /** Indicates if the request was successful */
  success: boolean;
  /** The response payload (present on success) */
  data?: T;
}
```

## Function Design

**Size:**
- Keep functions focused on single responsibility
- Express middleware functions are concise (typically 10-20 lines)
- Factory functions return configured instances

**Parameters:**
- Use destructuring for React props: `function AppLayout({ children }: AppLayoutProps)`
- Express middleware signature: `(req, res, next) => void`
- Optional parameters use `?` or default values

**Return Values:**
- Explicit return types on exported functions
- Use `void` for functions with side effects only
- Use `Promise<T>` for async functions

## Module Design

**Exports:**
- Named exports preferred: `export function createApp()`
- Default exports for route modules: `export default router`
- Re-exports for barrel files: `export * from './httpStatus'`
- Type-only exports when appropriate: `export type { AppConfig }`

**Barrel Files:**
- Each directory has an `index.ts` as entry point
- Re-export from internal modules: `export * from './httpStatus'`
- Constants consolidated with grouped exports

**Module Structure:**
- One primary export per file (exceptions: constants, types)
- Related types defined in same file or `types/index.ts`
- Configuration validated and exported as singleton

## React Component Patterns

**Component Definition:**
- Use function components exclusively
- Define inline within route files or in dedicated component files
- Props interface defined immediately before component

**Component Structure:**
```typescript
interface ComponentProps {
  children: ReactNode;
}

export function ComponentName({ children }: ComponentProps) {
  // hooks
  // handlers
  // return JSX
}
```

**State Management:**
- Use `@mantine/hooks` for UI state (e.g., `useDisclosure`)
- Use TanStack Query for server state (`useQuery`, `useMutation`)
- No global state management library configured

**UI Components:**
- Use Mantine components exclusively for UI
- Stack, Group, Alert, Text, Title for layout and typography
- AppShell for page layout structure

## Constants Organization

**Location:** `apps/api/src/constants/`

**Patterns:**
- Individual constants exported: `export const HTTP_OK = 200`
- Grouped constants as objects: `export const HTTP_STATUS = { ... } as const`
- Error messages as const object: `export const ERROR_MESSAGES = { ... } as const`
- Type derived from const: `export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS]`

---

*Convention analysis: 2026-01-17*
