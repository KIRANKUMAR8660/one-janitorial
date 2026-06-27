import mongoose from 'mongoose';

const datasetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sourceType: { type: String, required: true }, // e.g. CSV, Excel, HubSpot, Supabase, MongoDB, MySQL, REST
  columns: [{
    name: { type: String, required: true },
    type: { type: String, required: true } // e.g. Number, String, Date, Boolean
  }],
  rowCount: { type: Number, default: 0 },
  sizeBytes: { type: Number, default: 0 },
  filePath: { type: String }, // optional upload file path
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  lineage: {
    source: { type: String },
    steps: [{ type: String }]
  },
  version: { type: Number, default: 1 },
  usageCount: { type: Number, default: 0 },
  roleAccess: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Dataset', datasetSchema);
