import { Model } from 'mongoose';
import { connectToDatabase } from './mongodb';
import { models } from '@/models';

// Relationship mappings for nested `include`
const RELATIONS: Record<
  string,
  Record<string, { model: string; foreignKey: string; localKey?: string; isArray?: boolean }>
> = {
  User: {
    role: { model: 'Role', foreignKey: '_id', localKey: 'roleId' },
    referee: { model: 'Referee', foreignKey: '_id', localKey: 'refereeId' },
  },
  Role: {
    users: { model: 'User', foreignKey: 'roleId', isArray: true },
  },
  CricketTeam: {
    club: { model: 'Club', foreignKey: '_id', localKey: 'clubId' },
    participants: { model: 'MatchParticipant', foreignKey: 'cricketTeamId', isArray: true },
  },
  BgmiTeam: {
    club: { model: 'Club', foreignKey: '_id', localKey: 'clubId' },
  },
  Club: {
    players: { model: 'Player', foreignKey: 'clubId', isArray: true },
    cricketTeams: { model: 'CricketTeam', foreignKey: 'clubId', isArray: true },
    pointsHistory: { model: 'PointsHistory', foreignKey: 'clubId', isArray: true },
    leaderboardEntries: { model: 'LeaderboardEntry', foreignKey: 'clubId', isArray: true },
  },
  Player: {
    club: { model: 'Club', foreignKey: '_id', localKey: 'clubId' },
    sports: { model: 'PlayerSport', foreignKey: 'playerId', isArray: true },
    performances: { model: 'PlayerPerformance', foreignKey: 'playerId', isArray: true },
  },
  PlayerSport: {
    player: { model: 'Player', foreignKey: '_id', localKey: 'playerId' },
    sport: { model: 'Sport', foreignKey: '_id', localKey: 'sportId' },
  },
  Referee: {
    sports: { model: 'RefereeSport', foreignKey: 'refereeId', isArray: true },
    matches: { model: 'MatchReferee', foreignKey: 'refereeId', isArray: true },
    results: { model: 'MatchResult', foreignKey: 'submittedByRefereeId', isArray: true },
    user: { model: 'User', foreignKey: 'refereeId' },
  },
  RefereeSport: {
    referee: { model: 'Referee', foreignKey: '_id', localKey: 'refereeId' },
    sport: { model: 'Sport', foreignKey: '_id', localKey: 'sportId' },
  },
  Match: {
    sport: { model: 'Sport', foreignKey: '_id', localKey: 'sportId' },
    venue: { model: 'Venue', foreignKey: '_id', localKey: 'venueId' },
    participants: { model: 'MatchParticipant', foreignKey: 'matchId', isArray: true },
    referees: { model: 'MatchReferee', foreignKey: 'matchId', isArray: true },
    results: { model: 'MatchResult', foreignKey: 'matchId', isArray: true },
    distributions: { model: 'PointsDistribution', foreignKey: 'matchId', isArray: true },
    pointsHistory: { model: 'PointsHistory', foreignKey: 'matchId', isArray: true },
    starPlayer: { model: 'Player', foreignKey: '_id', localKey: 'starPlayerId' },
    playerPerformances: { model: 'PlayerPerformance', foreignKey: 'matchId', isArray: true },
  },
  MatchParticipant: {
    match: { model: 'Match', foreignKey: '_id', localKey: 'matchId' },
    club: { model: 'Club', foreignKey: '_id', localKey: 'clubId' },
    player: { model: 'Player', foreignKey: '_id', localKey: 'playerId' },
    cricketTeam: { model: 'CricketTeam', foreignKey: '_id', localKey: 'cricketTeamId' },
    players: { model: 'MatchParticipantPlayer', foreignKey: 'participantId', isArray: true },
    distributions: { model: 'PointsDistribution', foreignKey: 'participantId', isArray: true },
  },
  MatchParticipantPlayer: {
    participant: { model: 'MatchParticipant', foreignKey: '_id', localKey: 'participantId' },
    player: { model: 'Player', foreignKey: '_id', localKey: 'playerId' },
    club: { model: 'Club', foreignKey: '_id', localKey: 'clubId' },
  },
  MatchReferee: {
    match: { model: 'Match', foreignKey: '_id', localKey: 'matchId' },
    referee: { model: 'Referee', foreignKey: '_id', localKey: 'refereeId' },
  },
  MatchResult: {
    match: { model: 'Match', foreignKey: '_id', localKey: 'matchId' },
    referee: { model: 'Referee', foreignKey: '_id', localKey: 'submittedByRefereeId' },
    starPlayer: { model: 'Player', foreignKey: '_id', localKey: 'starPlayerId' },
  },
  PlayerPerformance: {
    match: { model: 'Match', foreignKey: '_id', localKey: 'matchId' },
    player: { model: 'Player', foreignKey: '_id', localKey: 'playerId' },
    sport: { model: 'Sport', foreignKey: '_id', localKey: 'sportId' },
    club: { model: 'Club', foreignKey: '_id', localKey: 'clubId' },
  },
  PointsDistribution: {
    match: { model: 'Match', foreignKey: '_id', localKey: 'matchId' },
    participant: { model: 'MatchParticipant', foreignKey: '_id', localKey: 'participantId' },
    sport: { model: 'Sport', foreignKey: '_id', localKey: 'sportId' },
    allocations: { model: 'ClubPointAllocation', foreignKey: 'distributionId', isArray: true },
  },
  ClubPointAllocation: {
    distribution: { model: 'PointsDistribution', foreignKey: '_id', localKey: 'distributionId' },
    club: { model: 'Club', foreignKey: '_id', localKey: 'clubId' },
  },
  PointsHistory: {
    club: { model: 'Club', foreignKey: '_id', localKey: 'clubId' },
    sport: { model: 'Sport', foreignKey: '_id', localKey: 'sportId' },
    match: { model: 'Match', foreignKey: '_id', localKey: 'matchId' },
    distribution: { model: 'PointsDistribution', foreignKey: '_id', localKey: 'distributionId' },
  },
  LeaderboardEntry: {
    club: { model: 'Club', foreignKey: '_id', localKey: 'clubId' },
  },
  AwardAllocation: {
    match: { model: 'Match', foreignKey: '_id', localKey: 'matchId' },
    sport: { model: 'Sport', foreignKey: '_id', localKey: 'sportId' },
    player: { model: 'Player', foreignKey: '_id', localKey: 'playerId' },
    club: { model: 'Club', foreignKey: '_id', localKey: 'clubId' },
  },
  SportScoringRule: {
    sport: { model: 'Sport', foreignKey: '_id', localKey: 'sportId' },
  },
  AuditLog: {
    user: { model: 'User', foreignKey: '_id', localKey: 'userId' },
  },
};

