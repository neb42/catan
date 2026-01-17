import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file at workspace root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  wsPort: number | null;
}

function validateEnv(): AppConfig {
  const port = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3000;
  const wsPort = process.env['WS_PORT']
    ? parseInt(process.env['WS_PORT'], 10)
    : null;
  const nodeEnv = (process.env['NODE_ENV'] || 'development') as AppConfig['nodeEnv'];

  if (isNaN(port)) {
    throw new Error('PORT must be a valid number');
  }

  if (wsPort !== null && isNaN(wsPort)) {
    throw new Error('WS_PORT must be a valid number');
  }

  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be one of: development, production, test');
  }

  return {
    port,
    nodeEnv,
    wsPort,
  };
}

export const config: AppConfig = validateEnv();
