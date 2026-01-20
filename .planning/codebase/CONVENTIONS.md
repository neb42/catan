# Coding Conventions

This document captures the coding conventions and patterns used in the Catan-SK monorepo.

## Naming Patterns

### Files
| Type | Pattern | Examples |
|------|---------|----------|
| React Components | `kebab-case.tsx` | `app.tsx`, `nx-welcome.tsx` |
| TypeScript Files | `kebab-case.ts` | `main.ts`, `api.spec.ts` |
| CSS Modules | `component-name.module.css` | `app.module.css` |
| Config Files | `kebab-case` | `project.json`, `vite.config.mts` |
| Test Files | `*.spec.ts` or `*.spec.tsx` | `api.spec.ts`, `example.spec.ts` |

### Functions & Variables
- **Functions**: `camelCase` for regular functions, `PascalCase` for React components
- **Variables**: `camelCase` for local variables
- **Constants**: `SCREAMING_SNAKE_CASE` for module-level constants
- **Types/Interfaces**: `PascalCase`

### React Components
- Components exported as named functions with `PascalCase`
- Default export at end of file: `export default App;`
- Props typed inline or as separate interface: `{ title }: { title: string }`

## Code Style

### Formatting Tool
- **Prettier** v3.6.2
- Configuration file: [.prettierrc](../../.prettierrc)

### Prettier Configuration
```json
{
  "singleQuote": true
}
```

### Prettier Ignore Patterns
From [.prettierignore](../../.prettierignore):
- `/dist`
- `/coverage`
- `/.nx/cache`
- `/.nx/workspace-data`

### Format Commands
```bash
npx prettier --write .
```

## Linting Configuration

### ESLint
- **ESLint** v9.39.2
- Configuration file: [.eslintrc.json](../../.eslintrc.json)

### ESLint Configuration
```jsonc
{
  "extends": ["eslint:recommended"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "prettier"],
  "rules": {
    "prettier/prettier": "error"
  },
  "env": {
    "browser": true,
    "node": true,
    "es2021": true
  }
}
```

### Key Rules
- Prettier integration enforced (`prettier/prettier: error`)
- TypeScript parser for TS/TSX files
- ES2021 environment enabled

### Lint Commands
```bash
npx eslint .
```

## TypeScript Configuration

### Base Configuration ([tsconfig.base.json](../../tsconfig.base.json))
```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "lib": ["ES2020", "DOM"]
  }
}
```

### Path Aliases
```jsonc
{
  "paths": {
    "@web/*": ["apps/web/src/*"],
    "@api/*": ["apps/api/src/*"]
  }
}
```

## Import Organization

### Pattern
1. External framework imports (React, Express)
2. External library imports
3. Internal path alias imports (`@web/*`, `@api/*`)
4. Relative imports

### Examples

**React Component (main.tsx)**:
```tsx
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
```

**Express API (main.ts)**:
```typescript
import express from 'express';
import * as path from 'path';
```

## Error Handling Patterns

### Express API
- Use `.on('error', console.error)` for server-level errors
- Log errors to console for visibility

```typescript
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
```

## Logging Patterns

### Console Logging
- Use `console.log()` for informational messages
- Use `console.error()` for error handling
- Include context in log messages (URLs, ports, etc.)

```typescript
console.log(`Listening at http://localhost:${port}/api`);
```

## Component Patterns (React)

### Functional Components
All components use functional component syntax with TypeScript:

```tsx
export function App() {
  return <div>...</div>;
}

export default App;
```

### Props Typing
```tsx
export function NxWelcome({ title }: { title: string }) {
  return <>{/* ... */}</>;
}
```

### Component Structure
1. Imports
2. Component function with typed props
3. JSX return
4. Default export

### Routing
- Using `react-router-dom` with `BrowserRouter`
- Routes defined inline within components using `<Routes>` and `<Route>`

```tsx
<Routes>
  <Route path="/" element={<div>Content</div>} />
  <Route path="/page-2" element={<div>Page 2</div>} />
</Routes>
```

### Styling Options
- CSS Modules available (`app.module.css`)
- Global styles in `styles.css`
- Inline styles (used in `nx-welcome.tsx` via `dangerouslySetInnerHTML`)

## API Patterns (Express)

### Server Setup
```typescript
import express from 'express';
import * as path from 'path';

const app = express();

// Static assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// API routes
app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to api!' });
});

// Server start
const port = (process.env['PORT'] as unknown as number) || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
```

### Response Patterns
- Return JSON objects with `message` key for simple responses
- Use `res.send()` for JSON responses

### Environment Variables
- Access via bracket notation: `process.env['PORT']`
- Provide sensible defaults: `|| 3333`

## UI Library

### Mantine UI
- Available packages: `@mantine/core`, `@mantine/form`, `@mantine/hooks`
- Version: 8.3.12

## State Management

### Libraries Available
- **Zustand** (v5.0.10) - Client state
- **TanStack Query** (v5.90.19) - Server state
- **TanStack Router** (v1.153.1) - Routing (alternative to react-router-dom)

## Validation

### Zod
- Version: 4.3.5
- Use for schema validation on both frontend and backend

## Frontend Aesthetics Guidelines

Reference: [design-mockups/AESTHETICS.md](../../design-mockups/AESTHETICS.md)

Key principles:
- Avoid generic "AI slop" aesthetics
- Use distinctive, beautiful typography (avoid Inter, Roboto, Arial)
- Commit to cohesive color themes with sharp accents
- Implement meaningful animations for micro-interactions
- Create atmospheric backgrounds with gradients and patterns
