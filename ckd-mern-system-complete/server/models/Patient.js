const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  contact: { type: String, default: '' },
  bloodGroup: { type: String, default: 'Unknown' },
  medicalHistory: { type: String, default: '' },
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
  isFrozen: { type: Boolean, default: false },
  predictionHistory: [
    {
      serumCreatinine: Number,
      uacr: Number,
      systolicBP: Number,
      diastolicBP: Number,
      bloodUreaNitrogen: Number,
      fastingBloodSugar: Number,
      egfr: Number,
      stage: String,
      riskLevel: String,
      description: String,
      recommendation: String,
      assessedBy: { type: String, default: 'Self / System' },
      doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', PatientSchema);
