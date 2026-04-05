import { invokeFunction } from '@/services/supabase'

export interface ImagingFinding {
  location: string
  spinal_level: string | null
  spinal_region: 'cervical' | 'thoracic' | 'lumbar' | 'sacral' | null
  finding_type: string
  severity: 'mild' | 'moderate' | 'severe'
  laterality: 'left' | 'right' | 'bilateral' | 'central' | 'not_applicable'
  description: string
  plain_language: string
  nerves_affected: string[]
  linked_symptoms: string[]
  surgical_urgency: boolean
}

export interface ImagingReportParseResult {
  report_id: string
  detected_type: string
  detection_confidence: number
  suggested_label: string
  imaging_type: string
  body_region: string
  normal_findings: string[]
  abnormal_findings: ImagingFinding[]
  critical_findings: string[]
  surgical_urgency: boolean
  follow_up_recommended: boolean
  follow_up_timeline: string | null
  overall_summary: string
}

export async function processImagingReport(
  reportId: string,
  options: { fileUrl?: string; rawText?: string; age?: number; gender?: string }
): Promise<ImagingReportParseResult> {
  const data = await invokeFunction('process-imaging-report', {
    report_id: reportId,
    file_url: options.fileUrl,
    raw_text: options.rawText,
    age: options.age,
    gender: options.gender,
  })

  if (data?.error === 'RATE_LIMIT') throw new Error('RATE_LIMIT')

  return data as ImagingReportParseResult
}
