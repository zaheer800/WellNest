import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useMedicationStore } from '@/store/medicationStore'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { today } from '@/utils/dateHelpers'

interface AddForm {
  name: string
  dose: string
  unit: string
  frequency: 'daily' | 'alternate_days' | 'weekly'
  notes: string
}

export default function MedicationsScreen() {
  const { user } = useAuthStore()
  const { medications, loading, fetchMedications, markTaken, addMedication, removeMedication } = useMedicationStore()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<AddForm>({ name: '', dose: '', unit: 'mg', frequency: 'daily', notes: '' })

  const date = today()
  const patientId = user?.id ?? ''

  useEffect(() => {
    if (patientId) fetchMedications(patientId, date)
  }, [patientId, date])

  const takenCount = medications.filter((m) => m.log?.taken).length
  const totalCount = medications.filter((m) => m.is_active).length
  const compliancePct = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0

  const handleAdd = async () => {
    if (!form.name.trim() || !patientId) return
    await addMedication({ patient_id: patientId, name: form.name, dose: form.dose || null, unit: form.unit || null, frequency: form.frequency, notes: form.notes || null, start_date: date, end_date: null })
    setForm({ name: '', dose: '', unit: 'mg', frequency: 'daily', notes: '' })
    setShowAdd(false)
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <PageWrapper title="Medications" headerRight={
      <button onClick={() => setShowAdd(!showAdd)} className="text-indigo-600 font-semibold text-sm">
        {showAdd ? 'Cancel' : '+ Add'}
      </button>
    }>
      <div className="px-4 pt-4 space-y-4">
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
              return (
                <Card key={med.id} padding="sm">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => markTaken(med.id, patientId, date, !taken)}
                      className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition ${taken ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-300 text-transparent hover:border-indigo-400'}`}
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
      </div>
    </PageWrapper>
  )
}
