import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useAppointmentStore } from '@/store/appointmentStore'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import AppointmentCard from '@/components/features/appointments/AppointmentCard'
import VisitPreparationComponent from '@/components/features/appointments/VisitPreparation'
import PostVisitLogger from '@/components/features/appointments/PostVisitLogger'
import { generateVisitPreparation } from '@/services/visitPreparation'
import { today } from '@/utils/dateHelpers'

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
    completeAppointment,
    fetchPreparation,
    markPrepViewed,
  } = useAppointmentStore()

  const [showAdd, setShowAdd] = useState(false)
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

  const handleAdd = async () => {
    if (!form.appointment_date || !patientId) return
    await addAppointment({
      patient_id: patientId,
      appointment_date: new Date(form.appointment_date).toISOString(),
      appointment_type: form.appointment_type || null,
      notes: form.notes || null,
    })
    setForm({ appointment_date: '', appointment_type: '', notes: '' })
    setShowAdd(false)
  }

  const handlePrepare = async (id: string) => {
    setActivePrep(id)
    setActiveLog(null)
    if (!preparations[id]) {
      await fetchPreparation(id)
    }
    // Mark as viewed
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

  const handleCompleteVisit = async (id: string, notes: string, tasks: string[]) => {
    setSavingLog(true)
    try {
      await completeAppointment(id, notes)
    } finally {
      setSavingLog(false)
      setActiveLog(null)
    }
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <PageWrapper
      title="Appointments"
      headerRight={
        <button onClick={() => setShowAdd(!showAdd)} className="text-indigo-600 font-semibold text-sm">
          {showAdd ? 'Cancel' : '+ Add'}
        </button>
      }
    >
      <div className="px-4 pt-4 space-y-4">
        {/* Add appointment form */}
        {showAdd && (
          <Card>
            <h3 className="font-semibold text-gray-800 mb-3">New Appointment</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Date & time *</label>
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
                Save Appointment
              </Button>
            </div>
          </Card>
        )}

        {/* Upcoming appointments */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Upcoming</p>
          {upcoming.length === 0 && !loading ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-2">📅</p>
              <p className="text-sm font-medium">No upcoming appointments</p>
              <p className="text-xs mt-1">Tap + Add to schedule one</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((appt) => (
                <div key={appt.id}>
                  <AppointmentCard
                    appointment={appt}
                    onPrepare={handlePrepare}
                    onComplete={(id) => { setActiveLog(id); setActivePrep(null) }}
                  />

                  {/* Inline visit preparation */}
                  {activePrep === appt.id && (
                    <div className="mt-2 bg-white rounded-2xl border border-indigo-100 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-700">Visit Preparation</p>
                        <button onClick={() => setActivePrep(null)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
                      </div>
                      <VisitPreparationComponent
                        preparation={preparations[appt.id] ?? null}
                        loading={generatingPrep}
                        onGenerate={() => handleGeneratePrep(appt.id)}
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
              <span>{showPast ? '▾' : '▸'}</span>
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
                    />

                    {/* Inline post-visit logger */}
                    {activeLog === appt.id && (
                      <div className="mt-2 bg-white rounded-2xl border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-gray-700">Log Visit Notes</p>
                          <button onClick={() => setActiveLog(null)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
                        </div>
                        <PostVisitLogger
                          appointment={appt}
                          onSave={(notes, tasks) => handleCompleteVisit(appt.id, notes, tasks)}
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
