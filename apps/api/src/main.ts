import express from 'express';
import { config } from './config';

const app = express();

app.get('/', (_req, res) => {
  res.json({ message: 'Hello API' });
});

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
});
