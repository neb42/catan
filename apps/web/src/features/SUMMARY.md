# Features Directory

Feature modules for the web application.

## Purpose

This directory contains self-contained feature modules following a feature-based architecture. Each feature is a vertical slice of the application containing all related code.

## Feature Structure

Each feature should follow this structure:

```
features/
  feature-name/
    components/     # Feature-specific React components
    hooks/          # Feature-specific hooks
    types/          # Feature-specific TypeScript types
    utils/          # Feature-specific utilities
    api.ts          # Feature-specific API calls
    index.ts        # Public exports from the feature
```

## Guidelines

- **Self-Contained**: Each feature should be independently understandable
- **Minimal Coupling**: Features should not directly import from other features
- **Public API**: Export only what's needed via `index.ts`
- **Colocation**: Keep related code together within the feature
- **Naming**: Use kebab-case for feature directory names

## Examples of Future Features

- `game/` - Game board and gameplay logic
- `lobby/` - Game lobby and matchmaking
- `chat/` - In-game chat functionality
- `auth/` - Authentication and user management
- `settings/` - User preferences and settings

## What Does NOT Belong Here

- Shared components used across features (use `components/`)
- Shared hooks (use `hooks/`)
- Shared types (use `types/`)
- Shared utilities (use `utils/`)
