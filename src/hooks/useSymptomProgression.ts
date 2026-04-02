import { useEffect } from 'react'
import { useSymptomProgressionStore } from '@/store/symptomProgressionStore'

export function useSymptomProgression(patientId: string) {
  const store = useSymptomProgressionStore()

  useEffect(() => {
    if (patientId) {
      store.fetchProgressions(patientId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId])

  function getProgression(symptomName: string) {
    return store.progressions.find((p) => p.symptom_name === symptomName) ?? null
  }

  return {
    progressions: store.progressions,
    loading: store.loading,
    syncProgression: store.syncProgression,
    getProgression,
  }
}
