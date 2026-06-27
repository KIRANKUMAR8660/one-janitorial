import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  interviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scheduledAt: Date,
  evaluationRating: Number,
  evaluationNotes: String,
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' }
});

const applicantSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  resumePath: String,
  appliedDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Applied', 'AI Screened', 'Interview Scheduled', 'Reference Check', 'Offer Extended', 'Accepted', 'Rejected'],
    default: 'Applied'
  },
  aiScreeningQuestions: [{
    question: String,
    answer: String,
    score: Number,
    analysis: String
  }],
  interviews: [interviewSchema],
  referenceCheckDetails: String,
  offerLetterSent: { type: Boolean, default: false },
  offerLetterPath: String,
  rankingScore: { type: Number, default: 0 }
});

const jobPostingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  department: String,
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  applicants: [applicantSchema]
}, { timestamps: true });

export default mongoose.model('JobPosting', jobPostingSchema);
