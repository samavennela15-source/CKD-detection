const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Query = require('../models/Query');
const Feedback = require('../models/Feedback');
const Disease = require('../models/Disease');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ckd.org';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

  if (email === adminEmail && password === adminPassword) {
    const token = jwt.sign(
      { email, role: 'admin' },
      process.env.JWT_SECRET || 'ckd_super_secure_jwt_secret_token_2026',
      { expiresIn: '7d' }
    );
    return res.json({
      message: 'Admin authorization successful',
      token,
      admin: { email, role: 'admin' }
    });
  }
  return res.status(401).json({ message: 'Invalid Admin credentials' });
};

exports.viewDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-password').sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.viewPatients = async (req, res) => {
  try {
    const patients = await Patient.find().select('-password').populate('assignedDoctor', 'name email').sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.freezeDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFrozen } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(id, { isFrozen: Boolean(isFrozen) }, { new: true }).select('-password');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ message: `Doctor ${doctor.isFrozen ? 'frozen' : 'unfrozen'} successfully`, doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByIdAndDelete(id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    await Patient.updateMany({ assignedDoctor: id }, { $set: { assignedDoctor: null } });
    res.json({ message: 'Doctor removed from system' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.freezePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFrozen } = req.body;
    const patient = await Patient.findByIdAndUpdate(id, { isFrozen: Boolean(isFrozen) }, { new: true }).select('-password');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ message: `Patient ${patient.isFrozen ? 'frozen' : 'unfrozen'} successfully`, patient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findByIdAndDelete(id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    await Query.deleteMany({ patientId: id });
    await Feedback.deleteMany({ patientId: id });
    res.json({ message: 'Patient deleted completely' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.viewQueries = async (req, res) => {
  try {
    const queries = await Query.find()
      .populate('patientId', 'name email contact')
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 });
    res.json(queries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.viewFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
