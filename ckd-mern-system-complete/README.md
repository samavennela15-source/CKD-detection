# Chronic Kidney Disease (CKD) MERN Platform

A clinical full-stack MERN application for Chronic Kidney Disease detection, KDIGO risk staging, disease knowledge base, and tri-role medical collaboration (Patient, Doctor, Admin).

---

## 1. Database Architecture (5 MongoDB Collections)

* **`patients`**: Name, email, hashed password, age, gender, contact, blood group, medical history, assigned doctor, account frozen status, longitudinal prediction records.
* **`doctors`**: Name, email, hashed password, specialization, qualification, experience, hospital affiliation, account freeze status.
* **`diseases`**: Condition name, KDIGO stage code (G1, G2, G3a, G3b, G4, G5), symptoms, causes, preventive measures, dietary guidelines, recommended tests, created by doctor.
* **`queries`**: Patient ID, Doctor ID, subject, question, response, status (Pending, Replied), timestamps.
* **`feedbacks`**: Patient ID, Doctor ID, rating (1-5), comments, category, timestamps.

---

## 2. API Endpoints Map

### Patient Routes (`/api/patient`)
* `POST /register`: New patient registration.
* `POST /login`: Patient authentication & JWT issuance.
* `PUT /update-profile`: Update demographics & medical history.
* `POST /predict`: Submit vitals (Creatinine, UACR, BP, etc.) for automated eGFR & KDIGO staging.
* `POST /ask-query`: Submit clinical questions to assigned or general doctor.
* `GET /view-query`: View past inquiries and doctor replies.
* `POST /add-feedback`: Submit 1-5 star feedback with qualitative comments.
* `GET /profile`: Fetch comprehensive patient profile with longitudinal assessment graph.

### Doctor Routes (`/api/doctor`)
* `POST /register`: Doctor registration.
* `POST /login`: Doctor authentication.
* `PUT /update-profile`: Update qualifications, specialization, and affiliation.
* `POST /predict`: Clinically diagnose a patient or test sample with tailored guidance.
* `POST /add-disease`: Publish new disease and guideline profiles.
* `GET /view-disease`: View complete disease catalog.
* `PUT /update-disease/:id`: Edit and update disease information.
* `DELETE /delete-disease/:id`: Remove disease information.
* `GET /view-query`: View incoming queries from cohort patients.
* `POST /reply-query`: Reply to patient queries with clinical guidance.
* `GET /view-feedback`: Inspect reviews and feedback submitted by patients.
* `GET /my-patients`: View assigned patient cohort and latest vitals.

### Admin Routes (`/api/admin`)
* `POST /login`: Secure administrative access.
* `GET /view-doctors`: View all registered doctors.
* `GET /view-patients`: View all registered patients.
* `PATCH /freeze-doctor/:id`: Freeze or unfreeze clinician account access.
* `DELETE /delete-doctor/:id`: Remove doctor and dissociate assigned patients.
* `PATCH /freeze-patient/:id`: Freeze or unfreeze patient access.
* `DELETE /delete-patient/:id`: Delete patient and associated inquiries.
* `GET /view-queries`: System-wide query oversight.
* `GET /view-feedback`: System-wide patient feedback oversight.

---

## 3. How to Run

### Step 1: Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Seed sample doctor, patient, diseases, and admin:
node seed.js
# Start server:
npm run dev
```

### Step 2: Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Default Seed Credentials
* **Admin**: `admin@ckd.org` | `AdminPassword123!`
* **Doctor**: `doctor@ckd.org` | `Password123!`
* **Patient**: `patient@ckd.org` | `Password123!`
