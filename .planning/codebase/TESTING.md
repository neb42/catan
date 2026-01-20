# Testing Patterns

This document captures the testing frameworks, patterns, and configurations used in the Catan-SK monorepo.

## Test Frameworks

| Framework | Version | Use Case |
|-----------|---------|----------|
| **Jest** | (via @nx/jest) | API E2E tests |
| **Playwright** | 1.57.0 | Web E2E tests |
| **Vitest** | 4.0.0 | Unit tests (available via Vite) |

## Test File Organization

### Directory Structure
```
apps/
├── web/
│   └── src/                    # Unit tests co-located with source
├── web-e2e/
│   ├── playwright.config.ts    # Playwright configuration
│   └── src/
│       └── example.spec.ts     # E2E test files
├── api/
│   └── src/                    # Unit tests co-located with source
└── api-e2e/
    ├── jest.config.cts         # Jest configuration
    └── src/
        ├── api/
        │   └── api.spec.ts     # API E2E tests
        └── support/
            ├── global-setup.ts
            ├── global-teardown.ts
            └── test-setup.ts
```

### File Naming Conventions
- Test files: `*.spec.ts` or `*.spec.tsx`
- Support files: descriptive names in `support/` directory

## Run Commands

### All Tests
```bash
npx nx test
```

### E2E Tests
```bash
# Web E2E (Playwright)
npx nx e2e web-e2e

# API E2E (Jest)
npx nx e2e api-e2e
```

### Unit Tests (when configured)
```bash
npx nx test web
npx nx test api
```

## Jest Configuration (API E2E)

Configuration file: [apps/api-e2e/jest.config.cts](../../apps/api-e2e/jest.config.cts)

```typescript
export default {
  displayName: 'api-e2e',
  preset: '../jest.preset.js',
  globalSetup: '<rootDir>/src/support/global-setup.ts',
  globalTeardown: '<rootDir>/src/support/global-teardown.ts',
  setupFiles: ['<rootDir>/src/support/test-setup.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../coverage/api-e2e',
};
```

### Key Configuration
- **displayName**: `api-e2e`
- **testEnvironment**: `node`
- **Transform**: ts-jest for TypeScript support
- **Coverage output**: `coverage/api-e2e`

## Playwright Configuration (Web E2E)

Configuration file: [apps/web-e2e/playwright.config.ts](../../apps/web-e2e/playwright.config.ts)

```typescript
import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx nx run web:preview',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    cwd: workspaceRoot,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

### Key Configuration
- **Base URL**: `http://localhost:4200` (or `BASE_URL` env var)
- **Trace**: Captured on first retry
- **Web Server**: Auto-starts via `nx run web:preview`
- **Browsers**: Chromium, Firefox, WebKit

## Test Structure Patterns

### Jest/API E2E Test Pattern
```typescript
import axios from 'axios';

describe('GET /', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });
});
```

**Pattern Notes:**
- Use `describe` blocks to group related tests
- Use `it` for individual test cases
- Async/await for HTTP requests
- Assert on status code and response body

### Playwright/Web E2E Test Pattern
```typescript
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect h1 to contain a substring.
  expect(await page.locator('h1').innerText()).toContain('Welcome');
});
```

**Pattern Notes:**
- Import `test` and `expect` from `@playwright/test`
- Use `page` fixture for browser interactions
- Navigate with `page.goto()`
- Use locators for element selection
- Assert with `expect()`

## E2E Test Setup (API)

### Global Setup ([global-setup.ts](../../apps/api-e2e/src/support/global-setup.ts))
```typescript
import { waitForPortOpen } from '@nx/node/utils';

module.exports = async function () {
  console.log('\nSetting up...\n');

  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await waitForPortOpen(port, { host });

  globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
};
```

**Purpose:**
- Wait for API server to be available
- Use `waitForPortOpen` utility from NX
- Store teardown message in `globalThis`

### Global Teardown ([global-teardown.ts](../../apps/api-e2e/src/support/global-teardown.ts))
```typescript
import { killPort } from '@nx/node/utils';

module.exports = async function () {
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await killPort(port);
  console.log(globalThis.__TEARDOWN_MESSAGE__);
};
```

**Purpose:**
- Kill the server process on the port
- Clean up after tests complete

### Test Setup ([test-setup.ts](../../apps/api-e2e/src/support/test-setup.ts))
```typescript
import axios from 'axios';

module.exports = async function () {
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ?? '3000';
  axios.defaults.baseURL = `http://${host}:${port}`;
};
```

**Purpose:**
- Configure axios base URL for all tests
- Use environment variables for host/port

## Mocking Patterns

### HTTP Mocking (API Tests)
- Currently using real HTTP requests via axios
- Base URL configured in test-setup.ts
- No mocking framework currently configured

### Browser Mocking (E2E)
- Playwright runs against real browser instances
- No network mocking configured by default

## Coverage Requirements

### API E2E Coverage
- Coverage directory: `coverage/api-e2e`
- No explicit thresholds configured

### Configuration
Coverage is generated by Jest with output to dedicated directories per project.

## Environment Variables

### API E2E Tests
| Variable | Default | Purpose |
|----------|---------|---------|
| `HOST` | `localhost` | API server host |
| `PORT` | `3000` | API server port |

### Web E2E Tests
| Variable | Default | Purpose |
|----------|---------|---------|
| `BASE_URL` | `http://localhost:4200` | Web app base URL |

## Project Dependencies

### E2E Project Configuration

**api-e2e** ([project.json](../../apps/api-e2e/project.json)):
```json
{
  "implicitDependencies": ["api"],
  "targets": {
    "e2e": {
      "executor": "@nx/jest:jest",
      "dependsOn": ["api:build", "api:serve"]
    }
  }
}
```

**web-e2e** ([project.json](../../apps/web-e2e/project.json)):
```json
{
  "implicitDependencies": ["web"]
}
```

## TypeScript Configuration for Tests

### API E2E ([tsconfig.spec.json](../../apps/api-e2e/tsconfig.spec.json))
```jsonc
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../dist/out-tsc",
    "module": "commonjs",
    "types": ["jest", "node"]
  },
  "include": ["jest.config.ts", "src/**/*.ts"]
}
```

## Adding New Tests

### Adding API E2E Tests
1. Create new `.spec.ts` file in `apps/api-e2e/src/`
2. Use `describe`/`it` pattern
3. Import axios (base URL pre-configured)
4. Run with `npx nx e2e api-e2e`

### Adding Web E2E Tests
1. Create new `.spec.ts` file in `apps/web-e2e/src/`
2. Import from `@playwright/test`
3. Use `test` function with `page` fixture
4. Run with `npx nx e2e web-e2e`

### Adding Unit Tests (Vitest)
Vitest is available but not yet configured. To add:
1. Create `.spec.ts` or `.test.ts` files alongside source
2. Configure in `vite.config.mts` test section
3. Run with `npx nx test web` or `npx nx test api`
