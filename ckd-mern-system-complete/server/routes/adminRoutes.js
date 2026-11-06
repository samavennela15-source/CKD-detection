const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/auth');

router.post('/login', adminController.login);

router.get('/view-doctors', verifyAdmin, adminController.viewDoctors);
router.get('/view-patients', verifyAdmin, adminController.viewPatients);
router.patch('/freeze-doctor/:id', verifyAdmin, adminController.freezeDoctor);
router.delete('/delete-doctor/:id', verifyAdmin, adminController.deleteDoctor);
router.patch('/freeze-patient/:id', verifyAdmin, adminController.freezePatient);
router.delete('/delete-patient/:id', verifyAdmin, adminController.deletePatient);
router.get('/view-queries', verifyAdmin, adminController.viewQueries);
router.get('/view-feedback', verifyAdmin, adminController.viewFeedback);

module.exports = router;
