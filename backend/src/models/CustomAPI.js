import mongoose from 'mongoose';

const customAPILogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: String,
  method: String,
  statusCode: Number,
  latency: Number,
  error: String
});

const customAPISchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  routePath: { type: String, required: true, unique: true }, // e.g. api-custom-path
  method: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE'], default: 'POST' },
  version: { type: String, default: '1.0.0' },
  status: { type: String, enum: ['Enabled', 'Disabled'], default: 'Enabled' },
  authRequired: { type: Boolean, default: true },
  rateLimit: { type: Number, default: 60 }, // requests per min
  workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow' },
  validationRules: [{
    fieldName: String,
    fieldType: { type: String, enum: ['String', 'Number', 'Boolean', 'Object', 'Array'], default: 'String' },
    required: { type: Boolean, default: false }
  }],
  swaggerDoc: { type: mongoose.Schema.Types.Mixed, default: {} },
  logs: [customAPILogSchema]
}, { timestamps: true });

export default mongoose.model('CustomAPI', customAPISchema);
