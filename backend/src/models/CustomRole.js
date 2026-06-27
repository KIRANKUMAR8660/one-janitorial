import mongoose from 'mongoose';

const customRoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  permissions: [{ type: String }], // Array of permission strings e.g. ['read_employees', 'write_workflows']
  isSystemRole: { type: Boolean, default: false } // System defined vs Administrator defined
}, { timestamps: true });

export default mongoose.model('CustomRole', customRoleSchema);
