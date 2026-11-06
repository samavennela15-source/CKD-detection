const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

const verifyPatient = async (req, res, next) => {
  let token = req.headers.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) return res.status(401).json({ message: 'No authorization token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ckd_super_secure_jwt_secret_token_2026');
    if (decoded.role !== 'patient') {
      return res.status(403).json({ message: 'Forbidden: Patient access required' });
    }
    const patient = await Patient.findById(decoded.id).select('-password');
    if (!patient) return res.status(404).json({ message: 'Patient account not found' });
    if (patient.isFrozen) return res.status(403).json({ message: 'Account is frozen by Administrator' });

    req.user = patient;
    req.role = 'patient';
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const verifyDoctor = async (req, res, next) => {
  let token = req.headers.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) return res.status(401).json({ message: 'No authorization token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ckd_super_secure_jwt_secret_token_2026');
    if (decoded.role !== 'doctor') {
      return res.status(403).json({ message: 'Forbidden: Doctor access required' });
    }
    const doctor = await Doctor.findById(decoded.id).select('-password');
    if (!doctor) return res.status(404).json({ message: 'Doctor account not found' });
    if (doctor.isFrozen) return res.status(403).json({ message: 'Account is frozen by Administrator' });

    req.user = doctor;
    req.role = 'doctor';
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const verifyAdmin = (req, res, next) => {
  let token = req.headers.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) return res.status(401).json({ message: 'No authorization token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ckd_super_secure_jwt_secret_token_2026');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    req.user = { email: decoded.email, role: 'admin' };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { verifyPatient, verifyDoctor, verifyAdmin };
