import mongoose from 'mongoose';

const clientLogSchema = new mongoose.Schema({
  sender: String,
  recipient: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  clientEmail: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Open', 'In Progress', 'Pending', 'Closed'], default: 'Open' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  ticketType: { type: String, enum: ['Billing', 'Service Complaint', 'Rescheduling', 'General Inquiry'], default: 'General Inquiry' },
  slaDueDate: { type: Date, required: true },
  escalationLevel: { type: Number, default: 0 },
  masterNotes: String,
  communicationLogs: [clientLogSchema],
  warningsSent: { type: Boolean, default: false },
  surveySent: { type: Boolean, default: false },
  surveyRating: Number
}, { timestamps: true });

export default mongoose.model('Ticket', ticketSchema);
