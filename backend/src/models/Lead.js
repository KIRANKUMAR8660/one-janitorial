import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  status: { type: String, enum: ['New', 'Contacted', 'Qualified', 'Unqualified', 'Inactive'], default: 'New' },
  contactAttempts: { type: Number, default: 0 },
  dncVerified: { type: Boolean, default: false },
  existingCustomer: { type: Boolean, default: false },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastContacted: Date,
  inactiveFlagged: { type: Boolean, default: false },
  hygieneStatus: { type: String, default: 'Good' } // e.g. Flagged for Reassignment
}, { timestamps: true });

export default mongoose.model('Lead', leadSchema);
