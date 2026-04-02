import { usePostureStore } from '@/store/postureStore'

export default function usePosture() {
  const store = usePostureStore()
  const breaksTaken = store.postureLogs.reduce((sum, l) => sum + l.stand_breaks_taken, 0) +
    (store.activeSession?.stand_breaks_taken ?? 0)

  return {
    ...store,
    breaksTaken,
  }
}
