import React from 'react'
import Badge from '@/components/ui/Badge'

interface ImagingFinding {
  id: string
  finding: string
  severity?: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical'
  location?: string
  anatomical_region?: string
}

interface ImagingFindingViewProps {
  finding: ImagingFinding
}

const ImagingFindingView: React.FC<ImagingFindingViewProps> = ({ finding }) => {
  const severityColor = 
    finding.severity === 'critical' ? 'red' :
    finding.severity === 'severe' ? 'red' :
    finding.severity === 'moderate' ? 'yellow' :
    finding.severity === 'mild' ? 'blue' : 'green'

  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-medium text-gray-800 text-sm">{finding.finding}</p>
          {finding.location && (
            <p className="text-xs text-gray-500 mt-1">Location: {finding.location}</p>
          )}
          {finding.anatomical_region && (
            <p className="text-xs text-gray-500">{finding.anatomical_region}</p>
          )}
        </div>
        {finding.severity && (
          <Badge label={finding.severity} color={severityColor as any} size="sm" />
        )}
      </div>
    </div>
  )
}

export default ImagingFindingView
