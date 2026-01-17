# Constants Directory

This directory contains application-wide constant values.

## Purpose

Constants provide named values for commonly used data, reducing magic numbers and strings. Examples include:
- HTTP status codes
- Error messages
- Configuration defaults
- Enum-like values

## Files

- `index.ts` - Main export file that re-exports all constants
- `httpStatus.ts` - HTTP status code constants and types

## Usage

Export constants from `index.ts` for easy imports:
```typescript
import { HTTP_STATUS, ERROR_MESSAGES, API_PREFIX } from '../constants';

// Use HTTP status codes
res.status(HTTP_STATUS.OK).json({ data });
res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.NOT_FOUND });
```

## Available Constants

### HTTP Status Codes (`httpStatus.ts`)
- Individual constants: `HTTP_OK`, `HTTP_NOT_FOUND`, etc.
- Grouped object: `HTTP_STATUS.OK`, `HTTP_STATUS.NOT_FOUND`, etc.
- Type: `HttpStatusCode` for type-safe status codes

### Common Constants (`index.ts`)
- `APP_NAME`, `API_VERSION`, `API_PREFIX` - Application identity
- `DEFAULT_PORT`, `DEFAULT_WS_PORT`, `DEFAULT_NODE_ENV` - Default values
- `ONE_SECOND`, `ONE_MINUTE`, `ONE_HOUR` - Timing constants
- `ERROR_MESSAGES` - Common error message strings
