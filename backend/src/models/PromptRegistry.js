import mongoose from 'mongoose';

const promptRegistrySchema = new mongoose.Schema({
  name: { type: String, required: true },
  version: { type: Number, default: 1 },
  content: { type: String, required: true },
  provider: { type: String, enum: ['Claude', 'GPT', 'Gemini', 'OpenRouter', 'Local'], default: 'GPT' },
  isApproved: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  testResults: [{
    input: String,
    output: String,
    latencyMs: Number,
    success: Boolean,
    timestamp: { type: Date, default: Date.now }
  }],
  history: [{
    version: Number,
    content: String,
    changedBy: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('PromptRegistry', promptRegistrySchema);
