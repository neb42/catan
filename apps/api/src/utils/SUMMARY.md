# Utils Directory

This directory contains shared utility functions used throughout the application.

## Purpose

Utility functions are small, reusable helper functions that don't belong to any specific feature. Examples include:
- String manipulation helpers
- Date formatting functions
- Validation helpers
- Response formatters

## Usage

Export utility functions from `index.ts` for easy imports:
```typescript
import { formatResponse, validateEmail } from '../utils';
```
