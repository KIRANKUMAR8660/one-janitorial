import mongoose from 'mongoose';

const expectationSchema = new mongoose.Schema({
  metricName: String,
  targetValue: String,
  actualValue: String,
  status: { type: String, enum: ['Met', 'Not Met', 'Pending'], default: 'Pending' }
});

const performanceRecordSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recordDate: { type: Date, default: Date.now },
  coachingLogs: [{
    topic: String,
    discussionNotes: String,
    actionItems: String,
    timestamp: { type: Date, default: Date.now }
  }],
  expectations: [expectationSchema],
  escalationLevel: { type: Number, default: 0 },
  trainingVerified: { type: Boolean, default: false },
  kpis: {
    talkTimeSeconds: { type: Number, default: 0 },
    callsMade: { type: Number, default: 0 },
    leadsClosed: { type: Number, default: 0 },
    ticketsResolved: { type: Number, default: 0 }
  },
  documentationPackageUrl: String
}, { timestamps: true });

export default mongoose.model('PerformanceRecord', performanceRecordSchema);
