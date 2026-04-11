import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useHealthStore } from '@/store/healthStore'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { SymptomLibrary } from '@/constants/symptoms'
import type { SymptomCategory } from '@/types/health.types'
import { formatRelative } from '@/utils/dateHelpers'

import { Droplets, Brain, Bone, ActivitySquare, HeartPulse, Stethoscope, Check, AlertCircle, Pencil, Trash2, X } from 'lucide-react'

const CATEGORIES: { key: SymptomCategory; label: string; icon: React.ReactNode }[] = [
  { key: 'urinary', label: 'Urinary', icon: <Droplets className="w-5 h-5" /> },
  { key: 'neurological', label: 'Neurological', icon: <Brain className="w-5 h-5" /> },
  { key: 'spinal', label: 'Spinal', icon: <Bone className="w-5 h-5" /> },
  { key: 'digestive', label: 'Digestive', icon: <ActivitySquare className="w-5 h-5" /> },
  { key: 'cardiac', label: 'Cardiac', icon: <HeartPulse className="w-5 h-5" /> },
  { key: 'general', label: 'General', icon: <Stethoscope className="w-5 h-5" /> },
]

const SEVERITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Minimal', color: 'text-green-500' },
  2: { label: 'Very mild', color: 'text-green-500' },
  3: { label: 'Mild', color: 'text-yellow-500' },
  4: { label: 'Mild-moderate', color: 'text-yellow-500' },
  5: { label: 'Moderate', color: 'text-orange-500' },
  6: { label: 'Moderate-severe', color: 'text-orange-500' },
  7: { label: 'Severe', color: 'text-red-500' },
  8: { label: 'Very severe', color: 'text-red-500' },
  9: { label: 'Intense', color: 'text-red-600' },
  10: { label: 'Worst possible', color: 'text-red-700' },
}

