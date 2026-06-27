import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  emoji: String
}, { _id: false });

const readReceiptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  readAt: { type: Date, default: Date.now }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  threadParent: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reactions: [reactionSchema],
  readBy: [readReceiptSchema],
  attachments: [{
    fileName: String,
    filePath: String
  }]
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
