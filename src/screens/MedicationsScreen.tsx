import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useMedicationStore } from '@/store/medicationStore'
import { useInjectionStore } from '@/store/injectionStore'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import InjectionCourse from '@/components/features/medications/InjectionCourse'
import SideEffectMonitor from '@/components/features/medications/SideEffectMonitor'
import AddSideEffectModal from '@/components/features/medications/AddSideEffectModal'
import { today } from '@/utils/dateHelpers'
import { debugInjectionCoursesAccess } from '@/services/supabase'

interface AddForm {
  name: string
  dose: string
  unit: string
  frequency: 'daily' | 'alternate_days' | 'weekly'
  notes: string
}

export default function MedicationsScreen() {
  const { user } = useAuthStore()
  const { medications, loading, error, fetchMedications, markTaken, addMedication, removeMedication } = useMedicationStore()
  const { courses: injectionCourses, sideEffects, loading: injectionLoading, error: injectionError, fetchCourses, addCourse, markDoseToday, fetchSideEffects, addSideEffect, resolveSideEffect } = useInjectionStore()
  const [showAdd, setShowAdd] = useState(false)
  const [tab, setTab] = useState<'medications' | 'injections' | 'sideeffects'>('medications')
  const [form, setForm] = useState<AddForm>({ name: '', dose: '', unit: 'mg', frequency: 'daily', notes: '' })
  const [showAddInjection, setShowAddInjection] = useState(false)
  const [injectionForm, setInjectionForm] = useState({
    medication_id: '',
    total_doses: '',
    frequency: 'daily' as 'daily' | 'alternate_days' | 'weekly',
    start_date: today(),
    notes: ''
  })
  const [showAddSideEffect, setShowAddSideEffect] = useState(false)
  const [selectedMedicationForSideEffect, setSelectedMedicationForSideEffect] = useState<string | null>(null)

  const date = today()
  const patientId = user?.id ?? ''

  useEffect(() => {
    if (patientId) {
      fetchMedications(patientId, date)
      if (tab === 'injections') {
        fetchCourses(patientId)
      }
      if (tab === 'sideeffects') {
        fetchSideEffects(patientId)
      }
    }
  }, [patientId, date, tab])

  const takenCount = medications.filter((m) => m.log?.taken).length
  const totalCount = medications.filter((m) => m.is_active).length
  const compliancePct = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0

  // Helper function to check if medication should be taken today
  const shouldTakeToday = (med: any) => {
    const startDate = med.start_date ? new Date(med.start_date) : new Date(med.created_at)
    const today = new Date(date)
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    switch (med.frequency) {
      case 'daily':
        return true
      case 'alternate_days':
        return daysSinceStart % 2 === 0
      case 'weekly':
        return daysSinceStart % 7 === 0
      default:
        return true
    }
  }

  const handleAdd = async () => {
    if (!form.name.trim() || !patientId) return
    try {
      await addMedication({ patient_id: patientId, name: form.name, dose: form.dose || null, unit: form.unit || null, frequency: form.frequency, notes: form.notes || null, start_date: date, end_date: null, is_injection: false, known_side_effects: [] })
      setForm({ name: '', dose: '', unit: 'mg', frequency: 'daily', notes: '' })
      setShowAdd(false)
    } catch (err) {
      // Error is already set in the store, but we could show a toast here
    }
  }

  const handleAddInjection = async () => {
    if (!injectionForm.medication_id || !injectionForm.total_doses || !patientId) return
    try {
      await addCourse({
        patient_id: patientId,
        medication_id: injectionForm.medication_id,
        total_doses: parseInt(injectionForm.total_doses),
        frequency: injectionForm.frequency,
        start_date: injectionForm.start_date,
        notes: injectionForm.notes || undefined
      })
      setInjectionForm({
        medication_id: '',
        total_doses: '',
        frequency: 'daily',
        start_date: today(),
        notes: ''
      })
      setShowAddInjection(false)
    } catch (err) {
      // Error is already set in the store, but we could show a toast here
    }
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <PageWrapper title="Medications" headerRight={
      (tab === 'medications' && (
        <button onClick={() => setShowAdd(!showAdd)} className="text-indigo-600 font-semibold text-sm">
          {showAdd ? 'Cancel' : '+ Add'}
        </button>
      )) ||
      (tab === 'injections' && (
        <button onClick={() => setShowAddInjection(!showAddInjection)} className="text-indigo-600 font-semibold text-sm">
          {showAddInjection ? 'Cancel' : '+ Add'}
        </button>
      ))
    }>
      <div className="px-4 pt-4 space-y-4">
        {/* Tab navigation */}
        <div className="flex gap-2 border-b border-gray-200 -mx-4 px-4">
          <button
            onClick={() => setTab('medications')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition ${
              tab === 'medications'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Medications
          </button>
          <button
            onClick={() => setTab('injections')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition ${
              tab === 'injections'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Injections {injectionCourses.length > 0 && `(${injectionCourses.length})`}
          </button>
          <button
            onClick={() => setTab('sideeffects')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition ${
              tab === 'sideeffects'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Side Effects {sideEffects.length > 0 && `(${sideEffects.length})`}
          </button>
        </div>

        {/* Medications Tab */}
        {tab === 'medications' && (
          <>
            {/* Compliance summary */}
            <Card padding="sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Today's compliance</span>
                <span className="text-sm font-bold text-indigo-600">{takenCount}/{totalCount} taken</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${compliancePct}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{compliancePct}% complete</p>
            </Card>

            {/* Add form */}
            {showAdd && (
              <Card>
                <h3 className="font-semibold text-gray-800 mb-3">Add Medication</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Medication name *</label>
                    <input className={inputClass} placeholder="e.g. Metformin" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Dose</label>
                      <input className={inputClass} placeholder="500" value={form.dose} onChange={(e) => setForm({ ...form, dose: e.target.value })} />
                    </div>
                    <div className="w-24">
                      <label className="text-xs text-gray-500 mb-1 block">Unit</label>
                      <select className={inputClass} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                        {['mg', 'g', 'ml', 'IU', 'mcg', 'tablet', 'capsule', 'drop'].map((u) => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Frequency</label>
                    <select className={inputClass} value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value as AddForm['frequency'] })}>
                      <option value="daily">Daily</option>
                      <option value="alternate_days">Alternate days</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Notes (optional)</label>
                    <input className={inputClass} placeholder="e.g. Take with food" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">
                      {error}
                    </div>
                  )}
                  <Button variant="primary" fullWidth onClick={handleAdd} loading={loading}>Save Medication</Button>
                </div>
              </Card>
            )}

            {/* Medication list */}
            {medications.length === 0 && !loading ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-3">💊</p>
                <p className="font-medium">No medications yet</p>
                <p className="text-sm">Tap + Add to add your first medication</p>
              </div>
            ) : (
              <div className="space-y-2">
                {medications.map((med) => {
                  const taken = med.log?.taken ?? false
                  const isDueToday = shouldTakeToday(med)
                  return (
                    <Card key={med.id} padding="sm">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => isDueToday && markTaken(med.id, patientId, date, !taken)}
                          disabled={!isDueToday}
                          className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition ${
                            taken 
                              ? 'bg-indigo-500 border-indigo-500 text-white' 
                              : isDueToday 
                                ? 'border-gray-300 text-transparent hover:border-indigo-400'
                                : 'border-gray-200 bg-gray-100 text-transparent cursor-not-allowed'
                          }`}
                        >
                          {taken && (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium text-sm ${taken ? 'line-through text-gray-400' : 'text-gray-800'}`}>{med.name}</p>
                            {taken && <Badge label="Taken" color="green" size="sm" />}
                            {!isDueToday && <Badge label="Not due today" color="gray" size="sm" />}
                          </div>
                          {(med.dose || med.unit) && (
                            <p className="text-xs text-gray-400">{med.dose} {med.unit} · {med.frequency.replace('_', ' ')}</p>
                          )}
                        </div>

                        <button onClick={() => removeMedication(med.id)} className="text-gray-300 hover:text-red-400 p-1 transition">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Injections Tab */}
        {tab === 'injections' && (
          <>
            {/* Add injection form */}
            {showAddInjection && (
              <Card>
                <h3 className="font-semibold text-gray-800 mb-3">Add Injection Course</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Medication *</label>
                    <select 
                      className={inputClass} 
                      value={injectionForm.medication_id} 
                      onChange={(e) => setInjectionForm({ ...injectionForm, medication_id: e.target.value })} 
                    >
                      <option value="">Select medication</option>
                      {medications.map((med) => (
                        <option key={med.id} value={med.id}>{med.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Total doses *</label>
                      <input 
                        type="number"
                        className={inputClass} 
                        placeholder="30" 
                        value={injectionForm.total_doses} 
                        onChange={(e) => setInjectionForm({ ...injectionForm, total_doses: e.target.value })} 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Frequency</label>
                      <select 
                        className={inputClass} 
                        value={injectionForm.frequency} 
                        onChange={(e) => setInjectionForm({ ...injectionForm, frequency: e.target.value as typeof injectionForm.frequency })} 
                      >
                        <option value="daily">Daily</option>
                        <option value="alternate_days">Alternate days</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Start date</label>
                    <input 
                      type="date"
                      className={inputClass} 
                      value={injectionForm.start_date} 
                      onChange={(e) => setInjectionForm({ ...injectionForm, start_date: e.target.value })} 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Notes (optional)</label>
                    <input 
                      className={inputClass} 
                      placeholder="e.g. Subcutaneous injection" 
                      value={injectionForm.notes} 
                      onChange={(e) => setInjectionForm({ ...injectionForm, notes: e.target.value })} 
                    />
                  </div>
                  {injectionError && (
                    <div className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">
                      {injectionError}
                    </div>
                  )}
                  <Button variant="primary" fullWidth onClick={handleAddInjection} loading={injectionLoading}>Save Injection Course</Button>
                </div>
              </Card>
            )}

            {injectionCourses.length === 0 ? (
              <Card>
                <div className="text-center py-10 text-gray-400">
                  <p className="text-2xl mb-2">💉</p>
                  <p className="font-medium">No injection courses yet</p>
                  <p className="text-xs mt-1">You can add injection course management later</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    onClick={async () => {
                      await debugInjectionCoursesAccess()
                    }}
                  >
                    Debug Database Access
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {injectionCourses.map((course) => (
                  <InjectionCourse
                    key={course.id}
                    course={course}
                    onMarkDose={() => markDoseToday(course)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Side Effects Tab */}
        {tab === 'sideeffects' && (
          <>
            <Card>
              <SideEffectMonitor
                sideEffects={sideEffects}
                onAdd={() => {
                  // If a medication is selected, use that; otherwise prompt to select one
                  if (medications.length > 0 && !selectedMedicationForSideEffect) {
                    // Open medication picker or directly open the modal with the first medication
                    setSelectedMedicationForSideEffect(medications[0].id)
                  }
                  setShowAddSideEffect(true)
                }}
                onResolve={(id) => {
                  resolveSideEffect(id).catch(() => {})
                }}
              />
            </Card>

            {/* Medication selector note if no medication chosen */}
            {showAddSideEffect && medications.length > 0 && !selectedMedicationForSideEffect && (
              <Card>
                <p className="text-sm text-gray-600 mb-3">Which medication is this side effect from?</p>
                <div className="space-y-2">
                  {medications.map((med) => (
                    <button
                      key={med.id}
                      onClick={() => setSelectedMedicationForSideEffect(med.id)}
                      className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition"
                    >
                      {med.name}
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Add Side Effect Modal */}
      {showAddSideEffect && selectedMedicationForSideEffect && (
        <AddSideEffectModal
          medicationId={selectedMedicationForSideEffect}
          onAdd={async (data) => {
            await addSideEffect({
              patient_id: patientId,
              ...data,
            })
          }}
          onClose={() => {
            setShowAddSideEffect(false)
            setSelectedMedicationForSideEffect(null)
          }}
        />
      )}
    </PageWrapper>
  )
}
