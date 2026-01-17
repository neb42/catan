# Testing Patterns

**Analysis Date:** 2026-01-17

## Test Framework

**Runner:**
- Vitest 4.x (installed in devDependencies)
- Config: No `vitest.config.ts` file configured yet
- Vite config has `/// <reference types='vitest' />` indicating Vitest support

**Assertion Library:**
- Vitest built-in assertions (expect, jest-compatible API)
- jsdom 22.x available for DOM testing

**Run Commands:**
```bash
npx nx test web           # Run web app tests (when configured)
npx vitest                # Run all tests directly
npx vitest --coverage     # Run with coverage (requires @vitest/coverage-*)
npx vitest --ui           # Run with UI (@vitest/ui installed)
```

## Test File Organization

**Location:**
- Co-located pattern expected (based on tsconfig excludes)
- Test files placed alongside source files in `src/` directories

**Naming:**
- `*.spec.ts` or `*.test.ts` for TypeScript tests
- `*.spec.tsx` or `*.test.tsx` for React component tests
- Both patterns excluded from production builds in `tsconfig.app.json`

**Structure:**
```
apps/api/src/
  middleware/
    errorHandler.ts
    errorHandler.test.ts     # <-- co-located test

apps/web/src/
  components/
    AppLayout.tsx
    AppLayout.test.tsx       # <-- co-located test
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('ModuleName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('functionName', () => {
    it('should handle expected case', () => {
      // Arrange
      // Act
      // Assert
    });

    it('should handle edge case', () => {
      // ...
    });
  });
});
```

**Patterns:**
- Use `describe` blocks to group related tests
- Use `it` or `test` for individual test cases
- Start test descriptions with "should"
- Arrange-Act-Assert pattern within tests

## Mocking

**Framework:** Vitest built-in mocking

**Patterns:**
```typescript
import { vi, describe, it, expect } from 'vitest';

// Mock a module
vi.mock('../config', () => ({
  config: {
    port: 3000,
    nodeEnv: 'test',
    wsPort: null,
  },
}));

// Mock a function
const mockFn = vi.fn();
mockFn.mockReturnValue('value');
mockFn.mockResolvedValue('async value');

// Spy on existing function
const spy = vi.spyOn(console, 'log');

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

**What to Mock:**
- External services and APIs
- Environment configuration
- File system operations
- Console methods (for logging tests)
- WebSocket connections

**What NOT to Mock:**
- Pure utility functions
- Type definitions
- Constants

## Fixtures and Factories

**Test Data:**
```typescript
// Factory function pattern
function createMockRequest(overrides = {}): Partial<Request> {
  return {
    method: 'GET',
    originalUrl: '/health',
    ...overrides,
  };
}

function createMockResponse(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}
```

**Location:**
- Test utilities in `src/test-utils/` (to be created)
- Inline factories for simple cases
- Shared fixtures in `__fixtures__/` directories (if needed)

## Coverage

**Requirements:** None enforced currently

**View Coverage:**
```bash
npx vitest --coverage
```

**Setup Required:**
- Install coverage provider: `@vitest/coverage-v8` or `@vitest/coverage-istanbul`
- Add coverage configuration to `vite.config.mts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'dist/'],
    },
  },
});
```

## Test Types

**Unit Tests:**
- Test individual functions and modules in isolation
- Mock external dependencies
- Fast execution, no external services required
- Examples: middleware functions, utility functions, pure business logic

**Integration Tests:**
- Test multiple modules working together
- Test API endpoints with supertest
- Test React components with React Testing Library
- May require test database or mock server

**E2E Tests:**
- Not configured
- Consider Playwright or Cypress for future implementation
- Would test full user flows through the application

## Common Patterns

**Async Testing:**
```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBe(expected);
});

it('should handle promises', () => {
  return expect(asyncFunction()).resolves.toBe(expected);
});

it('should handle rejected promises', () => {
  return expect(asyncFunction()).rejects.toThrow('error');
});
```

**Error Testing:**
```typescript
it('should throw on invalid input', () => {
  expect(() => validateEnv()).toThrow('PORT must be a valid number');
});

it('should throw async error', async () => {
  await expect(asyncFunction()).rejects.toThrow('error message');
});
```

**Express Middleware Testing:**
```typescript
import { Request, Response, NextFunction } from 'express';

describe('errorHandler', () => {
  it('should return error response', () => {
    const mockReq = {} as Request;
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const mockNext = vi.fn() as NextFunction;

    const error = new Error('Test error');
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      statusCode: 500,
      message: 'Test error',
    });
  });
});
```

**React Component Testing:**
```typescript
import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    <MantineProvider>{children}</MantineProvider>
  </QueryClientProvider>
);

describe('AppLayout', () => {
  it('should render children', () => {
    render(<AppLayout>Content</AppLayout>, { wrapper });
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
```

## Testing Dependencies Status

**Installed:**
- `vitest` ^4.0.0 - Test runner
- `@vitest/ui` ^4.0.0 - Visual test interface
- `jsdom` ~22.1.0 - DOM environment for component tests

**To Install for Full Testing:**
```bash
yarn add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
yarn add -D @vitest/coverage-v8
yarn add -D supertest @types/supertest  # For API integration tests
```

## Nx Testing Integration

**Nx Test Target:**
- Configured via `@nx/vite/plugin` with `testTargetName: "test"`
- Web app will use Vitest when configured
- API app needs Jest or Vitest configuration added

**Run Tests via Nx:**
```bash
npx nx test web           # Run web tests
npx nx test api           # Run API tests (when configured)
npx nx run-many -t test   # Run all project tests
```

---

*Testing analysis: 2026-01-17*
