import { create } from 'zustand'
import type { PostureLog } from '@/types/health.types'
import { getPostureLogs, addPostureLog, updatePostureLog, deleteTodayPostureLogs } from '@/services/supabase'
import { useMedicationStore } from '@/store/medicationStore'
import { useHealthStore } from '@/store/healthStore'

interface PostureState {
  postureLogs: PostureLog[]
  activeSession: PostureLog | null
  sittingStartTime: Date | null
  isTracking: boolean
  lastStandBreak: Date | null
  standBreakGoal: number
}

interface PostureActions {
  startSitting: (patientId: string) => Promise<void>
  recordStandBreak: (patientId: string) => Promise<void>
  endSession: (patientId: string) => Promise<void>
  fetchTodayLogs: (patientId: string, date: string) => Promise<void>
  resetTodayBreaks: (patientId: string, date: string) => Promise<void>
  getSittingDurationMinutes: () => number
}

type PostureStore = PostureState & PostureActions

export const usePostureStore = create<PostureStore>((set, get) => ({
  postureLogs: [],
  activeSession: null,
  sittingStartTime: null,
  isTracking: false,
  lastStandBreak: null,
  standBreakGoal: 8,

  startSitting: async (patientId) => {
    const now = new Date()
    const log = await addPostureLog({
      patient_id: patientId,
      session_start: now.toISOString(),
      stand_breaks_taken: 0,
    })
    set({
      activeSession: log as PostureLog,
      sittingStartTime: now,
      isTracking: true,
    })
  },

  recordStandBreak: async (patientId) => {
    const { activeSession } = get()
    const now = new Date()

    if (!activeSession) {
      // Auto-start a session if none active
      await get().startSitting(patientId)
      return
    }

    const newBreakCount = activeSession.stand_breaks_taken + 1
    const updated = await updatePostureLog(activeSession.id, { stand_breaks_taken: newBreakCount })

    set({
      activeSession: updated as PostureLog,
      lastStandBreak: now,
      sittingStartTime: now, // Reset the clock so the next sitting period starts from 0
    })

    // Recompute health score after recording break
    const meds = useMedicationStore.getState().medications
    const pLogs = get().postureLogs
    await useHealthStore.getState().recomputeScore(patientId, meds, pLogs, get().standBreakGoal)
  },

  endSession: async () => {
    const { activeSession, sittingStartTime } = get()
    if (!activeSession) return

    const now = new Date()
    const sittingMinutes = sittingStartTime
      ? Math.round((now.getTime() - sittingStartTime.getTime()) / 60000)
      : 0

    const breaksTaken = activeSession.stand_breaks_taken
    const complianceScore = Math.min(100, Math.round((breaksTaken / get().standBreakGoal) * 100))

    const updated = await updatePostureLog(activeSession.id, {
      session_end: now.toISOString(),
      sitting_duration_minutes: sittingMinutes,
      compliance_score: complianceScore,
    })

    set((state) => ({
      postureLogs: [...state.postureLogs, updated as PostureLog],
      activeSession: null,
      sittingStartTime: null,
      isTracking: false,
    }))
  },

  fetchTodayLogs: async (patientId, date) => {
    const logs = await getPostureLogs(patientId, date)
    set({ postureLogs: logs as PostureLog[] })
  },

  resetTodayBreaks: async (patientId, date) => {
    await deleteTodayPostureLogs(patientId, date)
    set({
      postureLogs: [],
      activeSession: null,
      sittingStartTime: null,
      lastStandBreak: null,
      isTracking: false,
    })
  },

  getSittingDurationMinutes: () => {
    const { sittingStartTime } = get()
    if (!sittingStartTime) return 0
    return Math.floor((Date.now() - sittingStartTime.getTime()) / 60000)
  },
}))
