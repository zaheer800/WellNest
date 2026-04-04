import { create } from 'zustand'
import type { WaterLog, SymptomLog, ExerciseLog, ActivityRestriction, HealthScoreBreakdown } from '@/types/health.types'
import { usePostureStore } from '@/store/postureStore'
import { useMedicationStore } from '@/store/medicationStore'
import {
  getWaterLogs,
  addWaterLog as dbAddWater,
  deleteWaterLog as dbDeleteWater,
  getSymptomLogs,
  addSymptomLog as dbAddSymptom,
  getExerciseLogs,
  addExerciseLog as dbAddExercise,
  getActivityRestrictions,
  upsertDailyScore,
} from '@/services/supabase'
import { calcHealthScore } from '@/utils/healthScore'
import { today } from '@/utils/dateHelpers'

interface HealthState {
  waterLogs: WaterLog[]
  waterGoalMl: number
  symptomLogs: SymptomLog[]
  exerciseLogs: ExerciseLog[]
  activityRestrictions: ActivityRestriction[]
  dailyScore: HealthScoreBreakdown | null
  loading: boolean
}

interface HealthActions {
  fetchTodayData: (patientId: string, date: string, medications?: import('@/types/health.types').MedicationWithLog[], postureLogs?: import('@/types/health.types').PostureLog[]) => Promise<void>
  addWater: (patientId: string, amountMl: number, fluidType?: string) => Promise<void>
  removeWater: (id: string) => Promise<void>
  logSymptom: (log: { patient_id: string; symptom_name: string; symptom_category: string; severity: number; notes?: string }) => Promise<void>
  logExercise: (log: { patient_id: string; exercise_type: string; is_physiotherapy?: boolean; duration_minutes?: number; notes?: string }) => Promise<void>
  setWaterGoal: (ml: number) => void
  recomputeScore: (patientId: string, medications: import('@/types/health.types').MedicationWithLog[], postureLogs: import('@/types/health.types').PostureLog[], postureGoalBreaks: number) => Promise<void>
}

type HealthStore = HealthState & HealthActions

export const useHealthStore = create<HealthStore>((set, get) => ({
  waterLogs: [],
  waterGoalMl: 2500,
  symptomLogs: [],
  exerciseLogs: [],
  activityRestrictions: [],
  dailyScore: null,
  loading: false,

  fetchTodayData: async (patientId, date, medications = [], postureLogs = []) => {
    set({ loading: true })
    try {
      const [water, symptoms, exercise, restrictions] = await Promise.all([
        getWaterLogs(patientId, date),
        getSymptomLogs(patientId, 20),
        getExerciseLogs(patientId, date),
        getActivityRestrictions(patientId),
      ])

      const state = get()
      const activeBreaks = usePostureStore.getState().activeSession?.stand_breaks_taken ?? 0
      const score = calcHealthScore({
        medications,
        waterLogs: water as WaterLog[],
        waterGoalMl: state.waterGoalMl,
        exerciseLogs: exercise as ExerciseLog[],
        postureLogs,
        postureGoalBreaks: 8,
        activePostureBreaks: activeBreaks,
        dietLogs: [], // Diet tracking not yet implemented
      })

      set({
        waterLogs: water as WaterLog[],
        symptomLogs: symptoms as SymptomLog[],
        exerciseLogs: exercise as ExerciseLog[],
        activityRestrictions: restrictions as ActivityRestriction[],
        dailyScore: score,
      })

      await upsertDailyScore({
        patient_id: patientId,
        score_date: date,
        total_score: score.total,
        water_score: score.water,
        medication_score: score.medication,
        exercise_score: score.exercise,
        diet_score: score.diet,
        sleep_score: 0,
        posture_score: score.posture,
      })
    } catch (err) {
      // Error silently handled
    } finally {
      set({ loading: false })
    }
  },

  addWater: async (patientId, amountMl, fluidType = 'water') => {
    const newLog = await dbAddWater({ patient_id: patientId, amount_ml: amountMl, fluid_type: fluidType })
    set((state) => ({ waterLogs: [...state.waterLogs, newLog as WaterLog] }))

    // Recompute health score after adding water
    const meds = useMedicationStore.getState().medications
    const pLogs = usePostureStore.getState().postureLogs
    await get().recomputeScore(patientId, meds, pLogs, 8)
  },

  removeWater: async (id) => {
    await dbDeleteWater(id)
    set((state) => ({ waterLogs: state.waterLogs.filter((l) => l.id !== id) }))
  },

  logSymptom: async (log) => {
    const newLog = await dbAddSymptom(log)
    set((state) => ({ symptomLogs: [newLog as SymptomLog, ...state.symptomLogs] }))
  },

  logExercise: async (log) => {
    const newLog = await dbAddExercise(log)
    set((state) => ({ exerciseLogs: [...state.exerciseLogs, newLog as ExerciseLog] }))
  },

  setWaterGoal: (ml) => set({ waterGoalMl: ml }),

  recomputeScore: async (patientId, medications, postureLogs, postureGoalBreaks) => {
    const state = get()
    const activeBreaks = usePostureStore.getState().activeSession?.stand_breaks_taken ?? 0
    const score = calcHealthScore({
      medications,
      waterLogs: state.waterLogs,
      waterGoalMl: state.waterGoalMl,
      exerciseLogs: state.exerciseLogs,
      postureLogs,
      postureGoalBreaks,
      activePostureBreaks: activeBreaks,
    })
    set({ dailyScore: score })

    await upsertDailyScore({
      patient_id: patientId,
      score_date: today(),
      total_score: score.total,
      water_score: score.water,
      medication_score: score.medication,
      exercise_score: score.exercise,
      diet_score: score.diet,
      sleep_score: 0,
      posture_score: score.posture,
    })
  },
}))
