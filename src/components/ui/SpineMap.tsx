import React from 'react'

type SpineSeverity = 'normal' | 'mild' | 'mild_nerve' | 'moderate' | 'significant' | 'critical'
type SpineRegion = 'cervical' | 'thoracic' | 'lumbar' | 'sacral'

export interface SpineLevelData {
  level: string
  region: SpineRegion
  severity: SpineSeverity
  findings: string[]
  nerves_affected: string[]
}

interface SpineMapProps {
  levels: SpineLevelData[]
  onLevelClick?: (level: SpineLevelData) => void
  className?: string
}

const SEVERITY_DOT: Record<SpineSeverity, string> = {
  normal: 'bg-gray-300',
  mild: 'bg-green-400',
  mild_nerve: 'bg-yellow-400',
  moderate: 'bg-orange-400',
  significant: 'bg-red-400',
  critical: 'bg-red-700',
}

const SEVERITY_LABEL: Record<SpineSeverity, string> = {
  normal: 'Normal',
  mild: 'Mild',
  mild_nerve: 'Mild (nerve)',
  moderate: 'Moderate',
  significant: 'Significant',
  critical: 'Critical',
}

const SEVERITY_TEXT: Record<SpineSeverity, string> = {
  normal: 'text-gray-500',
  mild: 'text-green-600',
  mild_nerve: 'text-yellow-600',
  moderate: 'text-orange-600',
  significant: 'text-red-500',
  critical: 'text-red-700',
}

const REGION_LEVELS: Record<SpineRegion, string[]> = {
  cervical: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'],
  thoracic: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12'],
  lumbar: ['L1', 'L2', 'L3', 'L4', 'L5'],
  sacral: ['S1', 'S2'],
}

const REGION_LABELS: Record<SpineRegion, string> = {
  cervical: 'Cervical',
  thoracic: 'Thoracic',
  lumbar: 'Lumbar',
  sacral: 'Sacral',
}

const LEGEND_ITEMS: { severity: SpineSeverity; label: string }[] = [
  { severity: 'normal', label: 'Normal' },
  { severity: 'mild', label: 'Mild' },
  { severity: 'mild_nerve', label: 'Mild (nerve)' },
  { severity: 'moderate', label: 'Moderate' },
  { severity: 'significant', label: 'Significant' },
  { severity: 'critical', label: 'Critical' },
]

const SpineMap: React.FC<SpineMapProps> = ({ levels, onLevelClick, className = '' }) => {
  const levelMap: Record<string, SpineLevelData> = {}
  levels.forEach((l) => { levelMap[l.level] = l })

  const regions: SpineRegion[] = ['cervical', 'thoracic', 'lumbar', 'sacral']

  return (
    <div className={`space-y-4 ${className}`}>
      {regions.map((region) => (
        <div key={region}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-1">
            {REGION_LABELS[region]}
          </p>
          <div className="space-y-1">
            {REGION_LEVELS[region].map((lvl) => {
              const data = levelMap[lvl]
              const severity: SpineSeverity = data?.severity ?? 'normal'
              const findings = data?.findings ?? []
              const isClickable = !!onLevelClick && !!data

              return (
                <div
                  key={lvl}
                  onClick={isClickable ? () => onLevelClick(data) : undefined}
                  role={isClickable ? 'button' : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onKeyDown={
                    isClickable
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onLevelClick(data)
                          }
                        }
                      : undefined
                  }
                  className={[
                    'flex items-center gap-3 px-3 py-2 rounded-xl bg-white border border-gray-100',
                    isClickable
                      ? 'cursor-pointer hover:shadow-sm hover:border-indigo-200 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal'
                      : '',
                  ].join(' ')}
                >
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${SEVERITY_DOT[severity]}`} />
                  <span className="text-sm font-semibold text-gray-700 w-8 flex-shrink-0">{lvl}</span>
                  <span className={`text-xs font-medium flex-shrink-0 ${SEVERITY_TEXT[severity]}`}>
                    {SEVERITY_LABEL[severity]}
                  </span>
                  {findings.length > 0 && (
                    <span className="text-xs text-gray-400 truncate flex-1">
                      {findings[0]}
                      {findings.length > 1 && ` +${findings.length - 1} more`}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="bg-gray-50 rounded-xl p-3">
        <p className="text-xs font-semibold text-gray-500 mb-2">Legend</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {LEGEND_ITEMS.map(({ severity, label }) => (
            <div key={severity} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${SEVERITY_DOT[severity]}`} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SpineMap
