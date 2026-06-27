import mongoose from 'mongoose';

const syncHistorySchema = new mongoose.Schema({
  lastSync: { type: Date, default: Date.now },
  syncHealthScore: { type: Number, default: 100 },
  contactsCount: { type: Number, default: 0 },
  companiesCount: { type: Number, default: 0 },
  dealsCount: { type: Number, default: 0 },
  ticketsCount: { type: Number, default: 0 },
  activitiesCount: { type: Number, default: 0 },
  notesCount: { type: Number, default: 0 },
  tasksCount: { type: Number, default: 0 },
  failedSyncsCount: { type: Number, default: 0 },
  retryQueue: [{
    entityId: String,
    entityType: { type: String, enum: ['Contact', 'Company', 'Deal', 'Ticket', 'Activity', 'Note', 'Task'] },
    action: String,
    error: String,
    retries: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
  }],
  webhookErrors: [{
    event: String,
    error: String,
    timestamp: { type: Date, default: Date.now }
  }],
  duplicates: [{
    entityId1: String,
    entityId2: String,
    entityType: String,
    matchScore: Number
  }],
  missingRecords: [{
    entityId: String,
    entityType: String,
    reason: String
  }]
}, { timestamps: true });

export default mongoose.model('SyncHistory', syncHistorySchema);