export default function SymptomsScreen() {
  const { user } = useAuthStore()
  const { symptomLogs, logSymptom, editSymptom, deleteSymptom, fetchTodayData } = useHealthStore()

  const [selectedCategory, setSelectedCategory] = useState<SymptomCategory>('general')
  const [selectedSymptom, setSelectedSymptom] = useState('')
  const [severity, setSeverity] = useState(3)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSeverity, setEditSeverity] = useState(3)
  const [editNotes, setEditNotes] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const patientId = user?.id ?? ''

  useEffect(() => {
    if (patientId) fetchTodayData(patientId, new Date().toISOString().slice(0, 10))
  }, [patientId])

  const filteredSymptoms = SymptomLibrary.filter((s) => s.category === selectedCategory)

  const handleLog = async () => {
    if (!selectedSymptom || !patientId) return
    setSubmitting(true)
    setSaveError(null)
    try {
      await logSymptom({
        patient_id: patientId,
        symptom_name: selectedSymptom,
        symptom_category: selectedCategory,
        severity,
        notes: notes.trim() || undefined,
      })
      setSelectedSymptom('')
      setNotes('')
      setSeverity(3)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err: any) {
      setSaveError(err?.message ?? 'Failed to save symptom. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (log: (typeof symptomLogs)[0]) => {
    setEditingId(log.id)
    setEditSeverity(log.severity)
    setEditNotes(log.notes ?? '')
    const d = new Date(log.logged_at)
    setEditDate(d.toISOString().slice(0, 10))
    setEditTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
  }

  const cancelEdit = () => setEditingId(null)

  const confirmEdit = async (id: string) => {
    setEditSaving(true)
    try {
      const [hh, mm] = editTime.split(':').map(Number)
      const ts = new Date(editDate)
      ts.setHours(hh, mm, 0, 0)
      await editSymptom(id, {
        severity: editSeverity,
        notes: editNotes.trim() || null,
        logged_at: ts.toISOString(),
      })
      setEditingId(null)
    } finally {
      setEditSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteSymptom(id)
  }

  const getCategoryBadgeColor = (cat: SymptomCategory) => {
    const map: Record<SymptomCategory, 'blue' | 'indigo' | 'gray' | 'green' | 'red' | 'yellow'> = {
      urinary: 'blue', neurological: 'indigo', spinal: 'gray', digestive: 'green', cardiac: 'red', general: 'yellow', other: 'gray',
    }
    return map[cat] ?? 'gray'
  }

  return (
    <PageWrapper title="Symptoms">
      <div className="px-4 pt-4 space-y-5">
        {/* Category selector */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Category</h3>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => { setSelectedCategory(cat.key); setSelectedSymptom('') }}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition ${selectedCategory === cat.key ? 'bg-brand-teal text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                <div className={selectedCategory === cat.key ? 'text-white' : 'text-gray-500'}>{cat.icon}</div>
                {cat.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Symptom selector */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Symptom</h3>
          <div className="flex flex-wrap gap-2">
            {filteredSymptoms.map((s) => (
              <button
                key={s.name}
                onClick={() => setSelectedSymptom(s.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${selectedSymptom === s.name ? 'bg-brand-teal border-brand-teal text-white' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}
              >
                {s.name}
              </button>
            ))}
          </div>
          <input
            className="mt-3 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
            placeholder="Or type a symptom..."
            value={selectedSymptom}
            onChange={(e) => setSelectedSymptom(e.target.value)}
          />
        </Card>

        {/* Severity */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Severity</h3>
            <span className={`text-sm font-semibold ${SEVERITY_LABELS[severity]?.color}`}>
              {severity} — {SEVERITY_LABELS[severity]?.label}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Minimal (1)</span>
            <span>Worst (10)</span>
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Notes (optional)</h3>
            <span className="text-xs text-gray-400">{notes.length} chars</span>
          </div>
          <textarea
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal resize-y min-h-[96px]"
            placeholder="Any additional details — as much as you need..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          {saveError && (
            <div className="mt-2 text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2 flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {saveError}
            </div>
          )}
        </Card>

        {success && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-green-700 text-sm flex items-center justify-center gap-2 font-medium">
            <Check className="w-4 h-4" /> Symptom logged
          </div>
        )}

        <Button variant="primary" fullWidth onClick={handleLog} loading={submitting} disabled={!selectedSymptom}>
          Log Symptom
        </Button>

        {/* Recent symptoms */}
        {symptomLogs.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Recent</h2>
            <div className="space-y-2">
              {symptomLogs.slice(0, 10).map((log) => {
                const isEditing = editingId === log.id
                return (
                  <Card key={log.id} padding="sm">
                    {isEditing ? (
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-800">{log.symptom_name}</p>
                          <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Severity */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">Severity</span>
                            <span className={`text-xs font-semibold ${SEVERITY_LABELS[editSeverity]?.color}`}>
                              {editSeverity} — {SEVERITY_LABELS[editSeverity]?.label}
                            </span>
                          </div>
                          <input
                            type="range" min={1} max={10} value={editSeverity}
                            onChange={(e) => setEditSeverity(Number(e.target.value))}
                            className="w-full accent-indigo-500"
                          />
                        </div>

                        {/* Date & Time */}
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Date &amp; time logged</span>
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={editDate}
                              max={new Date().toISOString().slice(0, 10)}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="flex-1 min-w-0 border border-gray-200 rounded-xl px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                            />
                            <input
                              type="time"
                              value={editTime}
                              onChange={(e) => setEditTime(e.target.value)}
                              className="flex-1 min-w-0 border border-gray-200 rounded-xl px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                            />
                          </div>
                        </div>

                        {/* Notes */}
                        <textarea
                          rows={3}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal resize-none"
                          placeholder="Notes (optional)..."
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                        />

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => confirmEdit(log.id)}
                            disabled={editSaving}
                            className="flex-1 py-2 rounded-xl bg-brand-teal text-white text-xs font-semibold disabled:opacity-60"
                          >
                            {editSaving ? 'Saving…' : 'Save changes'}
                          </button>
                          <button onClick={cancelEdit} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{log.symptom_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge label={log.symptom_category} color={getCategoryBadgeColor(log.symptom_category as SymptomCategory)} size="sm" />
                            <span className={`text-xs font-medium ${SEVERITY_LABELS[log.severity]?.color}`}>
                              {log.severity}/10
                            </span>
                          </div>
                          {log.notes && <p className="text-xs text-gray-400 mt-1 truncate">{log.notes}</p>}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-xs text-gray-400">{formatRelative(log.logged_at)}</span>
                          <button
                            onClick={() => startEdit(log)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-teal hover:bg-brand-teal-light transition"
                            aria-label="Edit symptom"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                            aria-label="Delete symptom"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
