import type { MedicationWithLog, WaterLog, ExerciseLog, PostureLog, HealthScoreBreakdown } from '@/types/health.types'
import { today } from '@/utils/dateHelpers'

export function calcMedicationScore(medications: MedicationWithLog[]): number {
  const active = medications.filter((m) => m.is_active)
  if (active.length === 0) return 25
  const takenCount = active.filter((m) => m.log?.taken === true).length
  return Math.round((takenCount / active.length) * 25)
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

export function calcDietScore(): number {
  return 15
}

export function calcPostureScore(postureLogs: PostureLog[], standBreakGoal: number): number {
  if (standBreakGoal <= 0) return 0
  const totalBreaks = postureLogs.reduce((sum, log) => sum + log.stand_breaks_taken, 0)
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
}): HealthScoreBreakdown {
  const medication = calcMedicationScore(data.medications)
  const water = calcWaterScore(data.waterLogs, data.waterGoalMl)
  const exercise = calcExerciseScore(data.exerciseLogs)
  const diet = calcDietScore()
  const posture = calcPostureScore(data.postureLogs, data.postureGoalBreaks)
  const total = calcTotalScore({ medication, water, exercise, diet, posture })

  return { total, medication, water, exercise, diet, posture }
}
