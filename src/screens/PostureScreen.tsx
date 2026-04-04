import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { usePostureStore } from '@/store/postureStore'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import { today } from '@/utils/dateHelpers'

const POSTURE_TIPS = [
  'Keep your lumbar spine supported — use a cushion or lumbar roll.',
  'Screen should be at eye level — your neck should not tilt down.',
  'Feet flat on the floor, knees at 90° — no crossing legs.',
]

const CHECKLIST_ITEMS = [
  { key: 'lumbar', label: 'Lumbar support in use' },
  { key: 'screen', label: 'Screen at eye level' },
  { key: 'feet', label: 'Feet flat on floor' },
]

export default function PostureScreen() {
  const { user } = useAuthStore()
  const { isTracking, activeSession, lastStandBreak, standBreakGoal, postureLogs, startSitting, recordStandBreak, endSession, fetchTodayLogs, getSittingDurationMinutes } = usePostureStore()

  const [sittingMins, setSittingMins] = useState(0)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({ lumbar: false, screen: false, feet: false })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const patientId = user?.id ?? ''
  const date = today()

  useEffect(() => {
    if (patientId) fetchTodayLogs(patientId, date)
  }, [patientId, date])

  // Live sitting timer
  useEffect(() => {
    if (!isTracking) return
    const interval = setInterval(() => setSittingMins(getSittingDurationMinutes()), 30000)
    setSittingMins(getSittingDurationMinutes())
    return () => clearInterval(interval)
  }, [isTracking])

  const breaksTaken = postureLogs.reduce((s, l) => s + l.stand_breaks_taken, 0) + (activeSession?.stand_breaks_taken ?? 0)
  const compliancePct = Math.min(100, Math.round((breaksTaken / standBreakGoal) * 100))

  const lastBreakMins = lastStandBreak ? Math.floor((Date.now() - lastStandBreak.getTime()) / 60000) : null

  const toggleCheck = (key: string) => setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleStartSitting = async () => {
    if (!patientId) {
      setError('User not authenticated')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await startSitting(patientId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start posture tracking')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStandBreak = async () => {
    if (!patientId) {
      setError('User not authenticated')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      if (!isTracking) {
        await startSitting(patientId)
      }
      await recordStandBreak(patientId)
      setSittingMins(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record stand break')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageWrapper title="Posture Tracker">
      <div className="px-4 pt-4 space-y-5">
        {/* Error alert */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Main timer card */}
        <Card className="text-center py-6 space-y-4">
          <div className="text-5xl">{isTracking ? '🪑' : '🧘'}</div>

          {isTracking ? (
            <>
              <div>
                <p className="text-3xl font-bold text-gray-800">{sittingMins} min</p>
                <p className="text-gray-500 text-sm mt-1">Sitting duration</p>
              </div>
              {sittingMins >= 45 && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-2 text-orange-600 text-sm font-medium">
                  ⚠️ Time to stand up!
                </div>
              )}
            </>
          ) : (
            <div>
              <p className="text-lg font-semibold text-gray-600">Not tracking</p>
              <p className="text-gray-400 text-sm">Tap Start Sitting to begin</p>
            </div>
          )}

          {lastBreakMins !== null && (
            <p className="text-sm text-gray-400">Last stand break: <span className="font-medium text-gray-600">{lastBreakMins} min ago</span></p>
          )}

          <div className="flex gap-3">
            {!isTracking ? (
              <Button variant="primary" fullWidth onClick={handleStartSitting} loading={isLoading}>
                Start Sitting
              </Button>
            ) : (
              <Button variant="danger" fullWidth onClick={() => patientId && endSession(patientId)}>
                End Session
              </Button>
            )}
          </div>
        </Card>

        {/* Stand break button */}
        <button
          onClick={handleStandBreak}
          disabled={isLoading}
          className={`w-full text-white rounded-2xl py-5 font-bold text-lg shadow-sm transition flex items-center justify-center gap-3 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 active:scale-95'
          }`}
        >
          <span className="text-2xl">{isLoading ? '⏳' : '🚶'}</span>
          {isLoading ? 'Recording break...' : 'I Just Stood Up!'}
        </button>

        {/* Breaks progress */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Stand Breaks Today</h3>
            <span className="text-sm font-bold text-green-600">{breaksTaken} / {standBreakGoal}</span>
          </div>
          <ProgressBar value={compliancePct} color="green" height="md" />
          <p className="text-xs text-gray-400 mt-2">{compliancePct}% of daily goal</p>
        </Card>

        {/* Posture checklist */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Posture Checklist</h3>
          <div className="space-y-3">
            {CHECKLIST_ITEMS.map((item) => (
              <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => toggleCheck(item.key)}
                  className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition ${checklist[item.key] ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'}`}
                >
                  {checklist[item.key] && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${checklist[item.key] ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.label}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Tips */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Posture Tips</h3>
          <div className="space-y-3">
            {POSTURE_TIPS.map((tip, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-indigo-400 font-bold text-sm flex-shrink-0">{i + 1}.</span>
                <p className="text-sm text-gray-600">{tip}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
