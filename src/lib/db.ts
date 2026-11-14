import { createMongoClient } from './mongoose-adapter';
export { connectToDatabase } from './mongodb';
export * from '@/models';

declare global {
  // eslint-disable-next-line no-var
  var mongoDbClient: any | undefined;
}

export const db = global.mongoDbClient || createMongoClient();

if (!global.mongoDbClient) {
  global.mongoDbClient = db;
}

export default db;
