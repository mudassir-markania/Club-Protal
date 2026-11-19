import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { adapt } from './http/adapter';
import { routes } from './routes.generated';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

export function createApp() {
  const app = express();

  const origins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map((s) => s.trim());
  app.use(cors({ origin: origins, credentials: true }));
  app.use(express.json({ limit: '10mb' })); // CSV imports send whole rosters as JSON

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, status: 'ok', uptime: process.uptime() });
  });

  // every route module under src/routes (GET / POST / PUT / PATCH / DELETE exports)
  for (const { path, module } of routes) {
    for (const method of METHODS) {
      const handler = module[method];
      if (typeof handler === 'function') {
        (app as any)[method.toLowerCase()](path, adapt(handler as any));
      }
    }
  }

  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON body' });
    console.error(err);
    res.status(500).json({ error: err?.message || 'Internal server error' });
  });

  return app;
}
