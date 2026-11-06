const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
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
    const { name, email, password, age, gender, contact, bloodGroup, medicalHistory, assignedDoctor } = req.body;
    const exists = await Patient.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Patient with this email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const patient = await Patient.create({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      contact: contact || '',
      bloodGroup: bloodGroup || 'Unknown',
      medicalHistory: medicalHistory || '',
      assignedDoctor: assignedDoctor || null
    });

    const token = signToken(patient._id, 'patient');
    res.status(201).json({
      message: 'Registration successful',
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        age: patient.age,
        gender: patient.gender,
        role: 'patient'
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const patient = await Patient.findOne({ email });
    if (!patient) return res.status(401).json({ message: 'Invalid email or password' });

    if (patient.isFrozen) {
      return res.status(403).json({ message: 'Your account is currently frozen. Contact administration.' });
    }

    const match = await bcrypt.compare(password, patient.password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    const token = signToken(patient._id, 'patient');
    res.json({
      message: 'Login successful',
      token,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        age: patient.age,
        gender: patient.gender,
        role: 'patient'
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'age', 'gender', 'contact', 'bloodGroup', 'medicalHistory', 'assignedDoctor'];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.password, salt);
    }

    const patient = await Patient.findByIdAndUpdate(req.user._id, updates, { new: true })
      .select('-password')
      .populate('assignedDoctor', 'name email hospitalAffiliation');
    res.json({ message: 'Profile updated successfully', patient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.predictCKD = async (req, res) => {
  try {
    const { serumCreatinine, uacr, systolicBP, diastolicBP, bloodUreaNitrogen, fastingBloodSugar } = req.body;
    if (!serumCreatinine) {
      return res.status(400).json({ message: 'serumCreatinine is required for assessment' });
    }

    const egfr = calculateEGFR({
      serumCreatinine,
      age: req.user.age,
      gender: req.user.gender
    });

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
      recommendation: classification.recommendation,
      assessedBy: 'Self Assessment',
      doctorId: req.user.assignedDoctor || null,
      createdAt: new Date()
    };

    req.user.predictionHistory.push(record);
    await req.user.save();

    res.json({
      message: 'CKD Risk Assessment Complete',
      assessment: record,
      fullHistory: req.user.predictionHistory
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.askQuery = async (req, res) => {
  try {
    const { doctorId, subject, question } = req.body;
    const targetDoctor = doctorId || req.user.assignedDoctor;

    const query = await Query.create({
      patientId: req.user._id,
      doctorId: targetDoctor || null,
      subject,
      question
    });

    res.status(201).json({ message: 'Query submitted successfully', query });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.viewQuery = async (req, res) => {
  try {
    const queries = await Query.find({ patientId: req.user._id })
      .populate('doctorId', 'name email hospitalAffiliation')
      .sort({ createdAt: -1 });
    res.json(queries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addFeedback = async (req, res) => {
  try {
    const { doctorId, rating, comments, category } = req.body;
    const feedback = await Feedback.create({
      patientId: req.user._id,
      doctorId: doctorId || req.user.assignedDoctor || null,
      rating,
      comments,
      category: category || 'General'
    });

    res.status(201).json({ message: 'Thank you for your feedback!', feedback });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user._id)
      .select('-password')
      .populate('assignedDoctor', 'name email specialization hospitalAffiliation');
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
