import { create } from 'zustand'
import type { Appointment, VisitPreparation } from '@/types/appointment.types'
import {
  getAppointments,
  addAppointment as dbAddAppointment,
  updateAppointment as dbUpdateAppointment,
  deleteAppointment as dbDeleteAppointment,
  getVisitPreparation,
  markPrepViewed as dbMarkPrepViewed,
} from '@/services/supabase'

interface AppointmentState {
  appointments: Appointment[]
  preparations: Record<string, VisitPreparation>
  loading: boolean
  error: string | null
}

interface AppointmentActions {
  fetchAppointments: (patientId: string) => Promise<void>
  addAppointment: (appt: {
    patient_id: string
    doctor_id?: string | null
    appointment_date: string
    appointment_type?: string | null
    notes?: string | null
  }) => Promise<void>
  completeAppointment: (id: string, notes: string, tasks: string[]) => Promise<void>
  dismissTask: (appointmentId: string, task: string) => Promise<void>
  editAppointment: (id: string, updates: { appointment_date: string; appointment_type: string | null; notes: string | null }) => Promise<void>
  deleteAppointment: (id: string) => Promise<void>
  fetchPreparation: (appointmentId: string) => Promise<void>
  markPrepViewed: (id: string) => Promise<void>
}

type AppointmentStore = AppointmentState & AppointmentActions

export const useAppointmentStore = create<AppointmentStore>((set, get) => ({
  appointments: [],
  preparations: {},
  loading: false,
  error: null,

  fetchAppointments: async (patientId) => {
    set({ loading: true, error: null })
    try {
      const appointments = await getAppointments(patientId)
      set({ appointments: appointments as Appointment[] })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load appointments' })
    } finally {
      set({ loading: false })
    }
  },

  addAppointment: async (appt) => {
    const newAppt = await dbAddAppointment(appt)
    set((state) => ({ appointments: [...state.appointments, newAppt as Appointment] }))
  },

  completeAppointment: async (id, notes, tasks) => {
    await dbUpdateAppointment(id, { completed: true, post_visit_notes: notes, follow_up_tasks: tasks })
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, completed: true, post_visit_notes: notes, follow_up_tasks: tasks } : a,
      ),
    }))
  },

  dismissTask: async (appointmentId, task) => {
    const appt = get().appointments.find((a) => a.id === appointmentId)
    if (!appt) return
    const updatedPending = (appt.follow_up_tasks as string[]).filter((t) => t !== task)
    const updatedCompleted = [...(appt.completed_follow_up_tasks ?? []), task]
    // Optimistic update first so closing the accordion doesn't revert the check
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === appointmentId
          ? { ...a, follow_up_tasks: updatedPending, completed_follow_up_tasks: updatedCompleted }
          : a,
      ),
    }))
    await dbUpdateAppointment(appointmentId, {
      follow_up_tasks: updatedPending,
      completed_follow_up_tasks: updatedCompleted,
    })
  },

  editAppointment: async (id, updates) => {
    const updated = await dbUpdateAppointment(id, updates)
    set((state) => ({
      appointments: state.appointments.map((a) => (a.id === id ? (updated as Appointment) : a)),
    }))
  },

  deleteAppointment: async (id) => {
    await dbDeleteAppointment(id)
    set((state) => ({ appointments: state.appointments.filter((a) => a.id !== id) }))
  },

  fetchPreparation: async (appointmentId) => {
    set({ loading: true, error: null })
    try {
      const prep = await getVisitPreparation(appointmentId)
      if (prep) {
        set((state) => ({
          preparations: { ...state.preparations, [appointmentId]: prep as VisitPreparation },
        }))
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load visit preparation' })
    } finally {
      set({ loading: false })
    }
  },

  markPrepViewed: async (id) => {
    await dbMarkPrepViewed(id)
    set((state) => {
      const updated: Record<string, VisitPreparation> = {}
      for (const [apptId, prep] of Object.entries(state.preparations)) {
        updated[apptId] = prep.id === id ? { ...prep, viewed_by_patient: true } : prep
      }
      return { preparations: updated }
    })
  },
}))
