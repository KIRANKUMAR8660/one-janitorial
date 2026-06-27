import mongoose from 'mongoose';

const sharedReportSchema = new mongoose.Schema({
  dashboardId: { type: mongoose.Schema.Types.ObjectId, ref: 'AnalyticsDashboard', required: true },
  shareType: { type: String, enum: ['Public', 'Private'], default: 'Public' },
  passwordHash: { type: String }, // Optional password protection
  expiryDate: { type: Date },
  shareUrl: { type: String, required: true },
  views: { type: Number, default: 0 },
  roleAccess: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('SharedReport', sharedReportSchema);
