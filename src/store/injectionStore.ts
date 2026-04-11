import { create } from 'zustand'
import type { InjectionCourseWithProgress, InjectionCourseLog, MedicationSideEffectLog } from '@/types/injection.types'
import {
  getInjectionCourses,
  addInjectionCourse as dbAddInjectionCourse,
  updateInjectionCourse as dbUpdateInjectionCourse,
  markDoseAdministered as dbMarkDoseAdministered,
  addInjectionCourseLog as dbAddInjectionCourseLog,
  getSideEffectLogs,
  addSideEffectLog as dbAddSideEffectLog,
  resolveSideEffect as dbResolveSideEffect,
} from '@/services/supabase'

function calculateNextDoseDate(
  startDate: string,
  frequency: 'daily' | 'alternate_days' | 'weekly',
  dosesCompleted: number,
): string | null {
  const start = new Date(startDate)
  const intervalDays = frequency === 'daily' ? 1 : frequency === 'alternate_days' ? 2 : 7
  const nextDate = new Date(start)
  nextDate.setDate(start.getDate() + dosesCompleted * intervalDays)
  return nextDate.toISOString().split('T')[0]
}

function calculateProgressPct(dosesCompleted: number, totalDoses: number): number {
  if (totalDoses === 0) return 0
  return Math.min(100, Math.round((dosesCompleted / totalDoses) * 100))
}

interface InjectionState {
  courses: InjectionCourseWithProgress[]
  logs: Record<string, InjectionCourseLog[]>
  sideEffects: MedicationSideEffectLog[]
  loading: boolean
  error: string | null
}

interface InjectionActions {
  fetchCourses: (patientId: string) => Promise<void>
  addCourse: (course: {
    patient_id: string
    medication_id: string
    total_doses: number
    frequency: 'daily' | 'alternate_days' | 'weekly'
    start_date: string
    notes?: string
  }) => Promise<void>
  markDoseToday: (course: InjectionCourseWithProgress) => Promise<void>
  markDose: (
    logId: string,
    courseId: string,
    data: {
      administered_at: string
      administered_by: 'self' | 'nurse' | 'doctor' | 'family'
      site?: string
      side_effects_noted?: string
    },
  ) => Promise<void>
  fetchSideEffects: (patientId: string) => Promise<void>
  addSideEffect: (log: {
    patient_id: string
    medication_id: string
    side_effect: string
    severity: 'mild' | 'moderate' | 'severe' | 'critical'
    source: 'experienced' | 'read_about'
    guidance?: string
  }) => Promise<void>
  resolveSideEffect: (id: string) => Promise<void>
  /** Log a dose with a custom actual date — handles on-time and backdated doses */
  logDose: (
    course: InjectionCourseWithProgress,
    administeredAt: string,
    administeredBy: 'self' | 'nurse' | 'doctor' | 'family',
  ) => Promise<void>
}

type InjectionStore = InjectionState & InjectionActions

