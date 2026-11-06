const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
  rating: { type: Number, min: 1, max: 5, required: true },
  comments: { type: String, required: true },
  category: { type: String, enum: ['Doctor Consultation', 'Platform Experience', 'General'], default: 'General' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
