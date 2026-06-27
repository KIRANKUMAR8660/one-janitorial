import mongoose from 'mongoose';

const meetingAttendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Excused'], default: 'Absent' }
}, { _id: false });

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  scheduledTime: { type: Date, required: true },
  durationMinutes: { type: Number, default: 30 },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  meetingType: { type: String, enum: ['Google Meet', 'Microsoft Teams', 'Zoom', 'Custom'], default: 'Google Meet' },
  googleMeetLink: String, // Serves as the meeting URL for Zoom/Teams too
  meetingNotes: String,
  coachingNotes: String,
  recordingUrl: String,
  aiSummary: String,
  transcriptText: String,
  status: { type: String, enum: ['Upcoming', 'In Progress', 'Completed', 'Cancelled'], default: 'Upcoming' },
  attendance: [meetingAttendanceSchema],
  followUpTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
}, { timestamps: true });

export default mongoose.model('Meeting', meetingSchema);
