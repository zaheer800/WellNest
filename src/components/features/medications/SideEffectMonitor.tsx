import React from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import type { MedicationSideEffectLog } from '@/types/injection.types'

interface SideEffectMonitorProps {
  sideEffects: MedicationSideEffectLog[]
  onAdd: () => void
  onResolve: (id: string) => void
}

type BadgeColor = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'indigo'

const SEVERITY_COLOR: Record<MedicationSideEffectLog['severity'], BadgeColor> = {
  mild: 'green',
  moderate: 'yellow',
  severe: 'red',
  critical: 'red',
}

const SEVERITY_LABEL: Record<MedicationSideEffectLog['severity'], string> = {
  mild: 'Mild',
  moderate: 'Moderate',
  severe: 'Severe',
  critical: 'Critical',
}

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const SideEffectMonitor: React.FC<SideEffectMonitorProps> = ({ sideEffects, onAdd, onResolve }) => {
  const active = sideEffects.filter((s) => !s.resolved)
  const resolved = sideEffects.filter((s) => s.resolved)

  const renderEntry = (se: MedicationSideEffectLog) => (
    <div
      key={se.id}
      className={['p-3 rounded-xl border', se.resolved ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-gray-100'].join(' ')}
    >
      <div className="flex items-start gap-2 flex-wrap mb-1">
        <span className={`text-sm font-medium ${se.resolved ? 'text-gray-400' : 'text-gray-800'}`}>
          {se.side_effect}
        </span>
        <Badge label={SEVERITY_LABEL[se.severity]} color={se.resolved ? 'gray' : SEVERITY_COLOR[se.severity]} size="sm" />
        <Badge
          label={se.source === 'experienced' ? 'Experienced' : 'Read about'}
          color={se.source === 'experienced' ? 'indigo' : 'blue'}
          size="sm"
        />
        {se.resolved && <Badge label="Resolved" color="gray" size="sm" />}
      </div>

      {se.guidance && (
        <p className="text-xs text-gray-500 mt-1">{se.guidance}</p>
      )}
      {se.action_taken && (
        <p className="text-xs text-gray-400 mt-0.5 italic">Action: {se.action_taken}</p>
      )}

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-300">{formatDate(se.logged_at)}</span>
        {!se.resolved && (
          <button
            onClick={() => onResolve(se.id)}
            className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition"
          >
            Mark resolved
          </button>
        )}
        {se.resolved && se.resolved_at && (
          <span className="text-xs text-gray-400">Resolved {formatDate(se.resolved_at)}</span>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={onAdd}>
          + Add Side Effect
        </Button>
      </div>

      {active.length === 0 && resolved.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="font-medium text-sm">No side effects logged</p>
          <p className="text-xs mt-1">Tap the button above to log one</p>
        </div>
      )}

      {active.length > 0 && (
        <Card padding="sm">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Active ({active.length})
          </h4>
          <div className="space-y-2">{active.map(renderEntry)}</div>
        </Card>
      )}

      {resolved.length > 0 && (
        <Card padding="sm">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Resolved ({resolved.length})
          </h4>
          <div className="space-y-2">{resolved.map(renderEntry)}</div>
        </Card>
      )}
    </div>
  )
}

export default SideEffectMonitor
