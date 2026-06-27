import mongoose from 'mongoose';

const analyticsDashboardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roleAccess: [{ type: String }],
  widgets: [{
    id: { type: String, required: true },
    type: { type: String, required: true }, // e.g. KPI Card, Line Chart, Bar Chart, Pie Chart, Scatter Plot, Gauge, Pivot Table, Map, Timeline
    title: { type: String, required: true },
    datasetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset' },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
    layout: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      w: { type: Number, default: 4 },
      h: { type: Number, default: 3 }
    }
  }]
}, { timestamps: true });

export default mongoose.model('AnalyticsDashboard', analyticsDashboardSchema);
