export type ImagingSeverity = 'normal' | 'mild' | 'moderate' | 'severe' | 'critical'
export type ImagingLaterality = 'left' | 'right' | 'bilateral' | 'central' | 'not_applicable'
export type FindingTrend = 'new' | 'stable' | 'improved' | 'worsened'

export interface ImagingReport {
  id: string
  patient_id: string
  report_date: string
  imaging_type: string
  body_region: string | null
  referring_doctor: string | null
  reporting_radiologist: string | null
  protocol_used: string | null
  raw_findings: string | null
  ai_summary: string | null
  normal_findings: string[]
  abnormal_findings: AbnormalFinding[]
  critical_findings: string[]
  surgical_urgency: boolean
  follow_up_recommended: boolean
  follow_up_timeline: string | null
  image_url: string | null
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  uploaded_at: string
  processed_at: string | null
}

export interface AbnormalFinding {
  location: string
  finding_type: string
  severity: ImagingSeverity
  laterality: ImagingLaterality
  description: string
  plain_language: string
  nerves_affected: string[]
  linked_symptoms: string[]
  surgical_urgency: boolean
}

export interface ImagingFinding {
  id: string
  imaging_report_id: string
  patient_id: string
  location: string | null
  finding_type: string | null
  severity: ImagingSeverity | null
  laterality: ImagingLaterality | null
  description: string | null
  plain_language: string | null
  nerves_affected: string[]
  linked_symptoms: string[]
  is_new: boolean
  trend: FindingTrend | null
  report_date: string | null
  created_at: string
}

export interface ConditionConnection {
  id: string
  patient_id: string
  source_condition: string
  source_label: string
  target_condition: string
  target_label: string
  connection_type: 'causes' | 'worsens' | 'correlates' | 'compounds'
  plain_language: string
  evidence_source: 'lab_report' | 'imaging' | 'symptom_pattern' | 'clinical' | null
  evidence_report_id: string | null
  is_active: boolean
  created_at: string
}
