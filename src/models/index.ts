import mongoose, { Schema, Model, Document } from 'mongoose';
import { randomUUID } from 'crypto';

// Helper to configure schema with id alias
function createSchema(definition: any, options: any = {}) {
  const schema = new Schema(
    {
      _id: { type: String, default: () => randomUUID() },
      ...definition,
    },
    {
      timestamps: true,
      strict: false,
      toJSON: {
        virtuals: true,
        transform: (_doc, ret) => {
          ret.id = ret._id;
          delete ret.__v;
          return ret;
        },
      },
      toObject: {
        virtuals: true,
        transform: (_doc, ret) => {
          ret.id = ret._id;
          delete ret.__v;
          return ret;
        },
      },
      ...options,
    }
  );

  schema.virtual('id').get(function () {
    return this._id;
  });

  return schema;
}

// 1. Role
const RoleSchema = createSchema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
});

// 2. User
const UserSchema = createSchema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  roleId: { type: String, required: true },
  refereeId: { type: String, sparse: true },
  status: { type: String, default: 'ACTIVE' },
});

// 3. Club
const ClubSchema = createSchema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  logoUrl: { type: String },
  captainName: { type: String },
  viceCaptainName: { type: String },
  status: { type: String, default: 'ACTIVE' },
  totalPoints: { type: Number, default: 0.0 },
  currentRank: { type: Number, default: 0 },
});

// 4. CricketTeam
const CricketTeamSchema = createSchema({
  name: { type: String, required: true, unique: true },
  clubId: { type: String, required: true },
  captainName: { type: String },
  status: { type: String, default: 'ACTIVE' },
});

// 5. Sport
const SportSchema = createSchema({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  icon: { type: String },
  sportType: { type: String, default: 'TEAM' },
  genderCategory: { type: String, default: 'OPEN' },
  maxParticipants: { type: Number, default: 4 },
  tournamentFormat: { type: String, default: 'TOURNAMENT' },
  numRounds: { type: Number, default: 3 },
  scoringConfig: { type: String, default: '{}' },
  pointsDistribution: { type: String, default: '{}' },
  allowsMixedClubs: { type: Boolean, default: false },
  pointsEntryMethod: { type: String, default: 'BOTH' },
  positionPoints: { type: String },
  status: { type: String, default: 'ACTIVE' },
  subCategories: { type: [String], default: [] },
});

// 6. Player
const PlayerSchema = createSchema({
  registrationId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  gender: { type: String },
  age: { type: Number },
  clubId: { type: String, required: true },
  teamName: { type: String },
  registrationDate: { type: Date, default: Date.now },
  status: { type: String, default: 'APPROVED' },
  paymentStatus: { type: String, default: 'PAID' },
  totalPerformancePoints: { type: Number, default: 0 },
  starPlayerCount: { type: Number, default: 0 },
});

// 7. PlayerSport
const PlayerSportSchema = createSchema({
  playerId: { type: String, required: true },
  sportId: { type: String, required: true },
});
PlayerSportSchema.index({ playerId: 1, sportId: 1 }, { unique: true });

// 8. Referee
const RefereeSchema = createSchema({
  refereeCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  availability: { type: String, default: 'AVAILABLE' },
  status: { type: String, default: 'ACTIVE' },
});

// 9. RefereeSport
const RefereeSportSchema = createSchema({
  refereeId: { type: String, required: true },
  sportId: { type: String, required: true },
});
RefereeSportSchema.index({ refereeId: 1, sportId: 1 }, { unique: true });

// 10. Venue
const VenueSchema = createSchema({
  name: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  capacity: { type: Number },
  status: { type: String, default: 'ACTIVE' },
});

// 11. Match
const MatchSchema = createSchema({
  matchCode: { type: String, required: true, unique: true },
  sportId: { type: String, required: true },
  round: { type: String, required: true },
  stageName: { type: String },
  matchCategory: { type: String, default: 'Singles' },
  matchDate: { type: String, required: true },
  matchTime: { type: String, required: true },
  venueId: { type: String },
  status: { type: String, default: 'SCHEDULED' },
  notes: { type: String },
  starPlayerId: { type: String },
  starPlayerPoints: { type: Number, default: 0 },
});

// 12. MatchParticipant
const MatchParticipantSchema = createSchema({
  matchId: { type: String, required: true },
  clubId: { type: String },
  playerId: { type: String },
  cricketTeamId: { type: String },
  teamName: { type: String },
  score: { type: Number, default: 0.0 },
  scoreDetail: { type: String },
  isWinner: { type: Boolean, default: false },
  rank: { type: Number },
});

// 13. MatchParticipantPlayer
const MatchParticipantPlayerSchema = createSchema({
  participantId: { type: String, required: true },
  playerId: { type: String, required: true },
  clubId: { type: String, required: true },
});
MatchParticipantPlayerSchema.index({ participantId: 1, playerId: 1 }, { unique: true });

