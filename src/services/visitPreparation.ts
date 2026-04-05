import { invokeFunction } from '@/services/supabase'
import type { VisitPreparation } from '@/types/appointment.types'

/**
 * Calls the generate-visit-preparation Edge Function to produce an AI-powered
 * preparation guide for the patient before their appointment.
 */
export async function generateVisitPreparation(
  appointmentId: string,
  patientId: string,
): Promise<VisitPreparation> {
  const data = await invokeFunction('generate-visit-preparation', {
    appointment_id: appointmentId, patient_id: patientId,
  })

  return data as VisitPreparation
}
