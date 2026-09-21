import { useAuthStore } from '@/store/authStore'

/**
 * The person whose health data is on screen. This is the signed-in user unless a guardian
 * has switched to someone they manage (a child, a parent).
 */
export function useActivePatient() {
  const { user, activePatientId, activeProfile, managedProfiles } = useAuthStore()
  const patientId = activePatientId ?? user?.id ?? ''
  const isSelf = !user || patientId === user.id
  const profile = isSelf ? user : activeProfile
  const managed = managedProfiles.find((m) => m.patientId === patientId) ?? null
  return { patientId, profile, isSelf, managed }
}