export const useInjectionStore = create<InjectionStore>((set, get) => ({
  courses: [],
  logs: {},
  sideEffects: [],
  loading: false,
  error: null,

  fetchCourses: async (patientId) => {
    if (!patientId) {
      set({ courses: [], error: null })
      return
    }

    set({ loading: true, error: null })
    try {
      const rawCourses = await getInjectionCourses(patientId)
      const courses: InjectionCourseWithProgress[] = rawCourses.map((c: InjectionCourseWithProgress) => ({
        ...c,
        progress_pct: calculateProgressPct(c.doses_completed, c.total_doses),
        next_dose_date:
          c.doses_completed < c.total_doses
            ? calculateNextDoseDate(c.start_date, c.frequency, c.doses_completed)
            : null,
      }))
      set({ courses })
    } catch (err) {
      set({ courses: [], error: err instanceof Error ? err.message : 'Failed to load injection courses' })
    } finally {
      set({ loading: false })
    }
  },

  addCourse: async (course) => {
    set({ loading: true, error: null })
    try {
      const newCourse = await dbAddInjectionCourse(course)
      const withProgress: InjectionCourseWithProgress = {
        ...(newCourse as InjectionCourseWithProgress),
        progress_pct: 0,
        next_dose_date: calculateNextDoseDate(course.start_date, course.frequency, 0),
      }
      set((state) => ({ courses: [...state.courses, withProgress] }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to save injection course' })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  markDoseToday: async (course) => {
    set({ loading: true, error: null })
    try {
      const today = new Date().toISOString().split('T')[0]
      const doseNumber = course.doses_completed + 1
      const scheduled_date = course.next_dose_date ?? today

      const newLog = await dbAddInjectionCourseLog({
        course_id: course.id,
        patient_id: course.patient_id,
        dose_number: doseNumber,
        scheduled_date,
      })

      await dbMarkDoseAdministered(newLog.id, {
        administered_at: new Date().toISOString(),
        administered_by: 'self',
      })

      const newDosesCompleted = course.doses_completed + 1
      await dbUpdateInjectionCourse(course.id, { doses_completed: newDosesCompleted })

      set((state) => ({
        courses: state.courses.map((c) =>
          c.id !== course.id
            ? c
            : {
                ...c,
                doses_completed: newDosesCompleted,
                progress_pct: calculateProgressPct(newDosesCompleted, c.total_doses),
                next_dose_date:
                  newDosesCompleted < c.total_doses
                    ? calculateNextDoseDate(c.start_date, c.frequency, newDosesCompleted)
                    : null,
              },
        ),
      }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to mark injection dose' })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  markDose: async (logId, courseId, data) => {
    await dbMarkDoseAdministered(logId, data)

    const { courses } = get()
    const course = courses.find((c) => c.id === courseId)
    if (!course) return

    const newDosesCompleted = course.doses_completed + 1
    await dbUpdateInjectionCourse(courseId, { doses_completed: newDosesCompleted })

    set((state) => ({
      courses: state.courses.map((c) => {
        if (c.id !== courseId) return c
        const updatedDoses = c.doses_completed + 1
        return {
          ...c,
          doses_completed: updatedDoses,
          progress_pct: calculateProgressPct(updatedDoses, c.total_doses),
          next_dose_date:
            updatedDoses < c.total_doses
              ? calculateNextDoseDate(c.start_date, c.frequency, updatedDoses)
              : null,
        }
      }),
      logs: {
        ...state.logs,
        [courseId]: (state.logs[courseId] ?? []).map((l) =>
          l.id === logId
            ? {
                ...l,
                administered: true,
                administered_at: data.administered_at,
                administered_by: data.administered_by,
                site: data.site ?? null,
                side_effects_noted: data.side_effects_noted ?? null,
              }
            : l,
        ),
      },
    }))
  },

  fetchSideEffects: async (patientId) => {
    set({ loading: true, error: null })
    try {
      const sideEffects = await getSideEffectLogs(patientId)
      set({ sideEffects: sideEffects as MedicationSideEffectLog[] })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load side effects' })
    } finally {
      set({ loading: false })
    }
  },

  addSideEffect: async (log) => {
    const newLog = await dbAddSideEffectLog(log)
    set((state) => ({ sideEffects: [newLog as MedicationSideEffectLog, ...state.sideEffects] }))
  },

  resolveSideEffect: async (id) => {
    await dbResolveSideEffect(id)
    set((state) => ({
      sideEffects: state.sideEffects.map((s) =>
        s.id === id ? { ...s, resolved: true, resolved_at: new Date().toISOString() } : s,
      ),
    }))
  },

  logDose: async (course, administeredAt, administeredBy) => {
    set({ loading: true, error: null })
    try {
      const doseNumber = course.doses_completed + 1
      // scheduled_date is the originally planned date; administeredAt is the actual date taken
      const scheduled_date = course.next_dose_date ?? administeredAt.split('T')[0]

      const newLog = await dbAddInjectionCourseLog({
        course_id: course.id,
        patient_id: course.patient_id,
        dose_number: doseNumber,
        scheduled_date,
      })

      await dbMarkDoseAdministered(newLog.id, {
        administered_at: administeredAt,
        administered_by: administeredBy,
      })

      const newDosesCompleted = course.doses_completed + 1
      await dbUpdateInjectionCourse(course.id, { doses_completed: newDosesCompleted })

      set((state) => ({
        courses: state.courses.map((c) =>
          c.id !== course.id
            ? c
            : {
                ...c,
                doses_completed: newDosesCompleted,
                progress_pct: calculateProgressPct(newDosesCompleted, c.total_doses),
                next_dose_date:
                  newDosesCompleted < c.total_doses
                    ? calculateNextDoseDate(c.start_date, c.frequency, newDosesCompleted)
                    : null,
              },
        ),
      }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to log injection dose' })
      throw err
    } finally {
      set({ loading: false })
    }
  },
}))
