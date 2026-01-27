# Catan-SK Directory Structure

## Directory Layout

```
catan/
├── .github/                    # GitHub configuration
│   └── copilot-instructions.md # Copilot AI instructions
├── .planning/                  # Project planning documents
│   └── codebase/               # Codebase documentation
│       ├── ARCHITECTURE.md     # Architecture patterns
│       ├── INTEGRATIONS.md     # Integration details
│       ├── STACK.md            # Technology stack
│       └── STRUCTURE.md        # This file
├── .vscode/                    # VS Code workspace settings
├── apps/                       # Application projects
│   ├── api/                    # Express API server
│   │   ├── src/                # API source code
│   │   │   ├── main.ts         # Server entry point
│   │   │   └── assets/         # Static assets
│   │   ├── project.json        # NX project config
│   │   ├── tsconfig.json       # TS config (extends base)
│   │   ├── tsconfig.app.json   # App-specific TS config
│   │   └── webpack.config.js   # Webpack bundler config
│   ├── api-e2e/                # API end-to-end tests
│   │   ├── src/
│   │   │   ├── api/
│   │   │   │   └── api.spec.ts # API test specs
│   │   │   └── support/        # Test utilities
│   │   │       ├── global-setup.ts
│   │   │       ├── global-teardown.ts
│   │   │       └── test-setup.ts
│   │   ├── jest.config.cts     # Jest configuration
│   │   └── project.json        # NX project config
│   ├── web/                    # React web application
│   │   ├── src/                # Web source code
│   │   │   ├── main.tsx        # React entry point
│   │   │   ├── styles.css      # Global styles
│   │   │   ├── app/            # App components
│   │   │   │   ├── app.tsx     # Root component
│   │   │   │   ├── app.module.css
│   │   │   │   └── nx-welcome.tsx
│   │   │   └── assets/         # Static assets
│   │   ├── public/             # Public static files
│   │   ├── index.html          # HTML entry point
│   │   ├── project.json        # NX project config
│   │   ├── tsconfig.json       # TS config
│   │   ├── tsconfig.app.json   # App-specific TS config
│   │   └── vite.config.mts     # Vite bundler config
│   └── web-e2e/                # Web end-to-end tests
│       ├── src/
│       │   └── example.spec.ts # Playwright test specs
│       ├── playwright.config.ts # Playwright configuration
│       └── project.json        # NX project config
├── design-mockups/             # UI/UX design documentation
│   └── AESTHETICS.md           # Frontend design guidelines
├── node_modules/               # npm dependencies (gitignored)
├── .eslintrc.json              # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── .prettierignore             # Prettier ignore patterns
├── .gitignore                  # Git ignore patterns
├── AGENTS.md                   # AI agent instructions
├── README.md                   # Project documentation
├── nx.json                     # NX workspace configuration
├── package.json                # npm dependencies & scripts
├── package-lock.json           # npm lock file
└── tsconfig.base.json          # Base TypeScript config
```

## Directory Purposes

### Root Level

| Directory/File    | Purpose                                         |
| ----------------- | ----------------------------------------------- |
| `.github/`        | GitHub-specific configs (Copilot instructions)  |
| `.planning/`      | Project planning and architecture documentation |
| `.vscode/`        | VS Code workspace settings and extensions       |
| `apps/`           | All NX application projects                     |
| `design-mockups/` | UI/UX design guidelines and mockups             |
| `node_modules/`   | npm package dependencies                        |

### Apps Directory

| Project         | Type             | Purpose                             |
| --------------- | ---------------- | ----------------------------------- |
| `apps/web/`     | React App        | Frontend SPA for game UI            |
| `apps/api/`     | Express App      | Backend REST API + WebSocket server |
| `apps/web-e2e/` | Playwright Tests | Browser-based E2E tests for web     |
| `apps/api-e2e/` | Jest Tests       | HTTP-based E2E tests for API        |

### Source Code Directories

| Path                            | Purpose                                |
| ------------------------------- | -------------------------------------- |
| `apps/web/src/`                 | React components, hooks, state, styles |
| `apps/web/src/components`       | React components                       |
| `apps/web/src/components/Board` | Board-specific components              |
| `apps/web/src/hooks`            | React hooks                            |
| `apps/web/src/services`         | Service classes                        |
| `apps/web/src/stores`           | State management stores                |
| `apps/web/src/utils`            | Utility functions                      |
| `apps/api/src/assets/`          | API static assets                      |

## Key File Locations

### Entry Points

| File                       | Purpose                     |
| -------------------------- | --------------------------- |
| `apps/web/index.html`      | Web HTML entry, loads React |
| `apps/web/src/main.tsx`    | React DOM render            |
| `apps/web/src/app/app.tsx` | Root React component        |
| `apps/api/src/main.ts`     | Express server bootstrap    |

