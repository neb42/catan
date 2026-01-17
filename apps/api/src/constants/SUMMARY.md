# Constants Directory

This directory contains application-wide constant values.

## Purpose

Constants provide named values for commonly used data, reducing magic numbers and strings. Examples include:
- HTTP status codes
- Error messages
- Configuration defaults
- Enum-like values

## Usage

Export constants from `index.ts` for easy imports:
```typescript
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
```