// 14. MatchReferee
const MatchRefereeSchema = createSchema({
  matchId: { type: String, required: true },
  refereeId: { type: String, required: true },
});
MatchRefereeSchema.index({ matchId: 1, refereeId: 1 }, { unique: true });

// 15. MatchResult
const MatchResultSchema = createSchema({
  matchId: { type: String, required: true },
  submittedByRefereeId: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  winnerParticipantId: { type: String },
  winnerClubId: { type: String },
  scoresSummary: { type: String, required: true },
  refereeNotes: { type: String },
  starPlayerId: { type: String },
  starPlayerPoints: { type: Number, default: 0 },
  status: { type: String, default: 'PENDING_APPROVAL' },
  approvedByUserId: { type: String },
  approvedAt: { type: Date },
  disputeReason: { type: String },
  rejectionReason: { type: String },
});

// 15B. PlayerPerformance (Individual Star Player & Performance Tracking)
const PlayerPerformanceSchema = createSchema({
  matchId: { type: String, required: true },
  playerId: { type: String, required: true },
  sportId: { type: String, required: true },
  clubId: { type: String, required: true },
  teamName: { type: String },
  isStarPlayer: { type: Boolean, default: true },
  performancePoints: { type: Number, required: true, default: 0 },
  status: { type: String, default: 'PENDING_APPROVAL' },
  awardedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  approvedByUserId: { type: String },
});
PlayerPerformanceSchema.index({ matchId: 1, playerId: 1 });

// 16. PointsDistribution
const PointsDistributionSchema = createSchema({
  matchId: { type: String, required: true },
  participantId: { type: String, required: true },
  sportId: { type: String, required: true },
  originalPoints: { type: Number, required: true },
  uniqueClubCount: { type: Number, required: true },
  calculationNote: { type: String },
  status: { type: String, default: 'PENDING_APPROVAL' },
  submittedByRefereeId: { type: String },
  approvedByUserId: { type: String },
  rejectionReason: { type: String },
  approvedAt: { type: Date },
});

// 17. ClubPointAllocation
const ClubPointAllocationSchema = createSchema({
  distributionId: { type: String, required: true },
  clubId: { type: String, required: true },
  points: { type: Number, required: true },
  playersContributed: { type: Number, default: 1 },
  isRemainderWinner: { type: Boolean, default: false },
});

// 18. ScoreEntry
const ScoreEntrySchema = createSchema({
  matchId: { type: String, required: true },
  participantId: { type: String, required: true },
  setOrHalf: { type: String, required: true },
  scoreValue: { type: Number, default: 0 },
  details: { type: String },
});

// 19. PointsHistory
const PointsHistorySchema = createSchema({
  clubId: { type: String, required: true },
  sportId: { type: String, required: true },
  matchId: { type: String },
  distributionId: { type: String },
  points: { type: Number, required: true },
  reason: { type: String, required: true },
  recordedAt: { type: Date, default: Date.now },
  recordedByUserId: { type: String },
});

// 20. LeaderboardEntry
const LeaderboardEntrySchema = createSchema({
  clubId: { type: String, required: true },
  sportId: { type: String, default: 'OVERALL' },
  rank: { type: Number, default: 1 },
  played: { type: Number, default: 0 },
  won: { type: Number, default: 0 },
  drawn: { type: Number, default: 0 },
  lost: { type: Number, default: 0 },
  points: { type: Number, default: 0.0 },
  scoreDifference: { type: Number, default: 0 },
  gold: { type: Number, default: 0 },
  silver: { type: Number, default: 0 },
  bronze: { type: Number, default: 0 },
});
LeaderboardEntrySchema.index({ clubId: 1, sportId: 1 }, { unique: true });

// 21. Registration
const RegistrationSchema = createSchema({
  submissionId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  gender: { type: String },
  age: { type: Number },
  clubPreference: { type: String, required: true },
  sportsSelected: { type: String, required: true },
  teamName: { type: String },
  rawData: { type: String },
  source: { type: String, default: 'MANUAL' },
  status: { type: String, default: 'PENDING' },
  duplicateOfId: { type: String },
});

// 22. GoogleIntegration
const GoogleIntegrationSchema = createSchema({
  sheetId: { type: String, required: true, unique: true },
  sheetName: { type: String, default: 'Sheet1' },
  range: { type: String, default: 'A1:Z500' },
  apiKeyOrToken: { type: String },
  fieldMapping: { type: String, default: '{}' },
  autoSyncEnabled: { type: Boolean, default: false },
  syncIntervalMinutes: { type: Number, default: 15 },
  lastSyncAt: { type: Date },
  status: { type: String, default: 'CONFIGURED' },
  errorMessage: { type: String },
});

