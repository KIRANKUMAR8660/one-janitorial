import mongoose from 'mongoose';

const workflowLogSchema = new mongoose.Schema({
  workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow' },
  execution: { type: mongoose.Schema.Types.ObjectId, ref: 'Execution' },
  nodeId: { type: String },
  nodeType: { type: String },
  level: { type: String, enum: ['info', 'warning', 'error'], default: 'info' },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model('WorkflowLog', workflowLogSchema);