// Helper: Convert Prisma WHERE filter to MongoDB query filter
function transformWhere(where: any): any {
  if (!where || typeof where !== 'object') return {};

  const mongoQuery: any = {};

  for (const [key, val] of Object.entries(where)) {
    if (key === 'id') {
      if (typeof val === 'object' && val !== null) {
        if ('in' in val) mongoQuery._id = { $in: (val as any).in };
        else mongoQuery._id = val;
      } else {
        mongoQuery._id = val;
      }
      continue;
    }

    if (key === 'OR' && Array.isArray(val)) {
      mongoQuery.$or = val.map(transformWhere);
      continue;
    }

    if (key === 'AND' && Array.isArray(val)) {
      mongoQuery.$and = val.map(transformWhere);
      continue;
    }

    if (key === 'NOT') {
      mongoQuery.$nor = Array.isArray(val) ? val.map(transformWhere) : [transformWhere(val)];
      continue;
    }

    // Handle composite unique keys e.g. clubId_sportId or refereeId_sportId
    if (key.includes('_') && typeof val === 'object' && val !== null && !Array.isArray(val)) {
      const parts = key.split('_');
      let isComposite = true;
      for (const p of parts) {
        if (p in val) {
          mongoQuery[p] = (val as any)[p];
        } else {
          isComposite = false;
        }
      }
      if (isComposite) continue;
    }

    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      const subKeys = Object.keys(val);
      if (subKeys.includes('in')) {
        mongoQuery[key] = { $in: (val as any).in };
      } else if (subKeys.includes('notIn')) {
        mongoQuery[key] = { $nin: (val as any).notIn };
      } else if (subKeys.includes('contains')) {
        mongoQuery[key] = { $regex: (val as any).contains, $options: 'i' };
      } else if (subKeys.includes('startsWith')) {
        mongoQuery[key] = { $regex: `^${(val as any).startsWith}`, $options: 'i' };
      } else if (subKeys.includes('equals')) {
        mongoQuery[key] = (val as any).equals;
      } else if (subKeys.includes('gt')) {
        mongoQuery[key] = { $gt: (val as any).gt };
      } else if (subKeys.includes('gte')) {
        mongoQuery[key] = { $gte: (val as any).gte };
      } else if (subKeys.includes('lt')) {
        mongoQuery[key] = { $lt: (val as any).lt };
      } else if (subKeys.includes('lte')) {
        mongoQuery[key] = { $lte: (val as any).lte };
      } else if (subKeys.includes('some')) {
        // Nested relation filter: handled at app level or simple field check
        mongoQuery[key] = { $exists: true };
      } else {
        mongoQuery[key] = val;
      }
    } else {
      mongoQuery[key] = val;
    }
  }

  return mongoQuery;
}

