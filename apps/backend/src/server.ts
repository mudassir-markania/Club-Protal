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
  createApp().listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}/api`);
  });
}

start();
