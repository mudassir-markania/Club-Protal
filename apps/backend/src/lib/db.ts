import { createMongoClient } from './mongoose-adapter';
export { connectToDatabase } from './mongodb';
export * from '@/models';

declare global {
  // eslint-disable-next-line no-var
  var mongoDbClient: any | undefined;
}

if (!global.mongoDbClient || !global.mongoDbClient.playerPerformance || !global.mongoDbClient.sportScoringRule || !global.mongoDbClient.awardAllocation || !global.mongoDbClient.bgmiTeam || !global.mongoDbClient.doublesTeam || !global.mongoDbClient.eventResult) {
  global.mongoDbClient = createMongoClient();
}

export const db = global.mongoDbClient;

export default db;
