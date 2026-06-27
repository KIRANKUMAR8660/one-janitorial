import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true }, // e.g. LOGIN_SUCCESS, TICKET_ESCALATED
  module: { type: String, required: true }, // e.g. Authentication, Ticketing
  details: String,
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);
