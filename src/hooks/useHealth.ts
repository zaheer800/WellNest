import { useHealthStore } from '@/store/healthStore'

export default function useHealth() {
  const store = useHealthStore()
  const waterTotalMl = store.waterLogs.reduce((sum, l) => sum + l.amount_ml, 0)

  return {
    ...store,
    waterTotalMl,
  }
}
