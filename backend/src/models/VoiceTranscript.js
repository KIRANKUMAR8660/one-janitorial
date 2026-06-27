import mongoose from 'mongoose';

const voiceTranscriptSchema = new mongoose.Schema({
  message: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' },
  speaker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  speakerName: String,
  channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
  filePath: String,
  transcription: { type: String, required: true },
  aiSummary: String,
  meetingMinutes: String,
  actionItems: [String],
  durationSeconds: Number,
}, { timestamps: true });

export default mongoose.model('VoiceTranscript', voiceTranscriptSchema);
