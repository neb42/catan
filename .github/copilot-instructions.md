# Copilot Instructions for Catan-SK Monorepo

## Project Overview
NX monorepo with React web app and Node.js Express API server.

- **Frontend** (./apps/web): React, TypeScript, Vite, Mantine UI, TanStack Query/Router, Zod, Zustand
- **Backend** (./apps/api): Node.js, Express, TypeScript, WebSocket, Zod
- **Tooling**: Prettier, ESLint

## Execution Progress

- [x] Create copilot-instructions.md file
- [x] Scaffold NX monorepo project with TypeScript preset
- [x] Create React web app with Vite, Mantine UI, TanStack Query/Router, Zod, Zustand
- [x] Create Express API server with WebSocket support
- [x] Install and configure ESLint and Prettier
- [x] Verify both web and API apps compile successfully
- [x] Create comprehensive README with project documentation

## Quick Start

### Development
```bash
npm install
npx nx serve web      # Start frontend (http://localhost:5173)
npx nx serve api      # Start backend (http://localhost:3333)
```

### Building
```bash
npx nx build web
npx nx build api
```

### Formatting & Linting
```bash
npx prettier --write .
npx eslint .
```

## Available Commands

- `npx nx serve <project>` - Start development server
- `npx nx build <project>` - Build project for production
- `npx nx test <project>` - Run unit tests
- `npx nx e2e <project-e2e>` - Run E2E tests
- `npx nx graph` - Visualize project dependency graph
- `npx nx show project <project>` - Show project details
