import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useHealthStore } from '@/store/healthStore'
import PageWrapper from '@/components/layout/PageWrapper'
import Card from '@/components/ui/Card'
import CircularProgress from '@/components/ui/CircularProgress'
import Button from '@/components/ui/Button'
import { Droplet, PartyPopper } from 'lucide-react'
import { today, formatTime } from '@/utils/dateHelpers'
import { formatMl } from '@/utils/formatters'

const QUICK_AMOUNTS = [150, 250, 500, 750]

export default function WaterScreen() {
  const { user } = useAuthStore()
  const { waterLogs, waterGoalMl, addWater, removeWater, editWater, setWaterGoal, fetchTodayData } = useHealthStore()
  const [customMl, setCustomMl] = useState('')
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState(String(waterGoalMl))

  // Custom backfill time for adding entries (defaults to current time)
  const nowTime = () => {
    const n = new Date()
    return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`
  }
  const [customTime, setCustomTime] = useState(nowTime)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const isBackfilling = customTime !== nowTime()

  const resetToNow = () => {
    setCustomTime(nowTime())
    setShowTimePicker(false)
  }

  // Inline edit state: { id, value (ml), time (HH:MM) } | null
  const [editingLog, setEditingLog] = useState<{ id: string; value: string; time: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const patientId = user?.id ?? ''
  const date = today()

  useEffect(() => {
    if (patientId) fetchTodayData(patientId, date)
  }, [patientId, date])

  const totalMl = waterLogs.reduce((s, l) => s + l.amount_ml, 0)
  const pct = Math.min(100, Math.round((totalMl / waterGoalMl) * 100))

  const ringColor = pct >= 100 ? '#22c55e' : pct >= 60 ? '#6366f1' : '#93c5fd'

  // Convert HH:MM (local) to ISO string for today's date
  const buildLoggedAt = (hhmm: string): string => {
    const [hh, mm] = hhmm.split(':').map(Number)
    const ts = new Date()
    ts.setHours(hh, mm, 0, 0)
    return ts.toISOString()
  }

  const handleAdd = async (ml: number) => {
    if (!patientId || ml <= 0) return
    await addWater(patientId, ml, 'water', buildLoggedAt(customTime))
    resetToNow()
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

  const startEdit = (id: string, currentMl: number, loggedAt: string) => {
    // Extract local HH:MM from the ISO timestamp for the time input
    const d = new Date(loggedAt)
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    setEditingLog({ id, value: String(currentMl), time: `${hh}:${mm}` })
  }

  const cancelEdit = () => setEditingLog(null)

  const confirmEdit = async () => {
    if (!editingLog) return
    const ml = parseInt(editingLog.value)
    if (isNaN(ml) || ml <= 0) return
    // Rebuild ISO timestamp: keep today's date, replace time with user-chosen HH:MM
    const [hh, mm] = editingLog.time.split(':').map(Number)
    const ts = new Date()
    ts.setHours(hh, mm, 0, 0)
    setSaving(true)
    try {
      await editWater(editingLog.id, ml, ts.toISOString())
    } finally {
      setSaving(false)
      setEditingLog(null)
    }
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
                <button onClick={handleGoalSave} className="text-sm text-brand-teal font-medium">Save</button>
              </>
            ) : (
              <button onClick={() => setEditingGoal(true)} className="text-sm text-gray-500 hover:text-gray-700">
                Daily goal: <span className="font-semibold text-gray-700">{formatMl(waterGoalMl)}</span> · edit
              </button>
            )}
          </div>

          {pct >= 100 && (
            <div className="bg-green-50 rounded-xl px-4 py-2 text-green-700 text-sm font-medium flex items-center justify-center gap-2">
              <PartyPopper className="w-4 h-4" /> Goal reached!
            </div>
          )}
        </Card>

        {/* Quick add */}
        <Card>
          {/* Single header row: label · chip · [time input · Done · ×] */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-700 mr-1">Quick Add</h3>

            {/* Time chip */}
            <button
              onClick={() => setShowTimePicker((v) => !v)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                isBackfilling
                  ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
              ].join(' ')}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
              </svg>
              {isBackfilling ? customTime : 'Now'}
            </button>

            {/* Inline time picker — appears to the right of the chip */}
            {showTimePicker && (
              <>
                <input
                  type="time"
                  autoFocus
                  className="border border-blue-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                />
                <button
                  onClick={() => setShowTimePicker(false)}
                  className="text-xs font-medium text-brand-teal hover:text-brand-navy transition"
                >
                  Done
                </button>
              </>
            )}

            {/* × reset — only when backfilling */}
            {isBackfilling && (
              <button
                onClick={resetToNow}
                className="text-gray-400 hover:text-red-400 transition p-0.5"
                title="Reset to current time"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {QUICK_AMOUNTS.map((ml) => (
              <button
                key={ml}
                onClick={() => handleAdd(ml)}
                className="flex flex-col items-center py-3 rounded-xl bg-blue-50 text-blue-600 active:scale-95 transition"
              >
                <Droplet className="w-6 h-6 mb-1" />
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
              {[...waterLogs].reverse().map((log) => {
                const isEditing = editingLog?.id === log.id

                return (
                  <div key={log.id} className="py-1.5 border-b border-gray-50 last:border-0">
                    {isEditing ? (
                      /* ── Inline edit row ── */
                      <div className="flex flex-wrap items-center gap-2 py-0.5">
                        <Droplet className="w-4 h-4 text-blue-400" />

                        {/* Amount */}
                        <input
                          type="number"
                          autoFocus
                          className="w-20 border border-blue-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                          value={editingLog!.value}
                          onChange={(e) => setEditingLog({ ...editingLog!, value: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') confirmEdit()
                            if (e.key === 'Escape') cancelEdit()
                          }}
                        />
                        <span className="text-xs text-gray-400">ml</span>

                        {/* Time */}
                        <input
                          type="time"
                          className="border border-blue-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          value={editingLog!.time}
                          onChange={(e) => setEditingLog({ ...editingLog!, time: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') confirmEdit()
                            if (e.key === 'Escape') cancelEdit()
                          }}
                        />

                        <button
                          onClick={confirmEdit}
                          disabled={saving}
                          className="text-xs font-semibold text-brand-teal hover:text-brand-navy disabled:opacity-50 transition"
                        >
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-xs text-gray-400 hover:text-gray-600 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      /* ── Normal row ── */
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Droplet className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium text-gray-700">{formatMl(log.amount_ml)}</span>
                          {log.fluid_type !== 'water' && (
                            <span className="text-xs text-gray-400">{log.fluid_type}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">{formatTime(log.logged_at)}</span>

                          {/* Edit button */}
                          <button
                            onClick={() => startEdit(log.id, log.amount_ml, log.logged_at)}
                            className="text-gray-300 hover:text-blue-400 transition"
                            title="Edit entry"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H7v-3a2 2 0 01.586-1.414z" />
                            </svg>
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => removeWater(log.id)}
                            className="text-gray-300 hover:text-red-400 transition"
                            title="Delete entry"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-right font-medium">Total: {formatMl(totalMl)}</p>
          </Card>
        )}

        {waterLogs.length === 0 && (
          <div className="text-center py-8 text-gray-400 flex flex-col items-center">
            <Droplet className="w-10 h-10 mb-3 text-gray-300" />
            <p className="text-sm">No water logged yet today</p>
            <p className="text-xs mt-1">Tap a quick-add button above to get started</p>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}

