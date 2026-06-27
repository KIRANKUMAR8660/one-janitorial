import mongoose from 'mongoose';

const profitSplitSchema = new mongoose.Schema({
  partnerName: String,
  partnerPercentage: { type: Number, required: true },
  staffPercentage: { type: Number, required: true },
  calculatedAmount: Number
});

const inspectionSchema = new mongoose.Schema({
  inspector: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  inspectionDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Passed', 'Failed', 'Re-evaluation Needed'], default: 'Passed' },
  notes: String
});

const bcoProjectSchema = new mongoose.Schema({
  allianceName: { type: String, required: true },
  buildingName: { type: String, required: true },
  buildingAddress: String,
  contractValue: { type: Number, required: true },
  contractStartDate: Date,
  contractEndDate: Date,
  contractStatus: { type: String, enum: ['Draft', 'Active', 'Expired', 'Terminated'], default: 'Draft' },
  profitSplits: [profitSplitSchema],
  inspections: [inspectionSchema],
  welcomeEmailSent: { type: Boolean, default: false },
  contractFilingPath: String
}, { timestamps: true });

export default mongoose.model('BcoProject', bcoProjectSchema);
