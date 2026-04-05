/**
 * Report type detection is now merged into the processing functions.
 * `process-lab-report` and `process-imaging-report` both return
 * `detected_type`, `detection_confidence`, and `suggested_label`
 * in the same call — no separate API request needed.
 *
 * The standalone `detect-report-type` Edge Function is kept as a
 * fallback for cases where the caller only needs classification
 * without full extraction (e.g. upload preview before processing).
 */
import { invokeFunction } from '@/services/supabase'

export interface ReportTypeDetectionResult {
  detected_type: string
  detection_confidence: number
  suggested_label: string
  pipeline: 'lab' | 'imaging'
}

export async function detectReportType(
  fileUrl: string,
  options?: { age?: number; gender?: string }
): Promise<ReportTypeDetectionResult> {
  const data = await invokeFunction('detect-report-type', {
    file_url: fileUrl, age: options?.age, gender: options?.gender,
  })

  if (data?.error === 'RATE_LIMIT') throw new Error('RATE_LIMIT')

  return {
    detected_type: data.detected_type,
    detection_confidence: data.detection_confidence ?? 0,
    suggested_label: data.suggested_label ?? '',
    pipeline: data.pipeline ?? 'lab',
  }
}
