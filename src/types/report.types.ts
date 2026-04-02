export type ParameterStatus =
  | 'normal'
  | 'borderline_low'
  | 'borderline_high'
  | 'abnormal_low'
  | 'abnormal_high'
  | 'critical'

export type ParameterCategory =
  | 'kidney'
  | 'liver'
  | 'blood'
  | 'lipids'
  | 'diabetes'
  | 'thyroid'
  | 'vitamins'
  | 'cardiac'
  | 'electrolytes'
  | 'urine'
  | 'hormones'
  | 'other'

export interface LabReport {
  id: string
  patient_id: string
  report_date: string
  report_type: string
  lab_name: string | null
  doctor_name: string | null
  raw_text: string | null
  image_url: string | null
  ai_summary: string | null
  anomaly_count: number
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  uploaded_at: string
  processed_at: string | null
}

export interface LabParameter {
  id: string
  report_id: string
  patient_id: string
  parameter_name: string
  parameter_category: ParameterCategory | null
  value: number | null
  unit: string | null
  reference_min: number | null
  reference_max: number | null
  status: ParameterStatus | null
  severity: 'mild' | 'moderate' | 'severe' | null
  trend: 'improving' | 'stable' | 'worsening' | 'new' | null
  plain_language_explanation: string | null
  report_date: string | null
  created_at: string
}
