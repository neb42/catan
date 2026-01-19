# Catan-SK Monorepo

A full-stack monorepo for the Catan board game implementation, built with NX, React, and Node.js.

## Project Structure

```
catan-sk/
├── apps/
│   ├── web/              # React frontend (Vite + Mantine UI)
│   ├── web-e2e/          # E2E tests for web
│   ├── api/              # Express backend with WebSocket support
│   └── api-e2e/          # E2E tests for API
├── nx.json               # NX workspace configuration
├── package.json          # Project dependencies
├── tsconfig.base.json    # Base TypeScript configuration
├── .eslintrc.json        # ESLint configuration
└── .prettierrc            # Prettier configuration
```

## Tech Stack

### Frontend (apps/web)
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Mantine UI** - Component library
- **TanStack Query** - Server state management
- **TanStack Router** - Routing
- **Zod** - Schema validation
- **Zustand** - Client state management

### Backend (apps/api)
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **WebSocket** - Real-time communication
- **Zod** - Schema validation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **NX** - Monorepo management
- **Playwright** - E2E testing

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

```bash
npm install
```

### Development

Run both frontend and backend in development mode:

```bash
# Start web app (http://localhost:5173)
npx nx serve web

# Start API server (http://localhost:3333)
npx nx serve api
```

### Building

Build all projects:

```bash
npx nx build
```

Build specific projects:

```bash
npx nx build web
npx nx build api
```

### Testing

Run tests for all projects:

```bash
npx nx test
```

Run E2E tests:

```bash
npx nx e2e web-e2e
npx nx e2e api-e2e
```

### Linting & Formatting

Format code with Prettier:

```bash
npx prettier --write .
```

Lint code with ESLint:

```bash
npx eslint .
```

## NX Commands

- `npx nx serve <project>` - Start development server
- `npx nx build <project>` - Build project
- `npx nx test <project>` - Run unit tests
- `npx nx e2e <project-e2e>` - Run E2E tests
- `npx nx graph` - Visualize project dependencies
- `npx nx show project <project>` - Show project details

## Project Configuration

Each app has its own `project.json` and configuration:

- **apps/web/project.json** - React app configuration with Vite
- **apps/api/project.json** - Express app configuration

Base configuration files:
- **nx.json** - NX workspace settings
- **tsconfig.base.json** - Shared TypeScript config with path aliases
- **.eslintrc.json** - Shared linting rules
- **.prettierrc** - Shared formatting rules

## Path Aliases

Configured in `tsconfig.base.json`:
- `@web/*` - Web app source files
- `@api/*` - API app source files

## Contributing

Follow the coding standards:
- Use TypeScript for type safety
- Format code with Prettier before committing
- Ensure all tests pass before submitting PRs

## License

ISC
