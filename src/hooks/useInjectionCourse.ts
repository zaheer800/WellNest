import { useEffect } from 'react'
import { useInjectionStore } from '@/store/injectionStore'

export function useInjectionCourse(patientId: string) {
  const store = useInjectionStore()

  useEffect(() => {
    if (patientId) {
      store.fetchCourses(patientId)
      store.fetchSideEffects(patientId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId])

  return {
    courses: store.courses,
    sideEffects: store.sideEffects,
    loading: store.loading,
    error: store.error,
    addCourse: store.addCourse,
    markDose: store.markDose,
    addSideEffect: store.addSideEffect,
    resolveSideEffect: store.resolveSideEffect,
  }
}
