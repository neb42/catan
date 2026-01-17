# Types Directory

Shared TypeScript type definitions for the web application.

## Purpose

This directory contains TypeScript interfaces, types, and enums that are used across multiple parts of the application. These are shared type definitions that don't belong to a specific feature.

## Guidelines

- **Naming**: Use PascalCase for interfaces and types, UPPER_CASE for const enums
- **Organization**: Group related types in the same file (e.g., `api.types.ts`, `game.types.ts`)
- **Documentation**: Include JSDoc comments for complex types
- **Exports**: Re-export all types from `index.ts` for clean imports

## Examples of What Belongs Here

- API response types shared across features
- Common entity types (User, Game, etc.)
- Utility types used throughout the app
- Enum definitions

## What Does NOT Belong Here

- Component prop types (keep with component)
- Feature-specific types (keep in `features/*/types/`)
- Types only used in one file (keep in that file)
