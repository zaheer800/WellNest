import { invokeFunction } from '@/services/supabase'

export interface LabParameter {
  parameter_name: string
  value: number
  unit: string
  reference_min: number | null
  reference_max: number | null
  status:
    | 'normal'
    | 'borderline_low'
    | 'borderline_high'
    | 'abnormal_low'
    | 'abnormal_high'
    | 'critical_low'
    | 'critical_high'
  plain_language: string
  category:
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
}

export interface LabReportParseResult {
  report_id: string
  detected_type: string
  detection_confidence: number
  suggested_label: string
  parameters: LabParameter[]
}

export async function processLabReport(
  reportId: string,
  options: { fileUrl?: string; rawText?: string; age?: number; gender?: string }
): Promise<LabReportParseResult> {
  const data = await invokeFunction('process-lab-report', {
    report_id: reportId,
    file_url: options.fileUrl,
    raw_text: options.rawText,
    age: options.age,
    gender: options.gender,
  })

  if (data?.error === 'RATE_LIMIT') throw new Error('RATE_LIMIT')

  return data as LabReportParseResult
}
