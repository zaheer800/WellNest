import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useHealthStore } from '@/store/healthStore'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import CircularProgress from '@/components/ui/CircularProgress'
import Button from '@/components/ui/Button'
import { today, formatTime } from '@/utils/dateHelpers'
import { formatMl } from '@/utils/formatters'

const QUICK_AMOUNTS = [150, 250, 500, 750]

export default function WaterScreen() {
  const { user } = useAuthStore()
  const { waterLogs, waterGoalMl, addWater, removeWater, setWaterGoal, fetchTodayData } = useHealthStore()
  const [customMl, setCustomMl] = useState('')
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState(String(waterGoalMl))

  const patientId = user?.id ?? ''
  const date = today()

  useEffect(() => {
    if (patientId) fetchTodayData(patientId, date)
  }, [patientId, date])

  const totalMl = waterLogs.reduce((s, l) => s + l.amount_ml, 0)
  const pct = Math.min(100, Math.round((totalMl / waterGoalMl) * 100))

  const ringColor = pct >= 100 ? '#22c55e' : pct >= 60 ? '#6366f1' : '#93c5fd'

  const handleAdd = async (ml: number) => {
    if (!patientId || ml <= 0) return
    await addWater(patientId, ml)
  }

  const handleCustomAdd = async () => {
    const ml = parseInt(customMl)
    if (!isNaN(ml) && ml > 0) {
      await handleAdd(ml)
      setCustomMl('')
    }
  }

  const handleGoalSave = () => {
    const ml = parseInt(goalInput)
    if (!isNaN(ml) && ml > 0) setWaterGoal(ml)
    setEditingGoal(false)
  }

  return (
    <PageWrapper title="Water Intake">
      <div className="px-4 pt-4 space-y-5">
        {/* Circular progress */}
        <Card className="flex flex-col items-center py-6 space-y-3">
          <CircularProgress
            value={pct}
            size={160}
            strokeWidth={14}
            color={ringColor}
            label={
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{formatMl(totalMl)}</p>
                <p className="text-xs text-gray-400">of goal</p>
              </div>
            }
          />

          {/* Goal */}
          <div className="flex items-center gap-2">
            {editingGoal ? (
              <>
                <input
                  type="number"
                  className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  autoFocus
                />
                <span className="text-sm text-gray-500">ml</span>
                <button onClick={handleGoalSave} className="text-sm text-indigo-600 font-medium">Save</button>
              </>
            ) : (
              <button onClick={() => setEditingGoal(true)} className="text-sm text-gray-500 hover:text-gray-700">
                Daily goal: <span className="font-semibold text-gray-700">{formatMl(waterGoalMl)}</span> · edit
              </button>
            )}
          </div>

          {pct >= 100 && (
            <div className="bg-green-50 rounded-xl px-4 py-2 text-green-700 text-sm font-medium">
              🎉 Goal reached!
            </div>
          )}
        </Card>

        {/* Quick add */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Add</h3>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {QUICK_AMOUNTS.map((ml) => (
              <button
                key={ml}
                onClick={() => handleAdd(ml)}
                className="flex flex-col items-center py-3 rounded-xl bg-blue-50 text-blue-600 active:scale-95 transition"
              >
                <span className="text-lg">💧</span>
                <span className="text-xs font-semibold mt-1">{formatMl(ml)}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Custom ml"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={customMl}
              onChange={(e) => setCustomMl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomAdd()}
            />
            <Button variant="secondary" onClick={handleCustomAdd}>Add</Button>
          </div>
        </Card>

        {/* Log */}
        {waterLogs.length > 0 && (
          <Card>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Today's Log</h3>
            <div className="space-y-2">
              {[...waterLogs].reverse().map((log) => (
                <div key={log.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">💧</span>
                    <span className="text-sm font-medium text-gray-700">{formatMl(log.amount_ml)}</span>
                    <span className="text-xs text-gray-400">{log.fluid_type !== 'water' ? log.fluid_type : ''}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{formatTime(log.logged_at)}</span>
                    <button
                      onClick={() => removeWater(log.id)}
                      className="text-gray-300 hover:text-red-400 transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-right font-medium">Total: {formatMl(totalMl)}</p>
          </Card>
        )}

        {waterLogs.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-4xl mb-3">💧</p>
            <p className="text-sm">No water logged yet today</p>
            <p className="text-xs mt-1">Tap a quick-add button above to get started</p>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
