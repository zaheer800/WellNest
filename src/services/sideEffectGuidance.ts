import { supabase } from '@/services/supabase'

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
  const { data, error } = await supabase.functions.invoke('generate-side-effect-guidance', {
    body: {
      medication_name: medicationName,
      side_effect: sideEffect,
      severity,
      source,
      patient_conditions: patientConditions,
    },
  })

  if (error) throw new Error(`Side effect guidance failed: ${error.message}`)

  return data as SideEffectGuidanceResult
}
