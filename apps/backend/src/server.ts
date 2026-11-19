import 'dotenv/config';
import { createApp } from './app';
import { connectToDatabase } from './lib/mongodb';

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  try {
    await connectToDatabase();
  } catch (err: any) {
    // the API still starts; each request retries the connection
    console.error('MongoDB connection failed at startup:', err?.message);
  }
  const server = createApp().listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}/api`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `
Port ${PORT} is already in use, so the backend cannot start.
` +
          `Another backend (or any app) is still running on it. Stop that process, or set a different PORT in apps/backend/.env ` +
          `(and BACKEND_URL in apps/frontend/.env.local).
` +
          `Find it with:  netstat -ano | findstr :${PORT}   then:  taskkill /PID <pid> /F
`
      );
      process.exit(1);
    }
    throw err;
  });
}

start();
