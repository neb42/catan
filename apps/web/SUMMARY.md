# Web Application

This is the frontend React application for the Catan project.

## Overview

A single-page application built with:
- **React** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe development

## Entry Point

- `src/main.tsx` - Application entry point, renders the root React component

## Directory Structure

```
apps/web/
├── src/
│   ├── main.tsx          # Entry point
│   ├── app/              # Root application component
│   ├── assets/           # Static assets
│   └── styles.css        # Global styles
├── index.html            # HTML template
├── vite.config.mts       # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── tsconfig.app.json     # App-specific TypeScript config
```

## Development

```bash
# Start development server
npx nx serve web

# Build for production
npx nx build web

# Type check
npx nx typecheck @catan/web
```

## Configuration

- Development server runs on port 4200 by default (Vite)
- Connects to backend API at localhost:3000
