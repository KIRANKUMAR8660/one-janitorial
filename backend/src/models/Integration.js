import mongoose from 'mongoose';

const integrationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true }, // AI Providers, CRM, Databases, Communication, Email, Storage, Vector Databases, Automation, Monitoring
  status: { type: String, enum: ['Enabled', 'Disabled'], default: 'Enabled' },
  healthStatus: { type: String, enum: ['Connected', 'Disconnected', 'Error'], default: 'Disconnected' },
  latency: { type: Number, default: 0 }, // in ms
  responseTime: { type: Number, default: 0 }, // in ms
  errorRate: { type: Number, default: 0 }, // percentage
  lastSuccessfulRequest: { type: Date },
  webhookStatus: { type: String, enum: ['Active', 'Inactive', 'N/A'], default: 'N/A' },
  config: { type: mongoose.Schema.Types.Mixed, default: {} }, // Non-sensitive properties (e.g. Org ID, Portal ID, Default Model, Host, Port)
  logs: [{
    timestamp: { type: Date, default: Date.now },
    action: { type: String },
    status: { type: String },
    message: { type: String }
  }]
}, { timestamps: true });

export default mongoose.model('Integration', integrationSchema);
