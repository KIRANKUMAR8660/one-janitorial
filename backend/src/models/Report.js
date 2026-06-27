import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ['Sales KPIs', 'HR KPIs', 'BCO KPIs', 'Service KPIs', 'Employee KPIs', 'Custom'],
    required: true
  },
  schedule: {
    frequency: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'None'], default: 'None' },
    recipients: [String]
  },
  filters: mongoose.Schema.Types.Mixed,
  lastGenerated: Date,
  generatedFiles: [{
    format: { type: String, enum: ['CSV', 'Excel', 'PDF'] },
    filePath: String,
    generatedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);
