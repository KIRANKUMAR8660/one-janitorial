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
  meetingType: { type: String, enum: ['Google Meet', 'Microsoft Teams', 'Zoom', 'Webex', 'Custom'], default: 'Google Meet' },
  googleMeetLink: String, // Serves as the meeting URL for Zoom/Teams too
  meetingNotes: String,
  coachingNotes: String,
  recordingUrl: String,
  aiSummary: String,
  transcriptText: String,
  status: { type: String, enum: ['Upcoming', 'In Progress', 'Completed', 'Cancelled'], default: 'Upcoming' },
  attendance: [meetingAttendanceSchema],
  followUpTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],

  // Phase 2 meeting schema fields
  label: { type: mongoose.Schema.Types.ObjectId, ref: 'MeetingLabel' },
  meetingDate: Date,
  startTime: String,
  endTime: String,
  timeZone: { type: String, default: 'EST' },
  meetingPlatform: { type: String, enum: ['Google Meet', 'Microsoft Teams', 'Zoom', 'Webex', 'Custom'], default: 'Google Meet' },
  meetingUrl: String,
  meetingPassword: { type: String, default: '' },
  agenda: String,
  notes: String,
  attachments: [String],
  reminderTime: { type: Number, default: 15 },
  meetingCategory: { type: String, default: 'Alignment' },
  department: { type: String, default: 'Operations' }
}, { timestamps: true });

export default mongoose.model('Meeting', meetingSchema);
