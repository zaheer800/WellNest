export interface ReferenceRange {
  min: number
  max: number
  unit: string
  category: string
}

// For parameters with direction-only thresholds (e.g. eGFR >60, Total Cholesterol <200),
// min=0 means no lower bound check; max=Infinity means no upper bound check.
export const ReferenceRanges: Record<string, ReferenceRange> = {
  // Haematology
  'Hemoglobin (Male)': { min: 13.5, max: 17.5, unit: 'g/dL', category: 'haematology' },
  'Hemoglobin (Female)': { min: 12.0, max: 15.5, unit: 'g/dL', category: 'haematology' },
  Hemoglobin: { min: 12.0, max: 17.5, unit: 'g/dL', category: 'haematology' },

  // Kidney
  Creatinine: { min: 0.7, max: 1.3, unit: 'mg/dL', category: 'kidney' },
  eGFR: { min: 60, max: Infinity, unit: 'mL/min/1.73m²', category: 'kidney' },
  'Blood Urea Nitrogen': { min: 7, max: 20, unit: 'mg/dL', category: 'kidney' },
  'Uric Acid': { min: 3.5, max: 7.2, unit: 'mg/dL', category: 'kidney' },

  // Vitamins & Minerals
  'Vitamin B12': { min: 200, max: 900, unit: 'pg/mL', category: 'vitamins' },
  'Vitamin D': { min: 30, max: 100, unit: 'ng/mL', category: 'vitamins' },
  Calcium: { min: 8.5, max: 10.5, unit: 'mg/dL', category: 'electrolytes' },

  // Thyroid
  TSH: { min: 0.4, max: 4.0, unit: 'mIU/L', category: 'thyroid' },

  // Lipid Profile
  'Total Cholesterol': { min: 0, max: 200, unit: 'mg/dL', category: 'lipids' },
  LDL: { min: 0, max: 100, unit: 'mg/dL', category: 'lipids' },
  HDL: { min: 40, max: Infinity, unit: 'mg/dL', category: 'lipids' },
  Triglycerides: { min: 0, max: 150, unit: 'mg/dL', category: 'lipids' },

  // Glucose
  'Fasting Glucose': { min: 70, max: 99, unit: 'mg/dL', category: 'glucose' },
  HbA1c: { min: 0, max: 5.7, unit: '%', category: 'glucose' },

  // Liver
  ALT: { min: 7, max: 56, unit: 'U/L', category: 'liver' },
  AST: { min: 10, max: 40, unit: 'U/L', category: 'liver' },

  // Electrolytes
  Sodium: { min: 136, max: 145, unit: 'mEq/L', category: 'electrolytes' },
  Potassium: { min: 3.5, max: 5.1, unit: 'mEq/L', category: 'electrolytes' },
}
