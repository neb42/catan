# Middleware Directory

This directory contains Express middleware functions used across the application.

## Purpose

Middleware functions process requests before they reach route handlers. Common middleware includes:
- Authentication/authorization
- Request logging
- Error handling
- Request validation
- CORS configuration

## Available Middleware

- `requestLogger.ts` - Logs incoming requests with method, URL, status code, and duration
- `errorHandler.ts` - Centralized error handling that formats error responses

## Usage

Export middleware functions that follow the Express middleware signature:
```typescript
(req: Request, res: Response, next: NextFunction) => void
```

Error handlers use the 4-argument signature:
```typescript
(err: Error, req: Request, res: Response, next: NextFunction) => void
```
