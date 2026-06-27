import mongoose from 'mongoose';

const auditRecordSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorEmail: String,
  entityId: String,
  entityType: String,
  agentName: String,
  workflowName: String,
  oldValue: String,
  newValue: String,
  reason: String
}, { timestamps: true });

export default mongoose.model('AuditRecord', auditRecordSchema);
