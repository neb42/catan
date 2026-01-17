# Catan Monorepo

This is an Nx monorepo workspace for the Catan backend API.

## Structure

- `apps/` - Application projects (e.g., the main API server)
- `libs/` - Shared libraries that can be used across applications
- `nx.json` - Nx workspace configuration
- `tsconfig.base.json` - Base TypeScript configuration extended by all projects

## Monorepo Pattern

This workspace follows a feature-based architecture where:
- Applications in `apps/` are deployable units
- Libraries in `libs/` contain shared code, types, and utilities
- Each directory contains a SUMMARY.md file for AI context

## Development

Run `npx nx <target> <project>` to execute build/serve/test targets for specific projects.
