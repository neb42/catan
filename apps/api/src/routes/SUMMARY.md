# Routes Directory

This directory contains route definitions and the main router configuration for the API.

## Purpose

Routes map HTTP endpoints to their handlers. This directory contains:
- `index.ts` - Main router that mounts all feature routes
- Route-specific files for shared or non-feature routes

## Usage

Import and mount feature routes in `index.ts`:
```typescript
import { Router } from 'express';
import featureRoutes from '../features/feature-name/routes';

const router = Router();
router.use('/feature', featureRoutes);

export default router;
```
