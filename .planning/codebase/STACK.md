# Technology Stack

## Languages

| Language | Version | Usage |
|----------|---------|-------|
| TypeScript | ^5.9.3 | Primary language for both frontend and backend |
| JavaScript | ES2020 | Build configuration files |
| JSON/JSONC | - | Configuration files |

## Runtime Environment

| Runtime | Version | Notes |
|---------|---------|-------|
| Node.js | 18+ | Required for development and production |
| npm | 9+ | Package manager |

## Package Manager

- **npm** - Primary package manager
- Lock file: `package-lock.json`

## Monorepo Tooling

| Tool | Version | Purpose |
|------|---------|---------|
| NX | 22.3.3 | Monorepo management, task orchestration, caching |
| @nx/vite | ^22.3.3 | Vite integration for web app |
| @nx/webpack | 22.3.3 | Webpack integration for API |
| @nx/react | ^22.3.3 | React-specific generators and executors |
| @nx/node | ^22.3.3 | Node.js application support |
| @nx/express | ^22.3.3 | Express application support |
| @nx/js | 22.3.3 | JavaScript/TypeScript library support |

## Frontend Stack (apps/web)

### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| React | ^19.2.3 | UI framework |
| React DOM | ^19.2.3 | DOM rendering |

### Build Tool
| Package | Version | Purpose |
|---------|---------|---------|
| Vite | ^7.3.1 | Development server and bundler |
| @vitejs/plugin-react | ^5.1.2 | React plugin for Vite |

### UI Components
| Package | Version | Purpose |
|---------|---------|---------|
| @mantine/core | ^8.3.12 | Component library |
| @mantine/form | ^8.3.12 | Form handling |
| @mantine/hooks | ^8.3.12 | Utility hooks |

### State Management
| Package | Version | Purpose |
|---------|---------|---------|
| Zustand | ^5.0.10 | Client state management |
| @tanstack/react-query | ^5.90.19 | Server state management |

### Routing
| Package | Version | Purpose |
|---------|---------|---------|
| @tanstack/react-router | ^1.153.1 | Type-safe routing (available) |
| react-router-dom | ^7.12.0 | Currently in use for routing |

### Validation
| Package | Version | Purpose |
|---------|---------|---------|
| Zod | ^4.3.5 | Schema validation |

### HTTP Client
| Package | Version | Purpose |
|---------|---------|---------|
| Axios | ^1.6.0 | HTTP requests |

## Backend Stack (apps/api)

### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| Express | ^4.21.2 | Web framework |
| Node.js | 18+ | Runtime |

### WebSocket
| Package | Version | Purpose |
|---------|---------|---------|
| ws | ^8.19.0 | WebSocket server |
| @types/ws | ^8.18.1 | TypeScript definitions |

### Validation
| Package | Version | Purpose |
|---------|---------|---------|
| Zod | ^4.3.5 | Schema validation |

### Build Tool
| Package | Version | Purpose |
|---------|---------|---------|
| Webpack | ^5.104.1 | Bundler for API |
| webpack-cli | ^6.0.1 | CLI for Webpack |
| @nx/webpack/app-plugin | - | NX Webpack integration |

## Testing Stack

| Package | Version | Purpose |
|---------|---------|---------|
| Vitest | ^4.0.0 | Unit testing framework |
| @vitest/ui | ^4.0.0 | Vitest UI |
| @playwright/test | ^1.57.0 | E2E testing |
| jsdom | ~22.1.0 | DOM simulation for tests |

## Code Quality

| Tool | Version | Purpose |
|------|---------|---------|
| ESLint | ^9.39.2 | Linting |
| Prettier | ~3.6.2 | Code formatting |
| eslint-config-prettier | ^10.1.8 | ESLint + Prettier integration |
| eslint-plugin-prettier | ^5.5.5 | Run Prettier as ESLint rule |

## Transpilation

| Package | Version | Purpose |
|---------|---------|---------|
| @swc/core | ~1.5.7 | Fast JavaScript/TypeScript compiler |
| @swc-node/register | ~1.9.1 | SWC integration for Node.js |
| @swc/helpers | ~0.5.11 | SWC runtime helpers |
| tslib | ^2.3.0 | TypeScript runtime library |

## Configuration Files

| File | Purpose |
|------|---------|
| `nx.json` | NX workspace configuration, plugins, generators |
| `package.json` | Dependencies and scripts |
| `tsconfig.base.json` | Base TypeScript configuration with path aliases |
| `.prettierrc` | Prettier configuration (singleQuote: true) |
| `apps/web/vite.config.mts` | Vite configuration for web app |
| `apps/api/webpack.config.js` | Webpack configuration for API |
| `apps/web/project.json` | NX project configuration for web |
| `apps/api/project.json` | NX project configuration for API |
| `apps/web/tsconfig.json` | Web-specific TypeScript config |
| `apps/api/tsconfig.json` | API-specific TypeScript config |

## TypeScript Configuration

### Compiler Options
- Target: ES2020
- Strict mode enabled
- Path aliases configured:
  - `@web/*` → `apps/web/src/*`
  - `@api/*` → `apps/api/src/*`

## Development Ports

| Application | Port | URL |
|-------------|------|-----|
| Web (Vite) | 4200 | http://localhost:4200 |
| API (Express) | 3333 | http://localhost:3333/api |

## Build Outputs

| Application | Output Directory |
|-------------|------------------|
| Web | `dist/web` |
| API | `dist/api` |
