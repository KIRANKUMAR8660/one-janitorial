import mongoose from 'mongoose';

const failureRecoverySchema = new mongoose.Schema({
  errorOrigin: { type: String, required: true }, // e.g. Node ID, Service Name
  errorMessage: { type: String, required: true },
  recoveryAction: { type: String, enum: ['Retry', 'Fallback Agent', 'Fallback API', 'Fallback Workflow', 'Escalation'], required: true },
  recoveryStatus: { type: String, enum: ['Recovered', 'Retrying', 'Failed', 'Escalated'], default: 'Retrying' },
  retriesCount: { type: Number, default: 0 },
  workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow' },
  execution: { type: mongoose.Schema.Types.ObjectId, ref: 'Execution' },
  circuitBreakerStatus: { type: String, enum: ['Closed', 'Open', 'Half-Open'], default: 'Closed' }
}, { timestamps: true });

export default mongoose.model('FailureRecovery', failureRecoverySchema);
