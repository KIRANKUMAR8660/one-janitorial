import mongoose from 'mongoose';

const analyticsLogSchema = new mongoose.Schema({
  type: { type: String, enum: ['Query', 'Upload', 'Download', 'Share', 'Job', 'Error'], required: true },
  datasetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset' },
  dashboardId: { type: mongoose.Schema.Types.ObjectId, ref: 'AnalyticsDashboard' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details: { type: mongoose.Schema.Types.Mixed, default: {} }, // e.g. { queryDurationMs: 120, fileSize: 1024 }
  status: { type: String, enum: ['Success', 'Failed'], required: true }
}, { timestamps: true });

export default mongoose.model('AnalyticsLog', analyticsLogSchema);
