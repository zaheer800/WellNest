import React from 'react'
import type { LabParameter } from '@/types/report.types'
import Badge from '@/components/ui/Badge'

interface LabParameterViewProps {
  parameter: LabParameter
}

const LabParameterView: React.FC<LabParameterViewProps> = ({ parameter }) => {
  const status = parameter.status || 'normal'
  const statusColor = status === 'abnormal_high' || status === 'abnormal_low' ? 'yellow' :
                      status === 'borderline_high' || status === 'borderline_low' ? 'blue' :
                      status === 'critical' ? 'red' : 'green'
  const statusLabel = status.replace(/_/g, ' ').toUpperCase()

  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-medium text-gray-800 text-sm">{parameter.parameter_name}</p>
          {parameter.parameter_category && (
            <p className="text-xs text-gray-500 mt-0.5">{parameter.parameter_category}</p>
          )}
        </div>
        <Badge label={statusLabel} color={statusColor as any} size="sm" />
      </div>
      
      <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Value:</span>
          <span className="font-semibold text-gray-800">{parameter.value} {parameter.unit}</span>
        </div>
        {parameter.reference_min || parameter.reference_max ? (
          <div className="flex justify-between">
            <span className="text-gray-600">Reference:</span>
            <span className="text-gray-700">
              {parameter.reference_min && parameter.reference_max 
                ? `${parameter.reference_min}–${parameter.reference_max}`
                : parameter.reference_min || parameter.reference_max}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default LabParameterView
