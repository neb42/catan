# Routes Directory

This directory contains TanStack Router route definitions for the web application.

## Purpose

Defines the application's page routes using TanStack Router's file-based routing convention.

## Key Files

- `__root.tsx` - Root route that wraps all child routes, provides layout structure
- `index.tsx` - Home page route (/)

## Routing Pattern

TanStack Router uses a file-based routing approach:
- `__root.tsx` - Special root route file, always rendered
- `index.tsx` - Index route for the parent directory path
- `[param].tsx` - Dynamic route parameter
- `folder/` - Nested routes create path segments

## Type Safety

Routes are fully type-safe. The router is configured in `apps/web/src/router.tsx` with the route tree built from these files.
