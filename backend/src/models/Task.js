import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const taskHistorySchema = new mongoose.Schema({
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  field: String,
  oldValue: String,
  newValue: String,
  timestamp: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  status: { type: String, enum: ['Todo', 'In Progress', 'Review', 'Done'], default: 'Todo' },
  dueDate: Date,
  isRecurring: { type: Boolean, default: false },
  recurrenceRule: {
    frequency: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'None'], default: 'None' },
    interval: { type: Number, default: 1 }
  },
  comments: [commentSchema],
  attachments: [{
    fileName: String,
    filePath: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  history: [taskHistorySchema],
  notificationsSent: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
