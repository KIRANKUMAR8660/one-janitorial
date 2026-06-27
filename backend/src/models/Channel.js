import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['Channel', 'Room', 'DirectMessage'], default: 'Channel' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPrivate: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Channel', channelSchema);
