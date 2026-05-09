const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  storeName: { type: String, required: true },
  storeDescription: { type: String, default: '' },
  phone: { type: String, default: '' },
  role: { type: String, default: 'vendor' },
  approvalStatus: { type: String, default: 'pending' },
  approvalNote: { type: String, default: '' },
  isBanned: { type: Boolean, default: false }
}, { timestamps: true });

vendorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

vendorSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Vendor', vendorSchema);
