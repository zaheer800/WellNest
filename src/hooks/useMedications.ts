import { useMedicationStore } from '@/store/medicationStore'

export default function useMedications() {
  const store = useMedicationStore()
  const takenCount = store.medications.filter((m) => m.log?.taken === true).length
  const totalCount = store.medications.filter((m) => m.is_active).length

  return {
    ...store,
    takenCount,
    totalCount,
  }
}
