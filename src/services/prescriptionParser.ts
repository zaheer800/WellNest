import { supabase } from '@/services/supabase'
import type { NewMedication } from '@/components/features/appointments/PostVisitLogger'

/**
 * Uploads a prescription file to Supabase Storage and returns the public URL.
 */
export async function uploadPrescription(patientId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${patientId}/prescriptions/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('reports')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabase.storage.from('reports').getPublicUrl(path)
  return data.publicUrl
}

/**
 * Calls the process-prescription Edge Function to extract medications from
 * a prescription file URL. Returns an array of NewMedication objects
 * ready to populate the medications form.
 */
export async function extractMedicationsFromPrescription(fileUrl: string): Promise<NewMedication[]> {
  const { data, error } = await supabase.functions.invoke('process-prescription', {
    body: { file_url: fileUrl },
  })

  if (error) throw new Error(`Prescription processing failed: ${error.message}`)

  const raw: { name: string; dose: string; unit: string; frequency: string; notes: string }[] =
    data?.medications ?? []

  return raw.map((m) => ({
    name: m.name ?? '',
    dose: m.dose ?? '',
    unit: (['mg', 'g', 'ml', 'IU', 'mcg', 'tablet', 'capsule', 'drop'].includes(m.unit) ? m.unit : 'mg') as NewMedication['unit'],
    frequency: (['daily', 'alternate_days', 'weekly'].includes(m.frequency)
      ? m.frequency
      : 'daily') as NewMedication['frequency'],
    notes: m.notes ?? '',
  }))
}
