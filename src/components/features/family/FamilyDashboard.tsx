import React from 'react'
import CircularProgress from '@/components/ui/CircularProgress'

interface FamilyDashboardProps {
  patientName: string
  todayScore: number
  waterPct: number
  medicationPct: number
  posturePct: number
}

function getEncouragement(score: number): string {
  if (score >= 85) return 'is doing great today! 🌟'
  if (score >= 65) return 'is making good progress 💪'
  if (score >= 45) return 'could use some encouragement today'
  return 'needs your support today ❤️'
}

const FamilyDashboard: React.FC<FamilyDashboardProps> = ({
  patientName,
  todayScore,
  waterPct,
  medicationPct,
  posturePct,
}) => {
  const firstName = patientName.split(' ')[0]

  return (
    <div className="space-y-5">
      {/* Score + message */}
      <div className="flex items-center gap-5">
        <CircularProgress value={todayScore} max={100} size={80} strokeWidth={7} />
        <div className="flex-1">
          <p className="text-base font-semibold text-gray-800">{firstName} {getEncouragement(todayScore)}</p>
          <p className="text-sm text-gray-400 mt-0.5">Today's health score: {todayScore}/100</p>
        </div>
      </div>

      {/* Detail bars */}
      <div className="space-y-3">
        {[
          { label: 'Medications', value: medicationPct, color: 'bg-indigo-400' },
          { label: 'Water intake', value: waterPct, color: 'bg-cyan-400' },
          { label: 'Posture', value: posturePct, color: 'bg-emerald-400' },
        ].map((item) => (
          <div key={item.label}>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-500">{item.label}</span>
              <span className="text-xs font-medium text-gray-700">{item.value}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} rounded-full transition-all duration-500`}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Encouragement nudge */}
      <div className="bg-pink-50 border border-pink-100 rounded-xl px-4 py-3">
        <p className="text-sm text-pink-700">
          Send a message to {firstName} — family support makes a measurable difference 💕
        </p>
      </div>
    </div>
  )
}

export default FamilyDashboard
