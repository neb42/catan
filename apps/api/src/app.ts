import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Application {
  const app = express();

  // Request logging middleware
  app.use(requestLogger);

  // CORS middleware
  app.use(cors());

  // JSON body parsing middleware
  app.use(express.json());

  // URL-encoded body parsing
  app.use(express.urlencoded({ extended: true }));

  // Mount routes
  app.use(routes);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}
