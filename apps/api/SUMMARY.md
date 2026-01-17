# API Application

This is the main Express API application for the Catan project.

## Purpose

This application serves as the backend API server, providing:
- RESTful API endpoints
- WebSocket support for real-time communication
- Centralized business logic and data processing

## Structure

- `src/main.ts` - Application entry point, starts the Express server
- `src/app.ts` - Express application configuration (to be added)
- `src/config/` - Environment configuration (to be added)
- `src/features/` - Feature modules (to be added)
- `src/middleware/` - Express middleware (to be added)
- `src/routes/` - API route definitions (to be added)
- `src/types/` - TypeScript type definitions (to be added)
- `src/utils/` - Utility functions (to be added)
- `src/websocket/` - WebSocket server setup (to be added)

## Running the Application

```bash
# Development server
nx serve api

# Build for production
nx build api
```

## Configuration

The server reads configuration from environment variables:
- `PORT` - HTTP server port (default: 3000)
