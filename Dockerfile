# Multi-stage Dockerfile for Catan NX Monorepo
# Builds both web (Vite React) and api (Express) apps
# Reference: 13-RESEARCH.md Pattern 1 (Multi-Stage Docker Build for NX Monorepo)

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false

# Stage 2: Build both applications
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx nx build api --prod
RUN npx nx build web --prod

# Stage 3: Production runtime
FROM node:20-alpine AS runtime
WORKDIR /app

# Copy production dependencies only
COPY package*.json ./
RUN npm ci --production --ignore-scripts

# Copy built artifacts from build stage
COPY --from=build /app/dist/api ./dist/api
COPY --from=build /app/dist/web ./dist/web

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Cloud Run provides PORT env var (default 8080)
EXPOSE 8080

# Start the API server which serves both WebSocket and frontend static files
CMD ["node", "dist/api/main.js"]
