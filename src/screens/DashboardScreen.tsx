import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useHealthStore } from '@/store/healthStore'
import { useMedicationStore } from '@/store/medicationStore'
import { usePostureStore } from '@/store/postureStore'
import CircularProgress from '@/components/ui/CircularProgress'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import PageWrapper from '@/components/layout/PageWrapper'
import { today, getGreeting, formatDate } from '@/utils/dateHelpers'
import { formatMl, getScoreColor } from '@/utils/formatters'

export default function DashboardScreen() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { waterLogs, waterGoalMl, activityRestrictions, dailyScore, fetchTodayData } = useHealthStore()
  const { medications, fetchMedications } = useMedicationStore()
  const { postureLogs, activeSession, standBreakGoal, fetchTodayLogs } = usePostureStore()

  const date = today()
  const patientId = user?.id ?? ''

  useEffect(() => {
    if (!patientId) return
    const load = async () => {
      await Promise.all([
        fetchMedications(patientId, date),
        fetchTodayLogs(patientId, date),
      ])
      const meds = useMedicationStore.getState().medications
      const pLogs = usePostureStore.getState().postureLogs
      await fetchTodayData(patientId, date, meds, pLogs)
    }
    load()
  }, [patientId, date])

  const waterTotal = waterLogs.reduce((s, l) => s + l.amount_ml, 0)
  const takenCount = medications.filter((m) => m.log?.taken).length
  const totalMeds = medications.filter((m) => m.is_active).length
  const breaksTaken = postureLogs.reduce((s, l) => s + l.stand_breaks_taken, 0) + (activeSession?.stand_breaks_taken ?? 0)
  const score = dailyScore?.total ?? 0

  const scoreRingColor = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444'

  const quickActions = [
    { label: 'Add Water', icon: '💧', path: '/water', color: 'bg-blue-50 text-blue-600' },
    { label: 'Symptom', icon: '🩺', path: '/symptoms', color: 'bg-orange-50 text-orange-600' },
    { label: 'Medications', icon: '💊', path: '/medications', color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Posture', icon: '🪑', path: '/posture', color: 'bg-green-50 text-green-600' },
  ]

  return (
    <PageWrapper>
      <div className="px-4 pt-6 pb-4 space-y-5">
        {/* Greeting */}
        <div>
          <p className="text-gray-500 text-sm">{formatDate(date)}</p>
          <h1 className="text-xl font-bold text-gray-900">
            {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
          </h1>
        </div>

        {/* Health Score */}
        <Card className="flex flex-col items-center py-6 space-y-4">
          <CircularProgress
            value={score}
            size={140}
            strokeWidth={12}
            color={scoreRingColor}
            label={
              <div className="text-center">
                <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
                <p className="text-gray-400 text-xs">/ 100</p>
              </div>
            }
          />
          <p className="text-gray-500 text-sm font-medium">Today's Health Score</p>

          {/* Score breakdown */}
          <div className="grid grid-cols-5 gap-2 w-full text-center">
            {[
              { label: 'Meds', value: dailyScore?.medication ?? 0, max: 25 },
              { label: 'Water', value: dailyScore?.water ?? 0, max: 20 },
              { label: 'Move', value: dailyScore?.exercise ?? 0, max: 20 },
              { label: 'Diet', value: dailyScore?.diet ?? 0, max: 20 },
              { label: 'Posture', value: dailyScore?.posture ?? 0, max: 15 },
            ].map((item) => (
              <div key={item.label} className="space-y-0.5">
                <p className="text-xs font-semibold text-gray-700">{item.value}</p>
                <p className="text-xs text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card padding="sm" onClick={() => navigate('/water')}>
            <p className="text-2xl font-bold text-blue-600">{formatMl(waterTotal)}</p>
            <p className="text-xs text-gray-400 mt-0.5">of {formatMl(waterGoalMl)} goal</p>
            <p className="text-sm font-medium text-gray-600 mt-1">💧 Water</p>
          </Card>
          <Card padding="sm" onClick={() => navigate('/medications')}>
            <p className="text-2xl font-bold text-indigo-600">{takenCount}/{totalMeds}</p>
            <p className="text-xs text-gray-400 mt-0.5">medications taken</p>
            <p className="text-sm font-medium text-gray-600 mt-1">💊 Medications</p>
          </Card>
          <Card padding="sm" onClick={() => navigate('/posture')}>
            <p className="text-2xl font-bold text-green-600">{breaksTaken}/{standBreakGoal}</p>
            <p className="text-xs text-gray-400 mt-0.5">stand breaks</p>
            <p className="text-sm font-medium text-gray-600 mt-1">🪑 Posture</p>
          </Card>
          <Card padding="sm" onClick={() => navigate('/symptoms')}>
            <p className="text-2xl font-bold text-orange-500">Log</p>
            <p className="text-xs text-gray-400 mt-0.5">how you're feeling</p>
            <p className="text-sm font-medium text-gray-600 mt-1">🩺 Symptoms</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((a) => (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl ${a.color} transition active:scale-95`}
              >
                <span className="text-xl">{a.icon}</span>
                <span className="text-xs font-medium">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Restrictions */}
        {activityRestrictions.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Active Restrictions</h2>
            <div className="space-y-2">
              {activityRestrictions.map((r) => (
                <div key={r.id} className={`flex items-start gap-3 rounded-xl p-3 ${r.severity === 'absolute' ? 'bg-red-50 border border-red-100' : r.severity === 'strict' ? 'bg-orange-50 border border-orange-100' : 'bg-yellow-50 border border-yellow-100'}`}>
                  <span className="text-lg">{r.severity === 'absolute' ? '🚫' : r.severity === 'strict' ? '⚠️' : '📌'}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.restriction}</p>
                    {r.reason && <p className="text-xs text-gray-500 mt-0.5">{r.reason}</p>}
                    <Badge label={r.severity} color={r.severity === 'absolute' ? 'red' : r.severity === 'strict' ? 'yellow' : 'gray'} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Great day banner */}
        {score >= 80 && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">🌟</span>
            <div>
              <p className="font-semibold text-green-800 text-sm">Great day!</p>
              <p className="text-green-600 text-xs">You're hitting your health goals today. Keep it up!</p>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
