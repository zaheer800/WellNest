import React from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { InjectionCourseLog as InjectionCourseLogType } from '@/types/injection.types'

interface InjectionCourseLogProps {
  logs: InjectionCourseLogType[]
  totalDoses: number
}

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatTime = (dateStr: string): string => {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

const InjectionCourseLog: React.FC<InjectionCourseLogProps> = ({ logs, totalDoses }) => {
  const administered = logs.filter((l) => l.administered)
  const pending = logs.filter((l) => !l.administered)

  const renderRow = (log: InjectionCourseLogType) => (
    <div key={log.id} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div
        className={[
          'w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold',
          log.administered ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400',
        ].join(' ')}
      >
        {log.dose_number}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Dose {log.dose_number}</span>
          {log.administered ? (
            <Badge label="Administered" color="green" size="sm" />
          ) : (
            <Badge label="Pending" color="gray" size="sm" />
          )}
          {log.side_effects_noted && (
            <Badge label="Side effect noted" color="yellow" size="sm" />
          )}
        </div>

        <div className="flex flex-wrap gap-x-3 mt-0.5 text-xs text-gray-400">
          <span>{formatDate(log.scheduled_date)}</span>
          {log.administered_at && (
            <span>Given at {formatTime(log.administered_at)}</span>
          )}
          {log.administered_by && (
            <span>By {log.administered_by}</span>
          )}
          {log.site && (
            <span>Site: {log.site}</span>
          )}
        </div>

        {log.notes && (
          <p className="text-xs text-gray-400 mt-0.5 italic">{log.notes}</p>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {administered.length > 0 && (
        <Card padding="sm">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Administered ({administered.length}/{totalDoses})
          </h4>
          <div className="divide-y divide-gray-50">
            {administered.map(renderRow)}
          </div>
        </Card>
      )}

      {pending.length > 0 && (
        <Card padding="sm">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Upcoming ({pending.length} remaining)
          </h4>
          <div className="divide-y divide-gray-50">
            {pending.map(renderRow)}
          </div>
        </Card>
      )}

      {logs.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="font-medium text-sm">No dose logs yet</p>
          <p className="text-xs mt-1">Logs will appear here once doses are marked</p>
        </div>
      )}
    </div>
  )
}

export default InjectionCourseLog
