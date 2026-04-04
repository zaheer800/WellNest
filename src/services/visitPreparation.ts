import { supabase } from '@/services/supabase'
import type { VisitPreparation } from '@/types/appointment.types'

/**
 * Calls the generate-visit-preparation Edge Function to produce an AI-powered
 * preparation guide for the patient before their appointment.
 */
export async function generateVisitPreparation(
  appointmentId: string,
  patientId: string,
): Promise<VisitPreparation> {
  const { data, error } = await supabase.functions.invoke('generate-visit-preparation', {
    body: { appointment_id: appointmentId, patient_id: patientId },
  })

  if (error) throw new Error(`Visit preparation failed: ${error.message}`)

  return data as VisitPreparation
}
