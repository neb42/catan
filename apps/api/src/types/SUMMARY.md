# Types Directory

This directory contains shared TypeScript type definitions used across the application.

## Purpose

Centralized type definitions ensure consistency and type safety. This directory contains:
- Common API response types
- Shared interfaces and type aliases
- Utility types
- WebSocket message types

## Available Types

### AppConfig
Configuration type for environment variables. Re-exported from `config/` module to maintain a single source of truth.

### ApiResponse<T>
Generic wrapper type for standardized API responses. All endpoints should return data in this format:
- `success`: boolean indicating request outcome
- `data`: response payload (on success)
- `error`: error message (on failure)
- `details`: optional additional error information

### WebSocketMessage<T>
Structure for WebSocket communication:
- `type`: message type identifier for routing
- `payload`: message data
- `id`: optional unique ID for tracking
- `timestamp`: optional ISO timestamp

## Usage

Export types from `index.ts` for easy imports:
```typescript
import { ApiResponse, AppConfig, WebSocketMessage } from '../types';
```

## Guidelines

- Keep types generic and reusable
- Feature-specific types should live in their respective feature directories
- Document types with JSDoc comments in the source file
- Use generics for flexible, reusable type definitions
