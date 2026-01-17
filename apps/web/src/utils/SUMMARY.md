# Utils Directory

Utility functions for the web application.

## Purpose

This directory contains pure utility functions that are stateless and reusable across the application. These functions should have no side effects and be easily testable.

## Guidelines

- **Pure Functions**: Utils should be pure - same input always produces same output
- **No Side Effects**: Don't modify external state or perform I/O operations
- **Type Safety**: Always include proper TypeScript types for parameters and return values
- **Testing**: Each utility should have corresponding unit tests
- **Documentation**: Include JSDoc comments explaining usage

## Examples of What Belongs Here

- `formatDate(date: Date): string` - Date formatting utilities
- `capitalize(str: string): string` - String manipulation
- `debounce(fn, ms)` - Function utilities
- `clamp(value, min, max)` - Math utilities
- `generateId()` - ID generation

## What Does NOT Belong Here

- API calls (use `lib/api.ts`)
- React hooks (use `hooks/`)
- Feature-specific utilities (keep in `features/*/utils/`)
- Stateful logic
