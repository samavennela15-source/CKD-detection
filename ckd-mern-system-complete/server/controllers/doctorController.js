const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Disease = require('../models/Disease');
const Query = require('../models/Query');
const Feedback = require('../models/Feedback');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { calculateEGFR, classifyKDIGO } = require('../utils/ckdEngine');

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'ckd_super_secure_jwt_secret_token_2026', { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, specialization, qualification, experienceYears, hospitalAffiliation, contact } = req.body;
    const exists = await Doctor.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Doctor with this email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const doctor = await Doctor.create({
      name,
      email,
      password: hashedPassword,
      specialization: specialization || 'Nephrologist',
      qualification: qualification || 'MD, DM Nephrology',
      experienceYears: experienceYears || 5,
      hospitalAffiliation: hospitalAffiliation || 'Central Renal Hospital',
      contact: contact || ''
    });

    const token = signToken(doctor._id, 'doctor');
    res.status(201).json({
      message: 'Doctor registered successfully',
      token,
      doctor: { id: doctor._id, name: doctor.name, email: doctor.email, role: 'doctor' }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });
    if (!doctor) return res.status(401).json({ message: 'Invalid credentials' });

    if (doctor.isFrozen) {
      return res.status(403).json({ message: 'Doctor account has been frozen by Administrator.' });
    }

    const match = await bcrypt.compare(password, doctor.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(doctor._id, 'doctor');
    res.json({
      message: 'Login successful',
      token,
      doctor: { id: doctor._id, name: doctor.name, email: doctor.email, role: 'doctor' }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'specialization', 'qualification', 'experienceYears', 'hospitalAffiliation', 'contact'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.password, salt);
    }

    const doctor = await Doctor.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ message: 'Profile updated successfully', doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.predict = async (req, res) => {
  try {
    const { patientId, serumCreatinine, uacr, systolicBP, diastolicBP, bloodUreaNitrogen, fastingBloodSugar, notes } = req.body;
    let age = req.body.age;
    let gender = req.body.gender;

    let patientDoc = null;
    if (patientId) {
      patientDoc = await Patient.findById(patientId);
      if (patientDoc) {
        age = patientDoc.age;
        gender = patientDoc.gender;
      }
    }

    if (!serumCreatinine || !age || !gender) {
      return res.status(400).json({ message: 'serumCreatinine, age, and gender are required for diagnosis' });
    }

    const egfr = calculateEGFR({ serumCreatinine, age, gender });
    const classification = classifyKDIGO(egfr, uacr || 0);

    const record = {
      serumCreatinine: Number(serumCreatinine),
      uacr: Number(uacr || 0),
      systolicBP: Number(systolicBP || 120),
      diastolicBP: Number(diastolicBP || 80),
      bloodUreaNitrogen: Number(bloodUreaNitrogen || 0),
      fastingBloodSugar: Number(fastingBloodSugar || 0),
      egfr: classification.egfr,
      stage: classification.stage,
      riskLevel: classification.riskLevel,
      description: classification.description,
      recommendation: notes || classification.recommendation,
      assessedBy: `Dr. ${req.user.name}`,
      doctorId: req.user._id,
      createdAt: new Date()
    };

    if (patientDoc) {
      patientDoc.predictionHistory.push(record);
      await patientDoc.save();
    }

    res.json({
      message: 'Doctor clinical evaluation complete',
      assessment: record,
      savedToPatient: Boolean(patientDoc)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addDisease = async (req, res) => {
  try {
    const { name, stageCode, symptoms, causes, preventiveMeasures, dietaryGuidelines, recommendedTests } = req.body;
    const disease = await Disease.create({
      name,
      stageCode,
      symptoms: Array.isArray(symptoms) ? symptoms : (symptoms || '').split(',').map(s => s.trim()),
      causes: Array.isArray(causes) ? causes : (causes || '').split(',').map(s => s.trim()),
      preventiveMeasures: Array.isArray(preventiveMeasures) ? preventiveMeasures : (preventiveMeasures || '').split(',').map(s => s.trim()),
      dietaryGuidelines: dietaryGuidelines || 'Low potassium, low sodium',
      recommendedTests: Array.isArray(recommendedTests) ? recommendedTests : (recommendedTests || '').split(',').map(s => s.trim()),
      addedBy: req.user._id
    });
    res.status(201).json({ message: 'Disease information documented', disease });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.viewDisease = async (req, res) => {
  try {
    const diseases = await Disease.find().populate('addedBy', 'name hospitalAffiliation').sort({ createdAt: -1 });
    res.json(diseases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateDisease = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };
    const disease = await Disease.findByIdAndUpdate(id, updates, { new: true });
    if (!disease) return res.status(404).json({ message: 'Disease entry not found' });
    res.json({ message: 'Disease record updated', disease });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteDisease = async (req, res) => {
  try {
    const { id } = req.params;
    const disease = await Disease.findByIdAndDelete(id);
    if (!disease) return res.status(404).json({ message: 'Disease entry not found' });
    res.json({ message: 'Disease entry removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.viewQuery = async (req, res) => {
  try {
    const queries = await Query.find({ $or: [{ doctorId: req.user._id }, { doctorId: null }] })
      .populate('patientId', 'name email age gender contact')
      .sort({ createdAt: -1 });
    res.json(queries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.replyQuery = async (req, res) => {
  try {
    const { queryId, response } = req.body;
    const query = await Query.findByIdAndUpdate(
      queryId,
      {
        response,
        doctorId: req.user._id,
        status: 'Replied',
        repliedAt: new Date()
      },
      { new: true }
    );
    if (!query) return res.status(404).json({ message: 'Query not found' });
    res.json({ message: 'Response dispatched to patient', query });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.viewFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ $or: [{ doctorId: req.user._id }, { doctorId: null }] })
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ assignedDoctor: req.user._id }).select('-password');
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
