# Middleware Directory

This directory contains Express middleware functions used across the application.

## Purpose

Middleware functions process requests before they reach route handlers. Common middleware includes:
- Authentication/authorization
- Request logging
- Error handling
- Request validation
- CORS configuration

## Usage

Export middleware functions that follow the Express middleware signature:
```typescript
(req: Request, res: Response, next: NextFunction) => void
```
