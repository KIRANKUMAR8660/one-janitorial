import mongoose from 'mongoose';

const integrationAuditSchema = new mongoose.Schema({
  action: { type: String, required: true }, // ROTATE_CREDENTIALS, TOGGLE_STATUS, TEST_CONNECTION, EDIT_CONFIG
  integrationName: { type: String, required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorEmail: { type: String },
  details: { type: String },
  ipAddress: { type: String }
}, { timestamps: true });

export default mongoose.model('IntegrationAudit', integrationAuditSchema);
