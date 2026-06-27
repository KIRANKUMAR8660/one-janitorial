import mongoose from 'mongoose';

const executionSchema = new mongoose.Schema({
  workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
  status: { type: String, enum: ['Pending', 'Running', 'Completed', 'Failed'], default: 'Pending' },
  triggerNodeId: { type: String },
  triggerData: { type: mongoose.Schema.Types.Mixed },
  nodeStates: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }, // nodeId -> { status, output, error, startedAt, endedAt }
  executionPath: [{ type: String }],
  errorMessage: { type: String },
  durationMs: { type: Number },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Execution', executionSchema);
