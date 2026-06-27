import mongoose from 'mongoose';

const coachingReportSchema = new mongoose.Schema({
  department: { type: String, enum: ['Sales', 'HR', 'Customer Service', 'BCO', 'Management'], required: true },
  reportType: { type: String, enum: ['Daily', 'Weekly', 'Monthly'], required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  strengths: [String],
  weaknesses: [String],
  coachingSuggestions: [String],
  riskFactors: [String],
  improvementPlan: String,
  dateGenerated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('CoachingReport', coachingReportSchema);
