import { create } from 'zustand'
import type { SymptomProgression } from '@/types/health.types'
import { getSymptomProgressions, upsertSymptomProgression } from '@/services/supabase'

function calculateTrend(
  baselineSeverity: number | null,
  currentSeverity: number,
  totalEpisodes: number,
): SymptomProgression['trend'] {
  if (totalEpisodes <= 1) return 'new'
  if (baselineSeverity === null) return 'new'
  const diff = currentSeverity - baselineSeverity
  if (diff <= -1) return 'improving'
  if (diff >= 1) return 'worsening'
  return 'stable'
}

interface SymptomProgressionState {
  progressions: SymptomProgression[]
  loading: boolean
  error: string | null
}

interface SymptomProgressionActions {
  fetchProgressions: (patientId: string) => Promise<void>
  syncProgression: (
    patientId: string,
    symptomName: string,
    newSeverity: number,
    onsetDate?: string,
  ) => Promise<void>
}

type SymptomProgressionStore = SymptomProgressionState & SymptomProgressionActions

export const useSymptomProgressionStore = create<SymptomProgressionStore>((set, get) => ({
  progressions: [],
  loading: false,
  error: null,

  fetchProgressions: async (patientId) => {
    set({ loading: true, error: null })
    try {
      const progressions = await getSymptomProgressions(patientId)
      set({ progressions: progressions as SymptomProgression[] })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load symptom progressions' })
    } finally {
      set({ loading: false })
    }
  },

  syncProgression: async (patientId, symptomName, newSeverity, onsetDate) => {
    const { progressions } = get()
    const existing = progressions.find(
      (p) => p.patient_id === patientId && p.symptom_name === symptomName,
    )

    const isFirst = !existing
    const baselineSeverity = isFirst ? newSeverity : (existing?.baseline_severity ?? null)
    const totalEpisodes = isFirst ? 1 : (existing?.total_episodes ?? 0) + 1
    const trend = calculateTrend(baselineSeverity, newSeverity, totalEpisodes)

    const updated = await upsertSymptomProgression({
      patient_id: patientId,
      symptom_name: symptomName,
      first_onset_date: isFirst ? (onsetDate ?? new Date().toISOString().split('T')[0]) : existing?.first_onset_date,
      current_severity: newSeverity,
      baseline_severity: baselineSeverity,
      trend,
      total_episodes: totalEpisodes,
    })

    set((state) => {
      const exists = state.progressions.some(
        (p) => p.patient_id === patientId && p.symptom_name === symptomName,
      )
      if (exists) {
        return {
          progressions: state.progressions.map((p) =>
            p.patient_id === patientId && p.symptom_name === symptomName
              ? (updated as SymptomProgression)
              : p,
          ),
        }
      }
      return { progressions: [...state.progressions, updated as SymptomProgression] }
    })
  },
}))
