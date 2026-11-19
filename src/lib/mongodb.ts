import dns from 'dns';
import mongoose from 'mongoose';

// Fix for Windows / Node.js querySrv ECONNREFUSED on MongoDB Atlas
// Defaults to Google and Cloudflare DNS to resolve SRV records when local resolver rejects them
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore fallback if running in restricted environment
}

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/apexarena';

// Standard replica set fallback if SRV lookup fails
const DIRECT_REPLICA_SET_URI =
  'mongodb://tahachoudhary54_db_user:211RLE0TIaBmFK7b@ac-qb4lmlt-shard-00-00.wi6c9kn.mongodb.net:27017,ac-qb4lmlt-shard-00-01.wi6c9kn.mongodb.net:27017,ac-qb4lmlt-shard-00-02.wi6c9kn.mongodb.net:27017/apexarena?ssl=true&replicaSet=atlas-xm1iy4-shard-0&authSource=admin&retryWrites=true&w=majority';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 7000,
      dbName: 'apexarena',
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        console.log('Connected successfully to MongoDB Atlas');
        return m;
      })
      .catch(async (err) => {
        console.warn('Primary MongoDB connection attempt failed:', err.message);
        // If SRV lookup failed, attempt direct replica set connection
        if (err.message && (err.message.includes('querySrv') || err.message.includes('ECONNREFUSED'))) {
          console.log('Attempting fallback to direct MongoDB replica set connection...');
          try {
            const fallbackConn = await mongoose.connect(DIRECT_REPLICA_SET_URI, opts);
            console.log('Connected successfully via direct MongoDB replica set fallback');
            return fallbackConn;
          } catch (fallbackErr: any) {
            console.error('Fallback MongoDB connection also failed:', fallbackErr.message);
            cached.promise = null;
            throw fallbackErr;
          }
        }
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export default connectToDatabase;

