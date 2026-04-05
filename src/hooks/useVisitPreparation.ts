import { useEffect } from 'react'
import { useAppointmentStore } from '@/store/appointmentStore'

export function useVisitPreparation(appointmentId: string | null) {
  const store = useAppointmentStore()

  useEffect(() => {
    if (appointmentId) {
      store.fetchPreparation(appointmentId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId])

  const preparation = appointmentId ? (store.preparations[appointmentId] ?? null) : null

  return {
    preparation,
    loading: store.loading,
    markViewed: store.markPrepViewed,
  }
}
