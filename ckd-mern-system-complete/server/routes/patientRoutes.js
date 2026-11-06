const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyPatient } = require('../middleware/auth');
const Doctor = require('../models/Doctor');

router.post('/register', patientController.register);
router.post('/login', patientController.login);
router.get('/doctors-list', async (req, res) => {
  try {
    const docs = await Doctor.find({ isFrozen: false }).select('name email specialization hospitalAffiliation');
    res.json(docs);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/profile', verifyPatient, patientController.getProfile);
router.put('/update-profile', verifyPatient, patientController.updateProfile);
router.post('/predict', verifyPatient, patientController.predictCKD);
router.post('/ask-query', verifyPatient, patientController.askQuery);
router.get('/view-query', verifyPatient, patientController.viewQuery);
router.post('/add-feedback', verifyPatient, patientController.addFeedback);

module.exports = router;
