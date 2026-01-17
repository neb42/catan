import { Router, Request, Response } from 'express';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Mount feature routes here
// Example: router.use('/users', usersRouter);

export default router;
