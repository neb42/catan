# Utils Directory

This directory contains shared utility functions used throughout the application.

## Purpose

Utility functions are small, reusable helper functions that don't belong to any specific feature. Examples include:
- String manipulation helpers
- Date formatting functions
- Validation helpers
- Response formatters

## Files

- `index.ts` - Main export file with placeholder utilities

## Usage

Export utility functions from `index.ts` for easy imports:
```typescript
import { noop } from '../utils';
```

## Guidelines

- Keep utility functions pure when possible (no side effects)
- Each function should do one thing well
- Add JSDoc comments for complex utilities
- Consider adding unit tests for critical utilities
