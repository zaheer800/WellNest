import React from 'react'
import type { ImagingFinding } from '@/types/imaging.types'
import Badge from '@/components/ui/Badge'

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
          <p className="font-medium text-gray-800 text-sm">
            {finding.finding_type?.replace(/_/g, ' ') ?? 'Finding'}
          </p>
          {finding.location && (
            <p className="text-xs text-gray-500 mt-1">Location: {finding.location}</p>
          )}
          {finding.plain_language && (
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{finding.plain_language}</p>
          )}
        </div>
        {finding.severity && (
          <Badge label={finding.severity} color={severityColor} size="sm" />
        )}
      </div>
    </div>
  )
}

export default ImagingFindingView
