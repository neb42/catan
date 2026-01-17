import express from 'express';

const port = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3000;

const app = express();

app.get('/', (_req, res) => {
  res.json({ message: 'Hello API' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
