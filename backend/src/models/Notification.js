import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['TaskDue', 'TicketAging', 'LeadInactivity', 'AgentFailure', 'Escalation', 'General'],
    default: 'General'
  },
  channels: [{
    type: String,
    enum: ['In-App', 'Email', 'SMS', 'Push']
  }],
  status: { type: String, enum: ['Unread', 'Read'], default: 'Unread' }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
