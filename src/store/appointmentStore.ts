import { create } from 'zustand'
import type { Appointment, VisitPreparation } from '@/types/appointment.types'
import {
  getAppointments,
  addAppointment as dbAddAppointment,
  updateAppointment as dbUpdateAppointment,
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
  completeAppointment: (id: string, notes: string) => Promise<void>
  fetchPreparation: (appointmentId: string) => Promise<void>
  markPrepViewed: (id: string) => Promise<void>
}

type AppointmentStore = AppointmentState & AppointmentActions

export const useAppointmentStore = create<AppointmentStore>((set) => ({
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

  completeAppointment: async (id, notes) => {
    await dbUpdateAppointment(id, { completed: true, post_visit_notes: notes })
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, completed: true, post_visit_notes: notes } : a,
      ),
    }))
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
