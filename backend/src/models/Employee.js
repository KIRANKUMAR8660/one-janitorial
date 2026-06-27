import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: String,
  department: {
    type: String,
    enum: ['Administration', 'Sales', 'BCO Operations', 'Client Service', 'HR', 'Operations', 'Field Staff'],
    required: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Suspended', 'Terminated', 'Onboarding'],
    default: 'Onboarding'
  },
  performanceScorecard: {
    rating: { type: Number, default: 5 },
    notes: String,
    lastReviewed: Date
  },
  attendanceLogs: [{
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['Present', 'Absent', 'Late', 'Excused'], default: 'Present' },
    checkIn: Date,
    checkOut: Date
  }],
  activityLogs: [{
    action: String,
    details: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Employee', employeeSchema);
