import type { MedicationWithLog, WaterLog, ExerciseLog, PostureLog, HealthScoreBreakdown } from '@/types/health.types'
import { today } from '@/utils/dateHelpers'

export function calcMedicationScore(medications: MedicationWithLog[]): number {
  const active = medications.filter((m) => m.is_active)
  if (active.length === 0) return 25 // No medications — healthy user gets full credit

  let expectedCount = 0
  let takenCount = 0

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  for (const med of active) {
    // Check if this medication should be taken today based on frequency
    if (shouldTakeMedicationToday(med, today)) {
      expectedCount++
      if (med.log?.taken === true && med.log.scheduled_date === todayStr) {
        takenCount++
      }
    }
  }

  if (expectedCount === 0) return 25 // If no medications are due today, give full credit

  return Math.round((takenCount / expectedCount) * 25)
}

export function shouldTakeMedicationToday(med: MedicationWithLog, today: Date): boolean {
  const startDate = med.start_date ? new Date(med.start_date) : new Date(med.created_at)
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  switch (med.frequency) {
    case 'daily':
      return true

    case 'alternate_days':
      // Alternate days starting from start date
      // If started on day 0, take on even days (0, 2, 4, ...)
      return daysSinceStart % 2 === 0

    case 'weekly':
      // Weekly - take once per week (every 7 days)
      return daysSinceStart % 7 === 0

    case 'custom':
      // For custom schedules, we'd need more complex logic
      // For now, assume daily until schedule_config is implemented
      return true

    default:
      return true
  }
}

export function calcWaterScore(waterLogs: WaterLog[], goalMl: number): number {
  if (goalMl <= 0) return 0
  const totalMl = waterLogs.reduce((sum, log) => sum + log.amount_ml, 0)
  return Math.min(20, Math.round((totalMl / goalMl) * 20))
}

export function calcExerciseScore(exerciseLogs: ExerciseLog[]): number {
  const todayStr = today()
  const hasExerciseToday = exerciseLogs.some((log) => log.logged_at.slice(0, 10) === todayStr)
  return hasExerciseToday ? 20 : 0
}

export function calcDietScore(dietLogs: any[] = []): number {
  // Diet tracking not yet implemented - return 0 until feature is added
  // When implemented, this will check if user logged compliant meals
  return 0
}

export function calcPostureScore(postureLogs: PostureLog[], standBreakGoal: number, activeBreaks: number = 0): number {
  if (standBreakGoal <= 0) return 0
  const totalBreaks = postureLogs.reduce((sum, log) => sum + log.stand_breaks_taken, 0) + activeBreaks
  return Math.min(15, Math.round((totalBreaks / standBreakGoal) * 15))
}

export function calcTotalScore(breakdown: {
  medication: number
  water: number
  exercise: number
  diet: number
  posture: number
}): number {
  return breakdown.medication + breakdown.water + breakdown.exercise + breakdown.diet + breakdown.posture
}

export function calcHealthScore(data: {
  medications: MedicationWithLog[]
  waterLogs: WaterLog[]
  waterGoalMl: number
  exerciseLogs: ExerciseLog[]
  postureLogs: PostureLog[]
  postureGoalBreaks: number
  activePostureBreaks?: number
  dietLogs?: any[]
}): HealthScoreBreakdown {
  const medication = calcMedicationScore(data.medications)
  const water = calcWaterScore(data.waterLogs, data.waterGoalMl)
  const exercise = calcExerciseScore(data.exerciseLogs)
  const diet = calcDietScore(data.dietLogs)
  const posture = calcPostureScore(data.postureLogs, data.postureGoalBreaks, data.activePostureBreaks)
  const total = calcTotalScore({ medication, water, exercise, diet, posture })

  return { total, medication, water, exercise, diet, posture }
}