### Configuration Files

| File                 | Purpose                                 |
| -------------------- | --------------------------------------- |
| `nx.json`            | NX workspace plugins & settings         |
| `tsconfig.base.json` | Shared TypeScript config                |
| `.eslintrc.json`     | ESLint rules (extends recommended)      |
| `.prettierrc`        | Prettier formatting (singleQuote: true) |
| `package.json`       | Dependencies and npm scripts            |

### Build Configs

| File                         | Purpose                      |
| ---------------------------- | ---------------------------- |
| `apps/web/vite.config.mts`   | Vite React build config      |
| `apps/api/webpack.config.js` | Webpack Node.js build config |
| `apps/*/tsconfig.app.json`   | Per-app TypeScript settings  |

### Project Definitions

| File                        | Purpose            |
| --------------------------- | ------------------ |
| `apps/web/project.json`     | Web app NX targets |
| `apps/api/project.json`     | API app NX targets |
| `apps/web-e2e/project.json` | Web E2E NX targets |
| `apps/api-e2e/project.json` | API E2E NX targets |

### Test Files

| File                                | Purpose                  |
| ----------------------------------- | ------------------------ |
| `apps/web-e2e/src/example.spec.ts`  | Playwright browser tests |
| `apps/web-e2e/playwright.config.ts` | Playwright settings      |
| `apps/api-e2e/src/api/api.spec.ts`  | Jest API tests           |
| `apps/api-e2e/jest.config.cts`      | Jest settings            |
| `apps/api-e2e/src/support/*.ts`     | Test lifecycle hooks     |

### Documentation

| File                              | Purpose                          |
| --------------------------------- | -------------------------------- |
| `README.md`                       | Project overview and quick start |
| `AGENTS.md`                       | AI agent behavior instructions   |
| `.github/copilot-instructions.md` | Copilot-specific context         |
| `design-mockups/AESTHETICS.md`    | UI design principles             |

## Naming Conventions

### Files

| Pattern            | Convention              | Example                              |
| ------------------ | ----------------------- | ------------------------------------ |
| Components         | PascalCase              | `NxWelcome.tsx`, `App.tsx`           |
| Source files       | kebab-case or camelCase | `main.ts`, `app.tsx`                 |
| CSS Modules        | `*.module.css`          | `app.module.css`                     |
| Test specs         | `*.spec.ts`             | `api.spec.ts`, `example.spec.ts`     |
| Config files       | lowercase with dots     | `vite.config.mts`, `jest.config.cts` |
| TypeScript configs | `tsconfig.*.json`       | `tsconfig.app.json`                  |

### Directories

| Pattern           | Convention             | Example                |
| ----------------- | ---------------------- | ---------------------- |
| Apps              | lowercase              | `web`, `api`           |
| E2E projects      | `{app}-e2e`            | `web-e2e`, `api-e2e`   |
| Source code       | `src/`                 | Always present in apps |
| Support utilities | `support/`             | Test helpers           |
| Static assets     | `assets/` or `public/` | Images, fonts          |

### NX Projects

| Pattern      | Purpose                   |
| ------------ | ------------------------- |
| `{name}`     | Main application          |
| `{name}-e2e` | E2E tests for application |

## Special Patterns

### Path Aliases

Defined in `tsconfig.base.json`:

```json
{
  "paths": {
    "@web/*": ["apps/web/src/*"],
    "@api/*": ["apps/api/src/*"]
  }
}
```

### NX Plugin Inference

NX plugins in `nx.json` automatically detect and create targets:

- `@nx/vite/plugin` → `build`, `serve`, `test`, `preview` for Vite apps
- `@nx/webpack/plugin` → `build`, `serve` for Webpack apps
- `@nx/playwright/plugin` → `e2e` for Playwright projects

### Implicit Dependencies

E2E projects declare dependencies on their apps:

```json
{
  "implicitDependencies": ["web"] // in web-e2e/project.json
}
```

### Build Output

All build artifacts go to `dist/` at workspace root:

- `dist/web/` - Web app production build
- `dist/api/` - API server production build

### Test Support Pattern (API E2E)

```
apps/api-e2e/src/support/
├── global-setup.ts     # Before all tests (wait for port)
├── global-teardown.ts  # After all tests (kill port)
└── test-setup.ts       # Before each test file (configure axios)
```

### Configuration Extension Pattern

TypeScript configs extend from base:

```
tsconfig.base.json          # Workspace-wide settings
  └── apps/*/tsconfig.json  # App-specific extends base
        └── tsconfig.app.json  # App target-specific
```
