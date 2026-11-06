/**
 * Clinical CKD-EPI 2021 Equation (No race term) and KDIGO 2021 Classification
 */
function calculateEGFR({ serumCreatinine, age, gender }) {
  const scr = Number(serumCreatinine);
  const userAge = Number(age);
  const isFemale = String(gender).toLowerCase() === 'female';

  const kappa = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  const genderFactor = isFemale ? 1.012 : 1.0;

  const ratio = scr / kappa;
  const minTerm = Math.min(ratio, 1.0);
  const maxTerm = Math.max(ratio, 1.0);

  const egfr = 142 *
    Math.pow(minTerm, alpha) *
    Math.pow(maxTerm, -1.200) *
    Math.pow(0.9938, userAge) *
    genderFactor;

  return Math.round(egfr * 10) / 10;
}

function classifyKDIGO(egfr, uacr = 0) {
  let stage = 'G1';
  let description = '';
  let riskLevel = 'Low';

  if (egfr >= 90) {
    stage = 'G1';
    description = 'Normal or high kidney function';
    riskLevel = uacr > 30 ? 'Moderate' : 'Low';
  } else if (egfr >= 60) {
    stage = 'G2';
    description = 'Mildly decreased kidney function';
    riskLevel = uacr > 30 ? 'Moderate' : 'Low';
  } else if (egfr >= 45) {
    stage = 'G3a';
    description = 'Mild-to-moderately decreased function';
    riskLevel = uacr > 300 ? 'High' : 'Moderate';
  } else if (egfr >= 30) {
    stage = 'G3b';
    description = 'Moderately-to-severely decreased function';
    riskLevel = 'High';
  } else if (egfr >= 15) {
    stage = 'G4';
    description = 'Severely decreased kidney function';
    riskLevel = 'Very High';
  } else {
    stage = 'G5';
    description = 'Kidney failure (End-stage renal disease)';
    riskLevel = 'Very High';
  }

  if (uacr >= 300) {
    riskLevel = 'Very High';
  }

  let recommendation = '';
  switch (stage) {
    case 'G1':
    case 'G2':
      recommendation = 'Maintain BP < 130/80 mmHg, annual eGFR & urine albumin check, healthy hydration.';
      break;
    case 'G3a':
    case 'G3b':
      recommendation = 'Evaluate CKD progression every 3-6 months, consider ACE inhibitors/ARBs, limit dietary sodium & protein.';
      break;
    case 'G4':
      recommendation = 'Prepare for kidney replacement therapy, consult nephrologist closely, monitor electrolytes & anemia.';
      break;
    case 'G5':
      recommendation = 'Urgent nephrology evaluation, vascular access planning or dialysis/transplant evaluation.';
      break;
  }

  return {
    stage,
    egfr,
    riskLevel,
    description,
    recommendation,
    testedAt: new Date()
  };
}

module.exports = { calculateEGFR, classifyKDIGO };
