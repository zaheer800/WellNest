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

const CATEGORIES: { key: SymptomCategory; label: string; icon: string }[] = [
  { key: 'urinary', label: 'Urinary', icon: '🫧' },
  { key: 'neurological', label: 'Neurological', icon: '🧠' },
  { key: 'spinal', label: 'Spinal', icon: '🦴' },
  { key: 'digestive', label: 'Digestive', icon: '🫁' },
  { key: 'cardiac', label: 'Cardiac', icon: '❤️' },
  { key: 'general', label: 'General', icon: '🩺' },
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
  const { symptomLogs, logSymptom, fetchTodayData } = useHealthStore()

  const [selectedCategory, setSelectedCategory] = useState<SymptomCategory>('general')
  const [selectedSymptom, setSelectedSymptom] = useState('')
  const [severity, setSeverity] = useState(3)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const patientId = user?.id ?? ''

  useEffect(() => {
    if (patientId) fetchTodayData(patientId, new Date().toISOString().slice(0, 10))
  }, [patientId])

  const filteredSymptoms = SymptomLibrary.filter((s) => s.category === selectedCategory)

  const handleLog = async () => {
    if (!selectedSymptom || !patientId) return
    setSubmitting(true)
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
    } finally {
      setSubmitting(false)
    }
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
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition ${selectedCategory === cat.key ? 'bg-indigo-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                <span className="text-lg">{cat.icon}</span>
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
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${selectedSymptom === s.name ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}
              >
                {s.name}
              </button>
            ))}
          </div>
          <input
            className="mt-3 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes (optional)</h3>
          <textarea
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            placeholder="Any additional details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Card>

        {success && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-green-700 text-sm text-center font-medium">
            ✓ Symptom logged
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
              {symptomLogs.slice(0, 10).map((log) => (
                <Card key={log.id} padding="sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{log.symptom_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge label={log.symptom_category} color={getCategoryBadgeColor(log.symptom_category as SymptomCategory)} size="sm" />
                        <span className={`text-xs font-medium ${SEVERITY_LABELS[log.severity]?.color}`}>
                          {log.severity}/10
                        </span>
                      </div>
                      {log.notes && <p className="text-xs text-gray-400 mt-1">{log.notes}</p>}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{formatRelative(log.logged_at)}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
