import { config } from './config';
import { createApp } from './app';

const app = createApp();

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
});
