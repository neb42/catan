# Configuration Directory

This directory contains application configuration management.

## Files

- `index.ts` - Main configuration module that:
  - Loads environment variables from `.env` file using dotenv
  - Exports `AppConfig` interface for type safety
  - Validates and exports the `config` object

## Environment Variables

Configuration is loaded from a `.env` file at the workspace root. Available variables:

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| PORT | number | 3000 | HTTP server port |
| NODE_ENV | string | development | Environment mode (development/production/test) |
| WS_PORT | number | null | WebSocket port (null = share HTTP port) |

## Usage

```typescript
import { config } from './config';

console.log(config.port);    // number
console.log(config.nodeEnv); // 'development' | 'production' | 'test'
console.log(config.wsPort);  // number | null
```

## Adding New Variables

1. Add the variable to `.env.example` at workspace root
2. Add the property to `AppConfig` interface
3. Add validation in `validateEnv()` function
4. Update this documentation
