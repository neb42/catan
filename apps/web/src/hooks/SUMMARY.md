# Hooks Directory

Custom React hooks for the web application.

## Purpose

This directory contains reusable custom React hooks that encapsulate common logic patterns. Hooks should be stateful logic that can be shared across multiple components.

## Guidelines

- **Naming**: All hooks must start with `use` prefix (e.g., `useAuth`, `useLocalStorage`)
- **Single Responsibility**: Each hook should do one thing well
- **Documentation**: Include JSDoc comments explaining what the hook does and its parameters
- **Testing**: Hooks should be testable in isolation using React Testing Library

## Examples of What Belongs Here

- `useDebounce` - Debounce a value over time
- `useLocalStorage` - Sync state with localStorage
- `useMediaQuery` - React to media query changes
- `useClickOutside` - Detect clicks outside an element

## What Does NOT Belong Here

- Component-specific logic (keep in the component)
- Data fetching hooks (use TanStack Query in `lib/`)
- Feature-specific hooks (keep in `features/*/hooks/`)
