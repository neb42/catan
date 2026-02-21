# Agent Guidelines for Catan-SK Monorepo

This document provides coding agents with essential information about build commands, code style, and conventions for the Catan-SK monorepo.

## Project Overview

NX monorepo with React frontend (apps/web) and Node.js Express backend (apps/api), plus a shared library (libs/shared).

**Stack:**

- Frontend: React 19, TypeScript, Vite, Mantine UI, TanStack Query/Router, Zod, Zustand
- Backend: Node.js, Express, TypeScript, WebSocket (ws), Zod
- Testing: Vitest (unit), Playwright (e2e)
- Tooling: NX, ESLint, Prettier

## Build, Lint, and Test Commands

### Development

```bash
npx nx serve web      # Start frontend on http://localhost:4200
npx nx serve api      # Start backend on http://localhost:3333
```

### Building

```bash
npx nx build web      # Build frontend for production
npx nx build api      # Build backend for production
npx nx build --all    # Build all projects
```

### Testing

```bash
# Run all tests in a project (uses Vitest)
npx nx test web
npx nx test api

# Run a single test file (from project directory)
cd apps/api/src/game && npx vitest run board-generator.spec.ts
cd apps/web/src && npx vitest run <test-file>.spec.tsx

# Run E2E tests (uses Playwright)
npx nx e2e web-e2e
npx nx e2e api-e2e

# Run tests in watch mode
cd apps/api && npx vitest
cd apps/web && npx vitest

# Run specific test by name pattern
npx vitest run -t "test name pattern"
```

### Linting and Formatting

```bash
npx prettier --write .              # Format all files
npx prettier --check .              # Check formatting
npx eslint .                        # Lint all files
npx eslint apps/web/src/file.tsx   # Lint specific file
```

### Other Useful Commands

```bash
npx nx graph                        # Visualize project dependencies
npx nx show project web             # Show project details
npx nx typecheck web                # Run TypeScript type checking
npx nx affected:build               # Build only affected projects
```

## Code Style Guidelines

### TypeScript Configuration

- **Strict mode enabled**: All projects use TypeScript strict mode
- **No implicit any**: Always provide explicit types
- **Explicit return types**: Preferred for functions (not enforced)
- **No unused variables**: Clean up imports and variables

### Import Organization

1. External libraries (React, Node modules)
2. Internal packages (@catan/shared, @web/_, @api/_)
3. Relative imports (./components, ../utils)
4. Blank line between groups

Example:

```typescript
import { useCallback, useEffect, useState } from 'react';
import { WebSocket } from 'ws';

import { BoardState, Player, Room } from '@catan/shared';

import { WebSocketClient } from '../services/websocket';
import { useGameStore } from './stores/gameStore';
```

### Path Aliases

Use configured path aliases in tsconfig.base.json:

- `@catan/shared` → libs/shared/src/index.ts
- `@catan/shared/*` → libs/shared/src/\*
- `@web/*` → apps/web/src/\*
- `@api/*` → apps/api/src/\*

### Formatting (Prettier)

- **Single quotes**: Use single quotes for strings
- **Semicolons**: Optional but preferred for consistency
- **Trailing commas**: Follow Prettier defaults
- **Line width**: 80 characters (Prettier default)

### Naming Conventions

#### Files

- Components: PascalCase (e.g., `Board.tsx`, `TerrainHex.tsx`)
- Utilities/Services: camelCase (e.g., `websocket.ts`, `room-id.ts`)
- Types/Schemas: kebab-case or camelCase (e.g., `board.ts`, `messages.ts`)
- Tests: Match source file with `.spec.ts` or `.test.ts` suffix

#### Code

- React Components: PascalCase (e.g., `function Board()`, `export function TerrainHex()`)
- Functions/Variables: camelCase (e.g., `generateBoard`, `isConnected`)
- Types/Interfaces: PascalCase (e.g., `BoardState`, `WebSocketMessage`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `MAX_PLAYERS`, `GRACE_PERIOD_MS`)
- Private class members: camelCase with no prefix (TypeScript doesn't use underscore)

### Component Structure (React)

```typescript
// 1. Imports
import { useState } from 'react';
import { BoardState } from '@catan/shared';

// 2. Types/Interfaces
interface BoardProps {
  board: BoardState;
}

// 3. Component
export function Board({ board }: BoardProps) {
  const [state, setState] = useState(null);

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Error Handling

**Backend:**

- Use try-catch blocks for async operations
- Throw typed errors with descriptive messages
- Log errors with console.error before re-throwing
- Validate input with Zod schemas

```typescript
try {
  const result = SomeSchema.parse(data);
  // ... process
} catch (error) {
  console.error('Failed to process data', error);
  throw new Error('Descriptive error message');
}
```

**Frontend:**

- Use Zod's safeParse for validation
- Handle errors gracefully with user-friendly messages
- Log errors to console for debugging

```typescript
const result = WebSocketMessageSchema.safeParse(parsed);
if (!result.success) {
  console.error('Invalid message', result.error);
  return;
}
```

### State Management

- **Zustand** for global client state (frontend)
- **TanStack Query** for server state (frontend)
- **Map** for in-memory collections (backend)

### Type Safety

- Use Zod schemas for runtime validation
- Export types from Zod schemas: `z.infer<typeof Schema>`
- Prefer `interface` over `type` for object shapes
- Use `type` for unions, intersections, and mapped types

## Testing Guidelines

- Place test files next to source files with `.spec.ts` extension
- Use `describe` and `it` from Vitest
- Test file naming: `<source-file>.spec.ts`
- Mock external dependencies when necessary
- Focus on behavior, not implementation

## Additional Notes

- Frontend design principles: Refer to ./designs/AESTHETICS.md (when available)
- Designs are more important than using Mantine defaults
- NX handles module resolution via tsconfig paths
- WebSocket communication uses Zod-validated messages
- Shared types live in libs/shared for use across frontend and backend