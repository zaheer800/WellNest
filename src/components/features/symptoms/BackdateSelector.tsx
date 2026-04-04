import React, { useState } from 'react'
import { today } from '@/utils/dateHelpers'
import { isBackdated, getOnsetDuration, validateOnsetDate } from '@/utils/symptomBackdating'

interface BackdateSelectorProps {
  value: string | null
  onChange: (date: string | null) => void
}

const BackdateSelector: React.FC<BackdateSelectorProps> = ({ value, onChange }) => {
  const todayStr = today()
  const [mode, setMode] = useState<'today' | 'earlier'>(
    value && isBackdated(value) ? 'earlier' : 'today'
  )

  const handleModeChange = (newMode: 'today' | 'earlier') => {
    setMode(newMode)
    if (newMode === 'today') {
      onChange(null)
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateVal = e.target.value || null
    onChange(dateVal)
  }

  const validationError = value ? validateOnsetDate(value) : null
  const duration = value && mode === 'earlier' && !validationError ? getOnsetDuration(value) : null

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">When did this actually start?</p>

      {/* Toggle buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleModeChange('today')}
          className={[
            'flex-1 py-2 px-3 rounded-xl text-sm font-medium border transition',
            mode === 'today'
              ? 'bg-indigo-500 text-white border-indigo-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300',
          ].join(' ')}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('earlier')}
          className={[
            'flex-1 py-2 px-3 rounded-xl text-sm font-medium border transition',
            mode === 'earlier'
              ? 'bg-indigo-500 text-white border-indigo-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300',
          ].join(' ')}
        >
          Earlier date
        </button>
      </div>

      {/* Date input */}
      {mode === 'earlier' && (
        <div className="space-y-1.5">
          <input
            type="date"
            max={todayStr}
            value={value ?? ''}
            onChange={handleDateChange}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {validationError && (
            <p className="text-xs text-red-500">{validationError}</p>
          )}
          {duration && (
            <p className="text-xs text-indigo-600 font-medium">{duration}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default BackdateSelector
