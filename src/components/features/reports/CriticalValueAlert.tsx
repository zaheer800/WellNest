import React from 'react'

interface CriticalParameter {
  name: string
  status: 'critical_low' | 'critical_high'
  value: number
  unit: string
  action: string
}

interface CriticalValueAlertProps {
  parameter: CriticalParameter
  onAcknowledge: () => void
  acknowledged: boolean
}

const CriticalValueAlert: React.FC<CriticalValueAlertProps> = ({
  parameter,
  onAcknowledge,
  acknowledged,
}) => {
  const direction = parameter.status === 'critical_high' ? 'critically high' : 'critically low'

  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${acknowledged ? 'border-green-200' : 'border-red-400'}`}>
      {/* Header banner */}
      <div className={`px-4 py-2 flex items-center gap-2 ${acknowledged ? 'bg-green-500' : 'bg-red-500'}`}>
        <span className="text-white text-sm">{acknowledged ? '✓' : '🔴'}</span>
        <span className="text-white text-sm font-bold uppercase tracking-wide">
          {acknowledged ? 'Acknowledged' : 'Critical Value'}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-4 space-y-3 bg-white">
        <div className="space-y-1">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Parameter</p>
          <p className="text-lg font-bold text-gray-800">{parameter.name}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${acknowledged ? 'text-green-600' : 'text-red-600'}`}>
            {parameter.value} {parameter.unit}
          </span>
          <span className={`text-sm font-medium ${acknowledged ? 'text-green-500' : 'text-red-500'}`}>
            {direction}
          </span>
        </div>

        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
          <p className="text-xs text-gray-400 font-medium mb-0.5">Required action</p>
          <p className="text-sm text-gray-700">{parameter.action}</p>
        </div>

        {!acknowledged ? (
          <button
            type="button"
            onClick={onAcknowledge}
            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition"
          >
            I Acknowledge — I will take action
          </button>
        ) : (
          <div className="flex items-center gap-2 text-green-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">You have acknowledged this critical value</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default CriticalValueAlert
