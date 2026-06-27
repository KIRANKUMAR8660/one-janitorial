import mongoose from 'mongoose';

const workflowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  nodes: { type: Array, default: [] }, // Array of React Flow nodes
  edges: { type: Array, default: [] }, // Array of React Flow edges
  isActive: { type: Boolean, default: false },
  version: { type: Number, default: 1 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Workflow', workflowSchema);