// Helper: Convert Prisma ORDER BY to MongoDB sort
function transformOrderBy(orderBy: any): any {
  if (!orderBy) return {};
  const sort: any = {};

  if (Array.isArray(orderBy)) {
    for (const item of orderBy) {
      for (const [k, v] of Object.entries(item)) {
        sort[k === 'id' ? '_id' : k] = v === 'desc' ? -1 : 1;
      }
    }
  } else if (typeof orderBy === 'object') {
    for (const [k, v] of Object.entries(orderBy)) {
      sort[k === 'id' ? '_id' : k] = v === 'desc' ? -1 : 1;
    }
  }

  return sort;
}

// Populate nested includes for a list of documents
async function populateIncludes(modelName: string, docs: any[], include: any): Promise<any[]> {
  if (!include || docs.length === 0) return docs;
  const rels = RELATIONS[modelName] || {};

  for (const [relKey, includeVal] of Object.entries(include)) {
    if (!includeVal) continue;
    const relDef = rels[relKey];
    if (!relDef) continue;

    const TargetModel = models[relDef.model];
    if (!TargetModel) continue;

    const subInclude = typeof includeVal === 'object' && 'include' in includeVal ? (includeVal as any).include : null;
    const subOrderBy = typeof includeVal === 'object' && 'orderBy' in includeVal ? (includeVal as any).orderBy : null;

    for (const doc of docs) {
      if (relDef.isArray) {
        const query: any = { [relDef.foreignKey]: doc.id || doc._id };
        let q = TargetModel.find(query);
        if (subOrderBy) q = q.sort(transformOrderBy(subOrderBy));
        let results = (await q.lean({ virtuals: true })) as any[];
        results = results.map((r) => ({ ...r, id: r._id }));

        if (subInclude) {
          results = await populateIncludes(relDef.model, results, subInclude);
        }
        doc[relKey] = results;
      } else {
        const lookupVal = relDef.localKey ? doc[relDef.localKey] : doc.id || doc._id;
        if (!lookupVal) {
          doc[relKey] = null;
          continue;
        }
        const query: any = { [relDef.foreignKey]: lookupVal };
        const found = await TargetModel.findOne(query).lean({ virtuals: true });
        if (found) {
          let item = { ...found, id: (found as any)._id };
          if (subInclude) {
            const populated = await populateIncludes(relDef.model, [item], subInclude);
            item = populated[0];
          }
          doc[relKey] = item;
        } else {
          doc[relKey] = null;
        }
      }
    }
  }

  return docs;
}

