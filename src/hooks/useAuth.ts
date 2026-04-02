import { useAuthStore } from '@/store/authStore'

/**
 * Convenience hook that exposes the full auth store — state and actions —
 * to any component without importing useAuthStore directly.
 *
 * Usage:
 *   const { user, session, loading, initialized, signInWithOtp, signOut } = useAuth()
 */
export default function useAuth() {
  return useAuthStore()
}
