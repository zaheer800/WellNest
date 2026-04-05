import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { SymptomProgression as SymptomProgressionType } from '@/types/health.types'

interface LogEntry {
  logged_at: string
  severity: number
  onset_date?: string | null
}

interface SymptomProgressionProps {
  symptomName: string
  logs: LogEntry[]
  progression: Pick<
    SymptomProgressionType,
    'current_severity' | 'baseline_severity' | 'trend' | 'first_onset_date' | 'total_episodes'
  > | null
}

const trendConfig: Record<string, { label: string; className: string }> = {
  improving: { label: 'Improving', className: 'bg-green-100 text-green-700' },
  stable: { label: 'Stable', className: 'bg-yellow-100 text-yellow-700' },
  worsening: { label: 'Worsening', className: 'bg-red-100 text-red-700' },
  resolved: { label: 'Resolved', className: 'bg-blue-100 text-blue-700' },
  new: { label: 'New', className: 'bg-purple-100 text-purple-700' },
}

const SymptomProgression: React.FC<SymptomProgressionProps> = ({
  symptomName,
  logs,
  progression,
}) => {
  const chartData = logs
    .slice()
    .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime())
    .map((l) => ({
      date: new Date(l.logged_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      severity: l.severity,
    }))

  const trend = progression?.trend ?? null
  const badge = trend ? trendConfig[trend] : null

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-3xl mb-2">📈</p>
        <p className="text-sm">No history yet for {symptomName}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-800">{symptomName}</p>
        {badge && (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge.className}`}>
            {badge.label}
          </span>
        )}
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={20}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(v: number) => [`${v}/10`, 'Severity']}
              />
              {progression?.baseline_severity != null && (
                <ReferenceLine
                  y={progression.baseline_severity}
                  stroke="#c084fc"
                  strokeDasharray="4 3"
                  label={{ value: 'Baseline', position: 'right', fontSize: 10, fill: '#c084fc' }}
                />
              )}
              <Line
                type="monotone"
                dataKey="severity"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3, fill: '#6366f1' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Stats row */}
      {progression && (
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            {
              label: 'Started',
              value: progression.first_onset_date
                ? new Date(progression.first_onset_date).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
                : '—',
            },
            { label: 'Current', value: progression.current_severity != null ? `${progression.current_severity}/10` : '—' },
            { label: 'Baseline', value: progression.baseline_severity != null ? `${progression.baseline_severity}/10` : '—' },
            { label: 'Episodes', value: String(progression.total_episodes) },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-xl py-2 px-1">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SymptomProgression
