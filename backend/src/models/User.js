import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const sessionSchema = new mongoose.Schema({
  token: String,
  deviceInfo: String,
  ipAddress: String,
  lastActive: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Super Admin', 'Admin', 'Manager', 'Team Lead', 'Sales', 'BCO', 'Client Service', 'HR', 'Employee']
  },
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaSecret: String,
  sessions: [sessionSchema],
  refreshTokens: [String],
  
  // Recovery & Security tracking
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpiry: {
    type: Date,
    default: null
  },
  lastPasswordReset: {
    type: Date,
    default: null
  },
  passwordHistory: {
    type: [String],
    default: []
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Enabled', 'Disabled'],
    default: 'Enabled'
  }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
