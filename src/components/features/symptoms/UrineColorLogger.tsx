import React from 'react'
import ColorPicker from '@/components/ui/ColorPicker'
import { URINE_COLORS } from '@/constants/urineColors'
import { getUrineGuidance, requiresUrgentAttention, getUrineColorInfo } from '@/utils/urineColorGuidance'

interface UrineColorLoggerProps {
  value: string | null
  onChange: (colorId: string) => void
  conditions?: string[]
}

const actionBadge: Record<string, { label: string; className: string }> = {
  normal: { label: 'Normal', className: 'bg-green-100 text-green-700' },
  monitor: { label: 'Monitor', className: 'bg-yellow-100 text-yellow-700' },
  contact_doctor: { label: 'Contact doctor', className: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700' },
}

const UrineColorLogger: React.FC<UrineColorLoggerProps> = ({
  value,
  onChange,
  conditions = [],
}) => {
  const colorInfo = value ? getUrineColorInfo(value) : null
  const guidance = value ? getUrineGuidance(value, conditions) : null
  const isUrgent = value ? requiresUrgentAttention(value) : false
  const badge = colorInfo ? actionBadge[colorInfo.action] : null

  const pickerColors = URINE_COLORS.map((c) => ({ id: c.id, label: c.label, hex: c.hex }))

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">Urine colour</p>

      <ColorPicker
        colors={pickerColors as { id: string; label: string; hex: string }[]}
        value={value}
        onChange={onChange}
      />

      {colorInfo && (
        <div className="space-y-2">
          {/* Meaning + badge */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-gray-600">{colorInfo.meaning}</p>
            {badge && (
              <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
                {badge.label}
              </span>
            )}
          </div>

          {/* Urgent banner */}
          {isUrgent && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-start gap-2">
              <span className="text-red-500 text-base leading-none mt-0.5">⚠️</span>
              <p className="text-sm text-red-700 font-medium">
                This colour requires urgent medical attention. Seek care today.
              </p>
            </div>
          )}

          {/* Guidance */}
          {guidance && (
            <p className="text-xs text-gray-500 leading-relaxed">{guidance}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default UrineColorLogger