// Create a collection delegate for a model
export function createCollectionDelegate(modelName: string) {
  const getMongooseModel = () => (models as any)[modelName];

  return {
    async findMany(args?: { where?: any; orderBy?: any; include?: any; select?: any; take?: number; skip?: number }) {
      await connectToDatabase();
      const ModelClass = getMongooseModel();
      const filter = transformWhere(args?.where);
      let query = ModelClass.find(filter);

      if (args?.orderBy) query = query.sort(transformOrderBy(args.orderBy));
      if (args?.skip) query = query.skip(args.skip);
      if (args?.take) query = query.limit(args.take);

      let docs = (await query.lean({ virtuals: true })) as any[];
      docs = docs.map((d) => ({ ...d, id: d._id }));

      if (args?.include) {
        docs = await populateIncludes(modelName, docs, args.include);
      }

      return docs;
    },

    async findUnique(args: { where: any; include?: any }) {
      await connectToDatabase();
      const ModelClass = getMongooseModel();
      const filter = transformWhere(args.where);
      const doc = await ModelClass.findOne(filter).lean({ virtuals: true });
      if (!doc) return null;

      let item = { ...doc, id: (doc as any)._id };
      if (args.include) {
        const populated = await populateIncludes(modelName, [item], args.include);
        item = populated[0];
      }
      return item;
    },

    async findFirst(args?: { where?: any; orderBy?: any; include?: any }) {
      await connectToDatabase();
      const ModelClass = getMongooseModel();
      const filter = transformWhere(args?.where);
      let query = ModelClass.findOne(filter);
      if (args?.orderBy) query = query.sort(transformOrderBy(args.orderBy));

      const doc = await query.lean({ virtuals: true });
      if (!doc) return null;

      let item = { ...doc, id: (doc as any)._id };
      if (args?.include) {
        const populated = await populateIncludes(modelName, [item], args.include);
        item = populated[0];
      }
      return item;
    },

    async create(args: { data: any; include?: any }) {
      await connectToDatabase();
      const ModelClass = getMongooseModel();
      const payload = { ...args.data };
      if (payload.id && !payload._id) {
        payload._id = payload.id;
      }
      const created = await ModelClass.create(payload);
      let item = created.toJSON();

      if (args.include) {
        const populated = await populateIncludes(modelName, [item], args.include);
        item = populated[0];
      }
      return item;
    },

    async createMany(args: { data: any[] }) {
      await connectToDatabase();
      const ModelClass = getMongooseModel();
      const items = args.data.map((d) => {
        const clone = { ...d };
        if (clone.id && !clone._id) clone._id = clone.id;
        return clone;
      });
      const result = await ModelClass.insertMany(items);
      return { count: result.length };
    },

    async update(args: { where: any; data: any; include?: any }) {
      await connectToDatabase();
      const ModelClass = getMongooseModel();
      const filter = transformWhere(args.where);

      // Handle increment/decrement if specified
      const updateData: any = {};
      const incData: any = {};

      for (const [k, v] of Object.entries(args.data)) {
        if (typeof v === 'object' && v !== null && 'increment' in v) {
          incData[k] = (v as any).increment;
        } else if (typeof v === 'object' && v !== null && 'decrement' in v) {
          incData[k] = -(v as any).decrement;
        } else {
          updateData[k] = v;
        }
      }

      const mongoUpdate: any = { $set: updateData };
      if (Object.keys(incData).length > 0) {
        mongoUpdate.$inc = incData;
      }

      const updated = await ModelClass.findOneAndUpdate(filter, mongoUpdate, {
        new: true,
        strict: false,
      }).lean({ virtuals: true });

      if (!updated) return null;
      let item = { ...updated, id: (updated as any)._id };

      if (args.include) {
        const populated = await populateIncludes(modelName, [item], args.include);
        item = populated[0];
      }
      return item;
    },

    async updateMany(args: { where?: any; data: any }) {
      await connectToDatabase();
      const ModelClass = getMongooseModel();
      const filter = transformWhere(args?.where);
      const res = await ModelClass.updateMany(filter, { $set: args.data });
      return { count: res.modifiedCount };
    },

    async delete(args: { where: any }) {
      await connectToDatabase();
      const ModelClass = getMongooseModel();
      const filter = transformWhere(args.where);
      const doc = await ModelClass.findOneAndDelete(filter).lean({ virtuals: true });
      return doc ? { ...doc, id: (doc as any)._id } : null;
    },

    async deleteMany(args?: { where?: any }) {
      await connectToDatabase();
      const ModelClass = getMongooseModel();
      const filter = transformWhere(args?.where);
      const res = await ModelClass.deleteMany(filter);
      return { count: res.deletedCount };
    },

    async upsert(args: { where: any; update: any; create: any; include?: any }) {
      await connectToDatabase();
      const ModelClass = getMongooseModel();
      const filter = transformWhere(args.where);
      const existing = await ModelClass.findOne(filter);

      if (existing) {
        const updated = await ModelClass.findOneAndUpdate(filter, { $set: args.update }, { new: true, strict: false }).lean({
          virtuals: true,
        });
        let item = { ...updated, id: (updated as any)._id };
        if (args.include) {
          const populated = await populateIncludes(modelName, [item], args.include);
          item = populated[0];
        }
        return item;
      } else {
        const payload = { ...args.create };
        if (payload.id && !payload._id) payload._id = payload.id;
        const created = await ModelClass.create(payload);
        let item = created.toJSON();
        if (args.include) {
          const populated = await populateIncludes(modelName, [item], args.include);
          item = populated[0];
        }
        return item;
      }
    },

    async count(args?: { where?: any }) {
      await connectToDatabase();
      const ModelClass = getMongooseModel();
      const filter = transformWhere(args?.where);
      return await ModelClass.countDocuments(filter);
    },
  };
}

