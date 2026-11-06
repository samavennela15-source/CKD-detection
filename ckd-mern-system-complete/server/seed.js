const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const Disease = require('./models/Disease');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ckd_management_db');
    console.log('Connected to DB for seeding...');

    await Doctor.deleteMany();
    await Patient.deleteMany();
    await Disease.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash('Password123!', salt);

    const doc1 = await Doctor.create({
      name: 'Dr. Sarah Jenkins',
      email: 'doctor@ckd.org',
      password: pass,
      specialization: 'Consultant Nephrologist',
      qualification: 'MBBS, MD (Medicine), DM (Nephrology)',
      experienceYears: 12,
      hospitalAffiliation: 'National Kidney Research Institute',
      contact: '+1-555-019-2834'
    });

    const patient1 = await Patient.create({
      name: 'Alex Turner',
      email: 'patient@ckd.org',
      password: pass,
      age: 48,
      gender: 'male',
      contact: '+1-555-839-2041',
      bloodGroup: 'O+',
      medicalHistory: 'Hypertension for 5 years, Type 2 Diabetes',
      assignedDoctor: doc1._id,
      predictionHistory: [
        {
          serumCreatinine: 1.6,
          uacr: 45,
          systolicBP: 135,
          diastolicBP: 85,
          bloodUreaNitrogen: 24,
          fastingBloodSugar: 110,
          egfr: 51.2,
          stage: 'G3a',
          riskLevel: 'Moderate',
          description: 'Mild-to-moderately decreased function',
          recommendation: 'Repeat eGFR within 3 months, low sodium diet',
          assessedBy: 'Dr. Sarah Jenkins',
          doctorId: doc1._id
        }
      ]
    });

    await Disease.create([
      {
        name: 'Stage 1 CKD (Normal Kidney Function with Albuminuria)',
        stageCode: 'G1',
        symptoms: ['Often asymptomatic', 'Mild protein in urine', 'Occasional edema in feet'],
        causes: ['High blood pressure', 'Early diabetic nephropathy', 'Glomerulonephritis'],
        preventiveMeasures: ['Keep blood pressure < 130/80', 'Tight glycemic control', 'Limit NSAIDs'],
        dietaryGuidelines: 'Adequate hydration, salt intake < 2g per day.',
        recommendedTests: ['Serum Creatinine', 'Urine Albumin-Creatinine Ratio (UACR)', 'Renal Ultrasound'],
        addedBy: doc1._id
      },
      {
        name: 'Stage 3b CKD (Moderately to Severely Decreased Function)',
        stageCode: 'G3b',
        symptoms: ['Fatigue', 'Fluid retention (swollen ankles)', 'Dry and itchy skin', 'Changes in urination frequency'],
        causes: ['Longstanding hypertension', 'Diabetic glomerulosclerosis', 'Polycystic kidney disease'],
        preventiveMeasures: ['Strict renin-angiotensin system blockade', 'Avoid contrast dyes', 'Correct metabolic acidosis'],
        dietaryGuidelines: 'Protein restriction (0.6-0.8 g/kg/day), low potassium, low phosphorus.',
        recommendedTests: ['Electrolytes panel', 'Serum Calcium & Phosphate', 'PTH levels', 'Hemoglobin'],
        addedBy: doc1._id
      }
    ]);

    console.log('Database seeded with standard accounts!');
    console.log('Doctor: doctor@ckd.org / Password123!');
    console.log('Patient: patient@ckd.org / Password123!');
    console.log('Admin: admin@ckd.org / AdminPassword123!');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

seedData();
