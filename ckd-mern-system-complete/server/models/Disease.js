const mongoose = require('mongoose');

const DiseaseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  stageCode: { type: String, required: true, enum: ['G1', 'G2', 'G3a', 'G3b', 'G4', 'G5', 'Other'] },
  symptoms: [{ type: String }],
  causes: [{ type: String }],
  preventiveMeasures: [{ type: String }],
  dietaryGuidelines: { type: String, default: 'Balanced low-salt diet' },
  recommendedTests: [{ type: String }],
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Disease', DiseaseSchema);
