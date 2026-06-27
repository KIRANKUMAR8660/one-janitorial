import mongoose from 'mongoose';

const n8nMigrationSchema = new mongoose.Schema({
  workflowName: { type: String, required: true },
  originalJson: { type: String, required: true },
  convertedJson: { type: String },
  status: { type: String, enum: ['Success', 'Failed', 'Partial'], default: 'Success' },
  credentialsMapped: [String],
  variablesMapped: [String],
  conversionErrors: [String]
}, { timestamps: true });

export default mongoose.model('N8NMigration', n8nMigrationSchema);
