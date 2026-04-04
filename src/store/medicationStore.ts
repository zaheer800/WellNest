import { create } from 'zustand'
import type { Medication, MedicationLog, MedicationWithLog } from '@/types/health.types'
import {
  getMedications,
  addMedication as dbAddMedication,
  deleteMedication as dbDeleteMedication,
  getMedicationLogs,
  upsertMedicationLog,
} from '@/services/supabase'

interface MedicationState {
  medications: MedicationWithLog[]
  loading: boolean
  error: string | null
}

interface MedicationActions {
  fetchMedications: (patientId: string, date: string) => Promise<void>
  markTaken: (medicationId: string, patientId: string, date: string, taken: boolean) => Promise<void>
  addMedication: (med: Omit<Medication, 'id' | 'created_at' | 'schedule_config' | 'is_active' | 'refill_reminder_days'>) => Promise<void>
  removeMedication: (id: string) => Promise<void>
}

type MedicationStore = MedicationState & MedicationActions

export const useMedicationStore = create<MedicationStore>((set) => ({
  medications: [],
  loading: false,
  error: null,

  fetchMedications: async (patientId, date) => {
    set({ loading: true, error: null })
    try {
      const [meds, logs] = await Promise.all([
        getMedications(patientId),
        getMedicationLogs(patientId, date),
      ])

      const logMap = new Map<string, MedicationLog>(logs.map((l: MedicationLog) => [l.medication_id, l]))

      const merged: MedicationWithLog[] = (meds as Medication[]).map((m) => ({
        ...m,
        log: logMap.get(m.id),
      }))

      set({ medications: merged })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load medications' })
    } finally {
      set({ loading: false })
    }
  },

  markTaken: async (medicationId, patientId, date, taken) => {
    const takenAt = taken ? new Date().toISOString() : null
    await upsertMedicationLog({ medication_id: medicationId, patient_id: patientId, scheduled_date: date, taken, taken_at: takenAt })

    set((state) => ({
      medications: state.medications.map((m) =>
        m.id === medicationId
          ? { ...m, log: { ...(m.log ?? { id: '', medication_id: medicationId, patient_id: patientId, scheduled_date: date, skipped_reason: null, created_at: new Date().toISOString() }), taken, taken_at: takenAt } as MedicationLog }
          : m,
      ),
    }))
  },

  addMedication: async (med) => {
    set({ loading: true, error: null })
    try {
      const newMed = await dbAddMedication(med as Parameters<typeof dbAddMedication>[0])
      set((state) => ({ medications: [...state.medications, { ...(newMed as Medication), log: undefined }] }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add medication' })
      throw err // Re-throw so the UI can handle it
    } finally {
      set({ loading: false })
    }
  },

  removeMedication: async (id) => {
    await dbDeleteMedication(id)
    set((state) => ({ medications: state.medications.filter((m) => m.id !== id) }))
  },
}))
