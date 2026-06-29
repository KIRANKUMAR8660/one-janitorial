import mongoose from 'mongoose';

const meetingLabelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  color: { type: String, default: '#845EC2' },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

export default mongoose.model('MeetingLabel', meetingLabelSchema);
