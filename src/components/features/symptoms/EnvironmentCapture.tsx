import React from 'react'

interface EnvironmentValue {
  temperature?: string
  location?: string
  activity?: string
}

interface EnvironmentCaptureProps {
  value: EnvironmentValue
  onChange: (env: EnvironmentValue) => void
}

interface OptionGroup {
  key: keyof EnvironmentValue
  label: string
  options: string[]
}

const GROUPS: OptionGroup[] = [
  {
    key: 'temperature',
    label: 'Temperature',
    options: ['Cold AC', 'Room Temp', 'Hot'],
  },
  {
    key: 'location',
    label: 'Location',
    options: ['Home', 'Office', 'Outdoor', 'Travel'],
  },
  {
    key: 'activity',
    label: 'Activity',
    options: ['Sitting', 'Walking', 'Post-meal', 'Resting'],
  },
]

const EnvironmentCapture: React.FC<EnvironmentCaptureProps> = ({ value, onChange }) => {
  const handleToggle = (key: keyof EnvironmentValue, option: string) => {
    const current = value[key]
    onChange({
      ...value,
      [key]: current === option ? undefined : option,
    })
  }

  return (
    <div className="space-y-3">
      {GROUPS.map((group) => (
        <div key={group.key}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            {group.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => {
              const isSelected = value[group.key] === option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleToggle(group.key, option)}
                  className={[
                    'px-3 py-1.5 rounded-xl text-sm font-medium border transition',
                    isSelected
                      ? 'bg-indigo-500 text-white border-indigo-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300',
                  ].join(' ')}
                  aria-pressed={isSelected}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default EnvironmentCapture
