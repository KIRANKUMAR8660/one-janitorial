import mongoose from 'mongoose';

const chatbotFeedbackSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  rating: { type: String, enum: ['Thumbs Up', 'Thumbs Down'], required: true },
  isIncorrect: { type: Boolean, default: false },
  missingSopReported: { type: Boolean, default: false },
  sopTopic: String,
  escalated: { type: Boolean, default: false },
  escalatedTicket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', default: null },
  resolved: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('ChatbotFeedback', chatbotFeedbackSchema);
