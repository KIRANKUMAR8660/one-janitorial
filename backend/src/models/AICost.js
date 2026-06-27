import mongoose from 'mongoose';

const aiCostSchema = new mongoose.Schema({
  provider: { type: String, required: true }, // e.g. OpenAI, Anthropic, Gemini, Pinecone, Embeddings
  cost: { type: Number, required: true },
  tokensCount: { type: Number, default: 0 },
  category: { type: String, enum: ['Inference', 'Agent', 'Workflow', 'Vector', 'Embedding'], default: 'Inference' },
  dateRecorded: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('AICost', aiCostSchema);