// Build the complete database client replacing Prisma
export function createMongoClient() {
  const client: any = {
    role: createCollectionDelegate('Role'),
    user: createCollectionDelegate('User'),
    club: createCollectionDelegate('Club'),
    cricketTeam: createCollectionDelegate('CricketTeam'),
    bgmiTeam: createCollectionDelegate('BgmiTeam'),
    eventResult: createCollectionDelegate('EventResult'),
    doublesTeam: createCollectionDelegate('DoublesTeam'),
    sport: createCollectionDelegate('Sport'),
    player: createCollectionDelegate('Player'),
    playerSport: createCollectionDelegate('PlayerSport'),
    referee: createCollectionDelegate('Referee'),
    refereeSport: createCollectionDelegate('RefereeSport'),
    venue: createCollectionDelegate('Venue'),
    match: createCollectionDelegate('Match'),
    matchParticipant: createCollectionDelegate('MatchParticipant'),
    matchParticipantPlayer: createCollectionDelegate('MatchParticipantPlayer'),
    matchReferee: createCollectionDelegate('MatchReferee'),
    matchResult: createCollectionDelegate('MatchResult'),
    playerPerformance: createCollectionDelegate('PlayerPerformance'),
    pointsDistribution: createCollectionDelegate('PointsDistribution'),
    clubPointAllocation: createCollectionDelegate('ClubPointAllocation'),
    scoreEntry: createCollectionDelegate('ScoreEntry'),
    pointsHistory: createCollectionDelegate('PointsHistory'),
    leaderboardEntry: createCollectionDelegate('LeaderboardEntry'),
    registration: createCollectionDelegate('Registration'),
    googleIntegration: createCollectionDelegate('GoogleIntegration'),
    synchronizationLog: createCollectionDelegate('SynchronizationLog'),
    notification: createCollectionDelegate('Notification'),
    auditLog: createCollectionDelegate('AuditLog'),
    tournamentSetting: createCollectionDelegate('TournamentSetting'),
    sportScoringRule: createCollectionDelegate('SportScoringRule'),
    awardAllocation: createCollectionDelegate('AwardAllocation'),

    async $transaction(arg: any) {
      if (typeof arg === 'function') {
        return await arg(client);
      }
      if (Array.isArray(arg)) {
        const results = [];
        for (const p of arg) {
          results.push(await p);
        }
        return results;
      }
      return arg;
    },
  };

  return client;
}

