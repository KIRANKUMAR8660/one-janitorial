import mongoose from 'mongoose';

const processMiningSchema = new mongoose.Schema({
  activityName: { type: String, required: true },
  count: { type: Number, default: 0 },
  duplicateActionsCount: { type: Number, default: 0 },
  avgDurationMs: { type: Number, default: 0 },
  bottleneckLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  recommendation: { type: String }
}, { timestamps: true });

export default mongoose.model('ProcessMining', processMiningSchema);
