const mongoose = require('mongoose');

const QuerySchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
  subject: { type: String, required: true },
  question: { type: String, required: true },
  response: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Replied'], default: 'Pending' },
  repliedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Query', QuerySchema);
