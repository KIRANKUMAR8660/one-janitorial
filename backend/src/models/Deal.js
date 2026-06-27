import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  hubspotDealId: String,
  title: { type: String, required: true },
  amount: Number,
  stage: { type: String, required: true, default: 'Appointment Scheduled' }, // e.g. Closed Won
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  clientEmail: String,
  closedDate: Date,
  followUpStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'None'],
    default: 'None'
  },
  followUpSentDate: Date,
  activityLogs: [{
    action: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Deal', dealSchema);
