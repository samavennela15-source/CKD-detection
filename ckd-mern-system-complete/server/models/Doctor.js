const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  specialization: { type: String, default: 'Nephrologist' },
  qualification: { type: String, default: 'MD, DM Nephrology' },
  experienceYears: { type: Number, default: 5 },
  hospitalAffiliation: { type: String, default: 'General Renal Hospital' },
  contact: { type: String, default: '' },
  isFrozen: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doctor', DoctorSchema);
