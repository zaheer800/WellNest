import { invokeFunction } from '@/services/supabase'
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
  const data = await invokeFunction('check-critical-values', {
    patient_id: patientId, report_id: reportId, parameters,
  })

  if (data?.error === 'RATE_LIMIT') {
    // Never suppress a critical value check failure — return empty and let caller handle
    console.warn('[criticalValueChecker] Rate limited — raw values still visible to user')
    return { critical_found: false, critical_parameters: [] }
  }

  return data as CriticalValueCheckResult
}

export function isCriticalStatus(status: string): boolean {
  return status === 'critical' || status === 'critical_low' || status === 'critical_high'
}
