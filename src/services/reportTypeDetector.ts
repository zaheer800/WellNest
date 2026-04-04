import { supabase } from '@/services/supabase'

export type DetectedReportType =
  | 'lab_blood'
  | 'lab_urine'
  | 'mri'
  | 'ct'
  | 'ultrasound'
  | 'ncs'
  | 'xray'
  | 'ecg'
  | 'echo'
  | 'other'

export interface ReportTypeDetectionResult {
  detected_type: DetectedReportType
  detection_confidence: number
  suggested_label: string
}

export async function detectReportType(fileUrl: string): Promise<ReportTypeDetectionResult> {
  const { data, error } = await supabase.functions.invoke('detect-report-type', {
    body: { file_url: fileUrl },
  })

  if (error) {
    console.error('[reportTypeDetector] detectReportType error:', error.message)
    throw error
  }

  return data as ReportTypeDetectionResult
}
