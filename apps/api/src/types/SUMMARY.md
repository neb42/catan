# Types Directory

This directory contains shared TypeScript type definitions used across the application.

## Purpose

Centralized type definitions ensure consistency and type safety. This directory contains:
- Common API response types
- Shared interfaces and type aliases
- Utility types
- WebSocket message types

## Usage

Export types from `index.ts` for easy imports:
```typescript
import { ApiResponse, AppConfig } from '../types';
```

Feature-specific types should live in their respective feature directories.
