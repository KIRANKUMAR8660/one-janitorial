import mongoose from 'mongoose';

const secretSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // The environment variable name (e.g. OPENAI_API_KEY)
  value: { type: String, required: true }, // Encrypted value
  iv: { type: String, required: true }, // AES initialization vector (hex)
  category: { type: String, required: true }, // e.g. AI Providers, CRM, etc.
  lastRotated: { type: Date, default: Date.now },
  rotationPeriodDays: { type: Number, default: 90 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  history: [{
    rotatedAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, { timestamps: true });

export default mongoose.model('Secret', secretSchema);
