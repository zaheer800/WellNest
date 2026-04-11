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
import { shouldTakeMedicationToday } from '@/utils/healthScore'
import type { TimeOfDay, MedicationScheduleConfig } from '@/types/health.types'
import { Pill, Syringe, Clock } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Frequency = 'daily' | 'alternate_days' | 'weekly'

interface AddForm {
  name: string
  dose: string
  unit: string
  frequency: Frequency
  times_per_day: 1 | 2 | 3 | 4
  times_of_day: TimeOfDay[]
  notes: string
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'alternate_days', label: 'Alternate days' },
  { value: 'weekly', label: 'Weekly' },
]

const TIME_OF_DAY_OPTIONS: { value: TimeOfDay; label: string; emoji: string }[] = [
  { value: 'morning', label: 'Morning', emoji: '🌅' },
  { value: 'afternoon', label: 'Afternoon', emoji: '☀️' },
  { value: 'evening', label: 'Evening', emoji: '🌆' },
  { value: 'bedtime', label: 'Bedtime', emoji: '🌙' },
]

// Patient-friendly: form factors only — dose strength is freetext in the dose field
const UNIT_OPTIONS = ['tablet', 'capsule', 'ml', 'drop', 'puff', 'sachet', 'patch', 'injection', 'other']

const TIME_OF_DAY_LABEL: Record<TimeOfDay, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  bedtime: 'Bedtime',
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatSchedule(config: MedicationScheduleConfig): string {
  const times = config.times_of_day ?? []
  if (times.length === 0) return ''
  return times.map((t) => TIME_OF_DAY_LABEL[t]).join(' · ')
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function MedicationsScreen() {
  const { user } = useAuthStore()
  const { medications, loading, error, fetchMedications, markTaken, addMedication, removeMedication } = useMedicationStore()
  const { courses: injectionCourses, sideEffects, loading: injectionLoading, error: injectionError, fetchCourses, addCourse, logDose, fetchSideEffects, addSideEffect, resolveSideEffect } = useInjectionStore()

  const [showAdd, setShowAdd] = useState(false)
  const [tab, setTab] = useState<'medications' | 'injections' | 'sideeffects'>('medications')
  const [form, setForm] = useState<AddForm>({
    name: '',
    dose: '',
    unit: 'tablet',
    frequency: 'daily',
    times_per_day: 1,
    times_of_day: [],
    notes: '',
  })
  const [showAddInjection, setShowAddInjection] = useState(false)
  const [injectionForm, setInjectionForm] = useState({
    medication_id: '',
    total_doses: '',
    frequency: 'daily' as Frequency,
    start_date: today(),
    notes: '',
  })
  const [showAddSideEffect, setShowAddSideEffect] = useState(false)
  const [selectedMedicationForSideEffect, setSelectedMedicationForSideEffect] = useState<string | null>(null)

  const date = today()
  const patientId = user?.id ?? ''

  useEffect(() => {
    if (patientId) {
      fetchMedications(patientId, date)
      if (tab === 'injections') fetchCourses(patientId)
      if (tab === 'sideeffects') fetchSideEffects(patientId)
    }
  }, [patientId, date, tab])

  const todayDate = new Date(date)
  const dueTodayMeds = medications.filter((m) => m.is_active && shouldTakeMedicationToday(m, todayDate))
  const takenCount = dueTodayMeds.filter((m) => m.log?.taken).length
  const totalCount = dueTodayMeds.length
  const compliancePct = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100

  const toggleTimeOfDay = (t: TimeOfDay) => {
    setForm((prev) => ({
      ...prev,
      times_of_day: prev.times_of_day.includes(t)
        ? prev.times_of_day.filter((x) => x !== t)
        : [...prev.times_of_day, t],
    }))
  }

  const resetForm = () =>
    setForm({ name: '', dose: '', unit: 'tablet', frequency: 'daily', times_per_day: 1, times_of_day: [], notes: '' })

  const handleAdd = async () => {
    if (!form.name.trim() || !patientId) return
    const scheduleConfig: MedicationScheduleConfig = {
      times_per_day: (form.times_of_day.length > 0 ? form.times_of_day.length : 1) as 1 | 2 | 3 | 4,
      times_of_day: form.times_of_day.length > 0 ? form.times_of_day : undefined,
    }
    try {
      await addMedication({
        patient_id: patientId,
        name: form.name,
        dose: form.dose || null,
        unit: form.unit || null,
        frequency: form.frequency,
        schedule_config: scheduleConfig,
        notes: form.notes || null,
        start_date: date,
        end_date: null,
        is_injection: false,
        known_side_effects: [],
      })
      resetForm()
      setShowAdd(false)
    } catch {
      // error shown via store state
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
        notes: injectionForm.notes || undefined,
      })
      setInjectionForm({ medication_id: '', total_doses: '', frequency: 'daily', start_date: today(), notes: '' })
      setShowAddInjection(false)
    } catch {
      // error shown via store state
    }
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const labelClass = 'text-sm font-medium text-gray-700 mb-1.5 block'

  // ── Add Medication Form ──────────────────────────────────────────────────────

  const AddMedicationForm = (
    <Card>
      <h3 className="font-semibold text-gray-800 mb-4 text-base">Add Medication</h3>
      <div className="space-y-4">

        {/* Name */}
        <div>
          <label className={labelClass}>Medication name *</label>
          <input
            className={inputClass}
            placeholder="e.g. Metformin, Paracetamol"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Form type + Dose */}
        <div className="flex gap-3">
          <div className="w-36">
            <label className={labelClass}>Form</label>
            <select
              className={inputClass}
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className={labelClass}>Strength <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              className={inputClass}
              placeholder="e.g. 500mg, 10ml"
              value={form.dose}
              onChange={(e) => setForm({ ...form, dose: e.target.value })}
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 -mt-2">Strength is printed on the packet — skip if unsure.</p>

        {/* Frequency chips */}
        <div>
          <label className={labelClass}>How often?</label>
          <div className="flex gap-2">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm({ ...form, frequency: opt.value })}
                className={[
                  'flex-1 py-2.5 px-2 rounded-xl border text-sm font-medium transition-all',
                  form.frequency === opt.value
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time of day chips — multi-select */}
        <div>
          <label className={labelClass}>
            When do you take it?
            <span className="text-gray-400 font-normal ml-1">Select all that apply</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TIME_OF_DAY_OPTIONS.map((opt) => {
              const selected = form.times_of_day.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleTimeOfDay(opt.value)}
                  className={[
                    'flex items-center gap-2.5 py-3 px-3 rounded-xl border text-sm font-medium transition-all',
                    selected
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300',
                  ].join(' ')}
                >
                  <span className="text-base">{opt.emoji}</span>
                  {opt.label}
                  {selected && (
                    <span className="ml-auto w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={labelClass}>Notes <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            className={inputClass}
            placeholder="e.g. Take with food"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 rounded-xl px-3 py-2">{error}</div>
        )}

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" fullWidth onClick={() => { resetForm(); setShowAdd(false) }}>
            Cancel
          </Button>
          <Button variant="primary" fullWidth onClick={handleAdd} loading={loading}>
            Save
          </Button>
        </div>
      </div>
    </Card>
  )

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <PageWrapper title="Medications" headerRight={
      (tab === 'medications' || tab === 'injections') ? (
        <button
          onClick={() => {
            if (tab === 'medications') setShowAdd(!showAdd)
            else setShowAddInjection(!showAddInjection)
          }}
          className={[
            'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all',
            (showAdd || showAddInjection)
              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95',
          ].join(' ')}
        >
          {(showAdd || showAddInjection) ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add
            </>
          )}
        </button>
      ) : undefined
    }>
      <div className="px-4 pt-4 space-y-4">

        {/* Tab navigation */}
        <div className="flex gap-1 border-b border-gray-200 -mx-4 px-4">
          {(['medications', 'injections', 'sideeffects'] as const).map((t) => {
            const labels: Record<string, string> = {
              medications: 'Medications',
              injections: `Injections${injectionCourses.length > 0 ? ` (${injectionCourses.length})` : ''}`,
              sideeffects: `Side Effects${sideEffects.length > 0 ? ` (${sideEffects.length})` : ''}`,
            }
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-3 px-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  tab === t
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {labels[t]}
              </button>
            )
          })}
        </div>

        {/* ── Medications Tab ─────────────────────────────────────────────── */}
        {tab === 'medications' && (
          <>
            {/* Compliance summary */}
            <Card padding="sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Today's compliance</span>
                <span className="text-sm font-bold text-indigo-600">{takenCount}/{totalCount} taken</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${compliancePct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{compliancePct}% complete</p>
            </Card>

            {showAdd && AddMedicationForm}

            {/* Medication list */}
            {medications.length === 0 && !loading ? (
              <div className="text-center py-16 text-gray-400 flex flex-col items-center gap-2">
                <Pill className="w-12 h-12 text-gray-200" />
                <p className="font-semibold text-gray-500">No medications yet</p>
                <p className="text-sm">Tap Add to add your first medication</p>
              </div>
            ) : (
              <div className="space-y-2">
                {medications.map((med) => {
                  const taken = med.log?.taken ?? false
                  const isDueToday = shouldTakeMedicationToday(med, todayDate)
                  const scheduleLabel = formatSchedule(med.schedule_config ?? {})
                  return (
                    <Card key={med.id} padding="sm">
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => isDueToday && markTaken(med.id, patientId, date, !taken)}
                          disabled={!isDueToday}
                          className={[
                            'w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition',
                            taken
                              ? 'bg-indigo-500 border-indigo-500 text-white'
                              : isDueToday
                                ? 'border-gray-300 text-transparent hover:border-indigo-400 active:scale-95'
                                : 'border-gray-200 bg-gray-50 text-transparent cursor-not-allowed',
                          ].join(' ')}
                          aria-label={taken ? 'Mark as not taken' : 'Mark as taken'}
                        >
                          {taken && (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`font-semibold text-sm ${taken ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                              {med.name}
                            </p>
                            {taken && <Badge label="Taken" color="green" size="sm" />}
                            {!isDueToday && <Badge label="Not due" color="gray" size="sm" />}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {(med.dose || med.unit) && (
                              <span className="text-xs text-gray-400">
                                {med.dose} {med.unit} · {med.frequency.replace('_', ' ')}
                              </span>
                            )}
                            {scheduleLabel && (
                              <span className="flex items-center gap-1 text-xs text-indigo-400 font-medium">
                                <Clock className="w-3 h-3" />
                                {scheduleLabel}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeMedication(med.id)}
                          className="text-gray-300 hover:text-red-400 p-1.5 transition flex-shrink-0"
                          aria-label="Remove medication"
                        >
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

        {/* ── Injections Tab ──────────────────────────────────────────────── */}
        {tab === 'injections' && (
          <>
            {showAddInjection && (
              <Card>
                <h3 className="font-semibold text-gray-800 mb-4 text-base">Add Injection Course</h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Medication *</label>
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
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className={labelClass}>Total doses *</label>
                      <input
                        type="number"
                        className={inputClass}
                        placeholder="30"
                        value={injectionForm.total_doses}
                        onChange={(e) => setInjectionForm({ ...injectionForm, total_doses: e.target.value })}
                      />
                    </div>
                    <div className="flex-1">
                      <label className={labelClass}>Frequency</label>
                      <div className="flex flex-col gap-1.5">
                        {FREQUENCY_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setInjectionForm({ ...injectionForm, frequency: opt.value })}
                            className={[
                              'py-2 px-3 rounded-xl border text-sm font-medium transition-all text-left',
                              injectionForm.frequency === opt.value
                                ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 text-gray-600',
                            ].join(' ')}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Start date</label>
                    <input
                      type="date"
                      className={inputClass}
                      value={injectionForm.start_date}
                      onChange={(e) => setInjectionForm({ ...injectionForm, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input
                      className={inputClass}
                      placeholder="e.g. Subcutaneous injection"
                      value={injectionForm.notes}
                      onChange={(e) => setInjectionForm({ ...injectionForm, notes: e.target.value })}
                    />
                  </div>
                  {injectionError && (
                    <div className="text-red-600 text-sm bg-red-50 rounded-xl px-3 py-2">{injectionError}</div>
                  )}
                  <Button variant="primary" fullWidth onClick={handleAddInjection} loading={injectionLoading}>
                    Save Injection Course
                  </Button>
                </div>
              </Card>
            )}

            {injectionCourses.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center gap-2 text-gray-400">
                <Syringe className="w-12 h-12 text-gray-200" />
                <p className="font-semibold text-gray-500">No injection courses yet</p>
                <p className="text-sm">Tap Add to set up an injection course</p>
              </div>
            ) : (
              <div className="space-y-3">
                {injectionCourses.map((course) => (
                  <InjectionCourse
                    key={course.id}
                    course={course}
                    onLogDose={(administeredAt, by) => logDose(course, administeredAt, by)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Side Effects Tab ────────────────────────────────────────────── */}
        {tab === 'sideeffects' && (
          <>
            <Card>
              <SideEffectMonitor
                sideEffects={sideEffects}
                onAdd={() => {
                  if (medications.length > 0 && !selectedMedicationForSideEffect) {
                    setSelectedMedicationForSideEffect(medications[0].id)
                  }
                  setShowAddSideEffect(true)
                }}
                onResolve={(id) => { resolveSideEffect(id).catch(() => {}) }}
              />
            </Card>

            {showAddSideEffect && medications.length > 0 && !selectedMedicationForSideEffect && (
              <Card>
                <p className="text-sm font-medium text-gray-700 mb-3">Which medication is this side effect from?</p>
                <div className="space-y-2">
                  {medications.map((med) => (
                    <button
                      key={med.id}
                      onClick={() => setSelectedMedicationForSideEffect(med.id)}
                      className="w-full text-left px-4 py-3.5 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition text-sm font-medium text-gray-800"
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
            await addSideEffect({ patient_id: patientId, ...data })
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
