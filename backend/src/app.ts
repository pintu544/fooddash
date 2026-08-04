import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import menuRouter from './routes/menu';
import ordersRouter from './routes/orders';

export function createApp(frontendUrl: string = process.env.FRONTEND_URL ?? '*') {
  const app = express();

  app.use(
    cors({
      origin: frontendUrl,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  app.use(express.json());

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/menu', menuRouter);
  app.use('/api/orders', ordersRouter);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
