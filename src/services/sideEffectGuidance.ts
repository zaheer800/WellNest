import { invokeFunction } from '@/services/supabase'

export interface SideEffectGuidanceResult {
  guidance: string
  action: 'continue' | 'monitor' | 'contact_doctor' | 'stop_immediately'
  is_expected: boolean
  personalised_context: string
}

/**
 * Calls the generate-side-effect-guidance Edge Function to get AI-powered
 * guidance on a medication side effect reported by the patient.
 */
export async function getSideEffectGuidance(
  medicationName: string,
  sideEffect: string,
  severity: string,
  source: 'experienced' | 'read_about',
  patientConditions: string[] = [],
): Promise<SideEffectGuidanceResult> {
  const data = await invokeFunction('generate-side-effect-guidance', {
    medication_name: medicationName,
    side_effect: sideEffect,
    severity,
    source,
    patient_conditions: patientConditions,
  })

  return data as SideEffectGuidanceResult
}
