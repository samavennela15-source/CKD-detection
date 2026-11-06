const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { verifyDoctor } = require('../middleware/auth');

router.post('/register', doctorController.register);
router.post('/login', doctorController.login);

router.put('/update-profile', verifyDoctor, doctorController.updateProfile);
router.post('/predict', verifyDoctor, doctorController.predict);
router.post('/add-disease', verifyDoctor, doctorController.addDisease);
router.get('/view-disease', verifyDoctor, doctorController.viewDisease);
router.put('/update-disease/:id', verifyDoctor, doctorController.updateDisease);
router.delete('/delete-disease/:id', verifyDoctor, doctorController.deleteDisease);
router.get('/view-query', verifyDoctor, doctorController.viewQuery);
router.post('/reply-query', verifyDoctor, doctorController.replyQuery);
router.get('/view-feedback', verifyDoctor, doctorController.viewFeedback);
router.get('/my-patients', verifyDoctor, doctorController.getMyPatients);

module.exports = router;