// 23. SynchronizationLog
const SynchronizationLogSchema = createSchema({
  integrationId: { type: String },
  syncType: { type: String, required: true },
  totalFound: { type: Number, default: 0 },
  importedCount: { type: Number, default: 0 },
  duplicateCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  status: { type: String, required: true },
  logDetails: { type: String },
});

// 24. Notification
const NotificationSchema = createSchema({
  recipientRole: { type: String },
  recipientUserId: { type: String },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  link: { type: String },
});

// 25. AuditLog
const AuditLogSchema = createSchema({
  userId: { type: String },
  userName: { type: String },
  role: { type: String },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  recordId: { type: String },
  previousValue: { type: String },
  updatedValue: { type: String },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now },
});

// 26. TournamentSetting
const TournamentSettingSchema = createSchema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  description: { type: String },
});

// Helper to get or create model safely in Next.js hot reloading
function getModel(name: string, schema: Schema): Model<any> {
  if (mongoose.models[name]) {
    delete (mongoose.models as any)[name];
  }
  return mongoose.model<any>(name, schema);
}

export const RoleModel: Model<any> = getModel('Role', RoleSchema);
export const UserModel: Model<any> = getModel('User', UserSchema);
export const ClubModel: Model<any> = getModel('Club', ClubSchema);
export const CricketTeamModel: Model<any> = getModel('CricketTeam', CricketTeamSchema);
export const SportModel: Model<any> = getModel('Sport', SportSchema);
export const PlayerModel: Model<any> = getModel('Player', PlayerSchema);
export const PlayerSportModel: Model<any> = getModel('PlayerSport', PlayerSportSchema);
export const RefereeModel: Model<any> = getModel('Referee', RefereeSchema);
export const RefereeSportModel: Model<any> = getModel('RefereeSport', RefereeSportSchema);
export const VenueModel: Model<any> = getModel('Venue', VenueSchema);
export const MatchModel: Model<any> = getModel('Match', MatchSchema);
export const MatchParticipantModel: Model<any> = getModel('MatchParticipant', MatchParticipantSchema);
export const MatchParticipantPlayerModel: Model<any> = getModel('MatchParticipantPlayer', MatchParticipantPlayerSchema);
export const MatchRefereeModel: Model<any> = getModel('MatchReferee', MatchRefereeSchema);
export const MatchResultModel: Model<any> = getModel('MatchResult', MatchResultSchema);
export const PlayerPerformanceModel: Model<any> = getModel('PlayerPerformance', PlayerPerformanceSchema);
export const PointsDistributionModel: Model<any> = getModel('PointsDistribution', PointsDistributionSchema);
export const ClubPointAllocationModel: Model<any> = getModel('ClubPointAllocation', ClubPointAllocationSchema);
export const ScoreEntryModel: Model<any> = getModel('ScoreEntry', ScoreEntrySchema);
export const PointsHistoryModel: Model<any> = getModel('PointsHistory', PointsHistorySchema);
export const LeaderboardEntryModel: Model<any> = getModel('LeaderboardEntry', LeaderboardEntrySchema);
export const RegistrationModel: Model<any> = getModel('Registration', RegistrationSchema);
export const GoogleIntegrationModel: Model<any> = getModel('GoogleIntegration', GoogleIntegrationSchema);
export const SynchronizationLogModel: Model<any> = getModel('SynchronizationLog', SynchronizationLogSchema);
export const NotificationModel: Model<any> = getModel('Notification', NotificationSchema);
export const AuditLogModel: Model<any> = getModel('AuditLog', AuditLogSchema);
export const TournamentSettingModel: Model<any> = getModel('TournamentSetting', TournamentSettingSchema);

export const models: Record<string, Model<any>> = {
  Role: RoleModel,
  User: UserModel,
  Club: ClubModel,
  CricketTeam: CricketTeamModel,
  Sport: SportModel,
  Player: PlayerModel,
  PlayerSport: PlayerSportModel,
  Referee: RefereeModel,
  RefereeSport: RefereeSportModel,
  Venue: VenueModel,
  Match: MatchModel,
  MatchParticipant: MatchParticipantModel,
  MatchParticipantPlayer: MatchParticipantPlayerModel,
  MatchReferee: MatchRefereeModel,
  MatchResult: MatchResultModel,
  PlayerPerformance: PlayerPerformanceModel,
  PointsDistribution: PointsDistributionModel,
  ClubPointAllocation: ClubPointAllocationModel,
  ScoreEntry: ScoreEntryModel,
  PointsHistory: PointsHistoryModel,
  LeaderboardEntry: LeaderboardEntryModel,
  Registration: RegistrationModel,
  GoogleIntegration: GoogleIntegrationModel,
  SynchronizationLog: SynchronizationLogModel,
  Notification: NotificationModel,
  AuditLog: AuditLogModel,
  TournamentSetting: TournamentSettingModel,
};

