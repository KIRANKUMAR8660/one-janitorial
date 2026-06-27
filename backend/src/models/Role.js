import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Super Admin', 'Admin', 'Manager', 'Team Lead', 'Sales', 'BCO', 'Client Service', 'HR', 'Employee']
  },
  description: String,
  permissions: [{
    type: String
  }]
}, { timestamps: true });

export default mongoose.model('Role', roleSchema);
