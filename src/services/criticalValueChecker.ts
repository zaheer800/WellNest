import { supabase } from '@/services/supabase'
import type { LabParameter } from '@/types/report.types'

export interface CriticalParameter {
  name: string
  status: 'critical_low' | 'critical_high'
  value: number
  action: string
  urgency: string
}

export interface CriticalValueCheckResult {
  critical_found: boolean
  critical_parameters: CriticalParameter[]
}

export async function checkCriticalValues(
  patientId: string,
  reportId: string,
  parameters: LabParameter[],
): Promise<CriticalValueCheckResult> {
  const { data, error } = await supabase.functions.invoke('check-critical-values', {
    body: { patient_id: patientId, report_id: reportId, parameters },
  })

  if (error) {
    console.error('[criticalValueChecker] checkCriticalValues error:', error.message)
    throw error
  }

  return data as CriticalValueCheckResult
}

export function isCriticalStatus(status: string): boolean {
  return status === 'critical' || status === 'critical_low' || status === 'critical_high'
}
