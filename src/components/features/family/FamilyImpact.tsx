import React from 'react'

interface FamilyImpactProps {
  engagedDayScore: number
  nonEngagedDayScore: number
  checkInsThisWeek: number
  totalDays: number
}

const FamilyImpact: React.FC<FamilyImpactProps> = ({
  engagedDayScore,
  nonEngagedDayScore,
  checkInsThisWeek,
  totalDays,
}) => {
  const diff = engagedDayScore - nonEngagedDayScore
  const hasPositiveImpact = diff > 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold text-gray-700">Your impact this week</p>
        <p className="text-xs text-gray-400 mt-0.5">
          You checked in {checkInsThisWeek} of {totalDays} days
        </p>
      </div>

      {/* Score comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-brand-teal-light rounded-2xl px-4 py-4 text-center">
          <p className="text-xs text-brand-teal font-medium">Days you checked in</p>
          <p className="text-2xl font-bold text-brand-teal mt-1">{engagedDayScore}</p>
          <p className="text-xs text-brand-teal">out of 100</p>
        </div>
        <div className="bg-gray-50 rounded-2xl px-4 py-4 text-center">
          <p className="text-xs text-gray-400 font-medium">Other days</p>
          <p className="text-2xl font-bold text-gray-500 mt-1">{nonEngagedDayScore}</p>
          <p className="text-xs text-gray-400">out of 100</p>
        </div>
      </div>

      {/* Difference callout */}
      {hasPositiveImpact ? (
        <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">💚</span>
          <div>
            <p className="text-sm font-semibold text-green-700">
              +{diff} points on days you check in
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              Your support is genuinely helping their recovery
            </p>
          </div>
        </div>
      ) : diff === 0 ? (
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3">
          <p className="text-sm text-yellow-700">Keep checking in — your presence matters even when scores are similar</p>
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
          <p className="text-sm text-orange-700">Try reaching out more — your check-ins can make a real difference</p>
        </div>
      )}

      {/* Check-in progress bar */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-400">Weekly check-ins</span>
          <span className="text-xs font-medium text-gray-600">{checkInsThisWeek}/{totalDays}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-teal rounded-full transition-all"
            style={{ width: `${totalDays > 0 ? (checkInsThisWeek / totalDays) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default FamilyImpact
