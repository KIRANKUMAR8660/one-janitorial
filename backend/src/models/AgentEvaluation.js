import mongoose from 'mongoose';

const agentEvaluationSchema = new mongoose.Schema({
  agentName: { type: String, required: true },
  successRate: { type: Number, default: 100 },
  failureRate: { type: Number, default: 0 },
  averageConfidence: { type: Number, default: 1.0 },
  averageRuntime: { type: Number, default: 1000 },
  lastFailure: { type: String, default: null },
  lastOverride: { type: Date, default: null },
  driftScore: { type: Number, default: 0 },
  regressionDetected: { type: Boolean, default: false },
  decisionLogs: [{
    input: String,
    output: String,
    confidence: Number,
    overrideStatus: { type: String, enum: ['Approved', 'Rejected', 'Pending', 'Auto-Approved'], default: 'Auto-Approved' },
    overrideReason: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('AgentEvaluation', agentEvaluationSchema);
