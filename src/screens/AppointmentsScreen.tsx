import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useAppointmentStore } from '@/store/appointmentStore'
import { useMedicationStore } from '@/store/medicationStore'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import AppointmentCard from '@/components/features/appointments/AppointmentCard'
import VisitPreparationComponent from '@/components/features/appointments/VisitPreparation'
import PostVisitLogger from '@/components/features/appointments/PostVisitLogger'
import type { NewMedication } from '@/components/features/appointments/PostVisitLogger'
import { generateVisitPreparation } from '@/services/visitPreparation'
import { today } from '@/utils/dateHelpers'
import type { Appointment } from '@/types/appointment.types'
import { Calendar, X, ChevronDown, ChevronRight } from 'lucide-react'

interface AddForm {
  appointment_date: string
  appointment_type: string
  notes: string
}

export default function AppointmentsScreen() {
  const { user } = useAuthStore()
  const {
    appointments,
    preparations,
    loading,
    fetchAppointments,
    addAppointment,
    editAppointment,
    deleteAppointment,
    completeAppointment,
    fetchPreparation,
    markPrepViewed,
  } = useAppointmentStore()
  const { addMedication } = useMedicationStore()

  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AddForm>({ appointment_date: '', appointment_type: '', notes: '' })
  const [activePrep, setActivePrep] = useState<string | null>(null)
  const [activeLog, setActiveLog] = useState<string | null>(null)
  const [generatingPrep, setGeneratingPrep] = useState(false)
  const [savingLog, setSavingLog] = useState(false)
  const [showPast, setShowPast] = useState(false)

  const patientId = user?.id ?? ''

  useEffect(() => {
    if (patientId) fetchAppointments(patientId)
  }, [patientId])

  const now = new Date().toISOString()
  const upcoming = appointments.filter((a) => !a.completed && a.appointment_date >= now)
  const past = appointments.filter((a) => a.completed || a.appointment_date < now)

  const openAdd = () => {
    setEditingId(null)
    setForm({ appointment_date: '', appointment_type: '', notes: '' })
    setShowAdd(true)
  }

  const handleReschedule = (appt: Appointment) => {
    setEditingId(null)
    setForm({ appointment_date: '', appointment_type: appt.appointment_type ?? '', notes: appt.notes ?? '' })
    setShowAdd(true)
    setShowPast(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEdit = (appt: Appointment) => {
    setEditingId(appt.id)
    const local = new Date(appt.appointment_date)
    // datetime-local format: YYYY-MM-DDTHH:MM
    const pad = (n: number) => String(n).padStart(2, '0')
    const dtLocal = `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}`
    setForm({ appointment_date: dtLocal, appointment_type: appt.appointment_type ?? '', notes: appt.notes ?? '' })
    setShowAdd(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this appointment?')) return
    await deleteAppointment(id)
  }

  const handleAdd = async () => {
    if (!form.appointment_date || !patientId) return
    if (editingId) {
      await editAppointment(editingId, {
        appointment_date: new Date(form.appointment_date).toISOString(),
        appointment_type: form.appointment_type || null,
        notes: form.notes || null,
      })
      setEditingId(null)
    } else {
      await addAppointment({
        patient_id: patientId,
        appointment_date: new Date(form.appointment_date).toISOString(),
        appointment_type: form.appointment_type || null,
        notes: form.notes || null,
      })
    }
    setForm({ appointment_date: '', appointment_type: '', notes: '' })
    setShowAdd(false)
  }

  const handlePrepare = async (id: string) => {
    setActivePrep(id)
    setActiveLog(null)
    if (!preparations[id]) {
      await fetchPreparation(id)
    }
    const prep = preparations[id]
    if (prep && !prep.viewed_by_patient) {
      await markPrepViewed(prep.id)
    }
  }

  const handleGeneratePrep = async (appointmentId: string) => {
    setGeneratingPrep(true)
    try {
      await generateVisitPreparation(appointmentId, patientId)
      await fetchPreparation(appointmentId)
    } catch {
      // swallow — show empty state
    } finally {
      setGeneratingPrep(false)
    }
  }

  const handleCompleteVisit = async (id: string, notes: string, _tasks: string[], medications: NewMedication[]) => {
    setSavingLog(true)
    try {
      await completeAppointment(id, notes)
      // Add any medications prescribed during the visit
      for (const med of medications) {
        if (med.name.trim()) {
          await addMedication({
            patient_id: patientId,
            name: med.name.trim(),
            dose: med.dose || null,
            unit: med.unit || null,
            frequency: med.frequency,
            notes: med.notes || null,
            start_date: today(),
            end_date: null,
            is_injection: false,
            known_side_effects: [],
          })
        }
      }
    } finally {
      setSavingLog(false)
      setActiveLog(null)
    }
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal'

  return (
    <PageWrapper
      title="Appointments"
      headerRight={
        <button
          onClick={() => (showAdd ? setShowAdd(false) : openAdd())}
          className={[
            'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
            showAdd
              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              : 'bg-brand-teal text-white hover:bg-brand-teal-dark active:scale-95',
          ].join(' ')}
        >
          {showAdd ? (
            <><X className="w-3 h-3" /> Cancel</>
          ) : (
            <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg> Add</>
          )}
        </button>
      }
    >
      <div className="px-4 pt-4 space-y-4">
        {/* Add / reschedule form */}
        {showAdd && (
          <Card>
            <h3 className="font-semibold text-gray-800 mb-3">
              {editingId ? 'Edit Appointment' : form.appointment_type ? `Reschedule — ${form.appointment_type}` : 'New Appointment'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Date &amp; time *</label>
                <input
                  type="datetime-local"
                  className={inputClass}
                  min={today()}
                  value={form.appointment_date}
                  onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Type</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Neurology follow-up"
                  value={form.appointment_type}
                  onChange={(e) => setForm({ ...form, appointment_type: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Notes (optional)</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Bring all recent reports"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <Button variant="primary" fullWidth onClick={handleAdd} loading={loading} disabled={!form.appointment_date}>
                {editingId ? 'Save Changes' : 'Save Appointment'}
              </Button>
            </div>
          </Card>
        )}

        {/* Upcoming appointments */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Upcoming</p>
          {upcoming.length === 0 && !loading ? (
            <div className="text-center py-10 text-gray-400 flex flex-col items-center">
              <Calendar className="w-10 h-10 mb-2 text-gray-300" />
              <p className="text-sm font-medium">No upcoming appointments</p>
              <p className="text-xs mt-1">Tap Add to schedule one</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((appt) => (
                <div key={appt.id}>
                  <AppointmentCard
                    appointment={appt}
                    onPrepare={handlePrepare}
                    onComplete={(id) => { setActiveLog(id); setActivePrep(null) }}
                    onReschedule={handleReschedule}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />

                  {activePrep === appt.id && (
                    <div className="mt-2 bg-white rounded-2xl border border-indigo-100 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-700">Visit Preparation</p>
                        <button onClick={() => setActivePrep(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                      </div>
                      <VisitPreparationComponent
                        preparation={preparations[appt.id] ?? null}
                        loading={generatingPrep}
                        onGenerate={() => handleGeneratePrep(appt.id)}
                      />
                    </div>
                  )}

                  {activeLog === appt.id && (
                    <div className="mt-2 bg-white rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-700">Log Visit Outcome</p>
                        <button onClick={() => setActiveLog(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                      </div>
                      <PostVisitLogger
                        appointment={appt}
                        onSave={(notes, tasks, meds) => handleCompleteVisit(appt.id, notes, tasks, meds)}
                        loading={savingLog}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past appointments */}
        {past.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowPast(!showPast)}
              className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 hover:text-gray-600 transition"
            >
              {showPast ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              Past appointments ({past.length})
            </button>

            {showPast && (
              <div className="space-y-3">
                {past.map((appt) => (
                  <div key={appt.id}>
                    <AppointmentCard
                      appointment={appt}
                      onPrepare={handlePrepare}
                      onComplete={(id) => { setActiveLog(id); setActivePrep(null) }}
                      onReschedule={handleReschedule}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />

                    {activeLog === appt.id && (
                      <div className="mt-2 bg-white rounded-2xl border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-gray-700">Log Visit Outcome</p>
                          <button onClick={() => setActiveLog(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                        </div>
                        <PostVisitLogger
                          appointment={appt}
                          onSave={(notes, tasks, meds) => handleCompleteVisit(appt.id, notes, tasks, meds)}
                          loading={savingLog}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
