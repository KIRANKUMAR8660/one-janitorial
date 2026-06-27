import mongoose from 'mongoose';

const scheduledJobSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dashboardId: { type: mongoose.Schema.Types.ObjectId, ref: 'AnalyticsDashboard', required: true },
  frequency: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', 'Custom'], required: true },
  cronExpression: { type: String },
  deliveryChannels: [{
    type: { type: String, enum: ['Email', 'Slack', 'Teams', 'Google Drive', 'SharePoint'], required: true },
    config: { type: mongoose.Schema.Types.Mixed, default: {} }
  }],
  status: { type: String, enum: ['Active', 'Paused'], default: 'Active' },
  lastRun: { type: Date },
  nextRun: { type: Date }
}, { timestamps: true });

export default mongoose.model('ScheduledJob', scheduledJobSchema);
