import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useHealthStore } from '@/store/healthStore'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { today, formatTime } from '@/utils/dateHelpers'
import { getSeverityColor } from '@/utils/formatters'

const EXERCISE_TYPES = ['Walking', 'Running', 'Swimming', 'Cycling', 'Yoga', 'Stretching', 'Physiotherapy', 'Weight training', 'Other']

export default function ExerciseScreen() {
  const { user } = useAuthStore()
  const { exerciseLogs, activityRestrictions, logExercise, fetchTodayData } = useHealthStore()

  const [exerciseType, setExerciseType] = useState('Walking')
  const [duration, setDuration] = useState('')
  const [isPhysio, setIsPhysio] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const patientId = user?.id ?? ''
  const date = today()

  useEffect(() => {
    if (patientId) fetchTodayData(patientId, date)
  }, [patientId, date])

  const handleLog = async () => {
    if (!patientId) return
    setSubmitting(true)
    try {
      await logExercise({
        patient_id: patientId,
        exercise_type: exerciseType,
        is_physiotherapy: isPhysio,
        duration_minutes: duration ? Number(duration) : undefined,
      })
      setDuration('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <PageWrapper title="Exercise">
      <div className="px-4 pt-4 space-y-5">
        {/* Restrictions banner */}
        {activityRestrictions.length > 0 && (
          <div className="space-y-2">
            {activityRestrictions.map((r) => (
              <div key={r.id} className={`rounded-xl p-3 flex items-start gap-2 ${r.severity === 'absolute' ? 'bg-red-50 border border-red-100' : r.severity === 'strict' ? 'bg-orange-50 border border-orange-100' : 'bg-yellow-50 border border-yellow-100'}`}>
                <span className="text-lg flex-shrink-0">{r.severity === 'absolute' ? '🚫' : '⚠️'}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{r.restriction}</p>
                  {r.reason && <p className="text-xs text-gray-500 mt-0.5">{r.reason}</p>}
                  <Badge
                    label={r.severity}
                    color={r.severity === 'absolute' ? 'red' : r.severity === 'strict' ? 'yellow' : 'gray'}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Log exercise */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Log Exercise</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Type</label>
              <select className={inputClass} value={exerciseType} onChange={(e) => setExerciseType(e.target.value)}>
                {EXERCISE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Duration (minutes)</label>
              <input
                type="number"
                className={inputClass}
                placeholder="30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setIsPhysio(!isPhysio)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${isPhysio ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'}`}
              >
                {isPhysio && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className="text-sm text-gray-700">This is a physiotherapy session</span>
            </label>

            {success && (
              <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 text-green-700 text-sm text-center font-medium">
                ✓ Exercise logged
              </div>
            )}

            <Button variant="primary" fullWidth onClick={handleLog} loading={submitting}>
              Log Exercise
            </Button>
          </div>
        </Card>

        {/* Today's activity */}
        {exerciseLogs.length > 0 ? (
          <Card>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Today's Activity</h3>
            <div className="space-y-2">
              {exerciseLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{log.is_physiotherapy ? '🧘' : '🏃'}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{log.exercise_type}</p>
                      {log.duration_minutes && <p className="text-xs text-gray-400">{log.duration_minutes} min</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.is_physiotherapy && <Badge label="PT" color="indigo" size="sm" />}
                    <span className="text-xs text-gray-400">{formatTime(log.logged_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-3">🏃</p>
            <p className="font-medium text-sm">No exercise logged today</p>
            <p className="text-xs mt-1">Even a 10-minute walk counts!</p>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
