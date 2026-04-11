import React, { useEffect, useState } from 'react'
import SpineMap from '@/components/ui/SpineMap'
import type { SpineSeverityColor, SpineLevel } from '@/utils/spineMapRenderer'
import { getAllSpineLevels, normaliseSpineLevel } from '@/utils/spineMapRenderer'
import { supabase } from '@/services/supabase'

interface ImagingFinding {
  id: string
  spinal_level: string | null
  spinal_region: string | null
  finding_type: string | null
  severity: string | null
  description: string | null
  plain_language: string | null
  nerves_affected: string[] | null
  report_date: string | null
}

const severityMap: Record<string, SpineSeverityColor> = {
  normal: 'normal',
  mild: 'mild',
  moderate: 'moderate',
  severe: 'significant',
  critical: 'critical',
}

interface WholeSpineMapProps {
  patientId: string
}

const WholeSpineMap: React.FC<WholeSpineMapProps> = ({ patientId }) => {
  const [findings, setFindings] = useState<ImagingFinding[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ReturnType<typeof getAllSpineLevels>[0] & {
    severity: SpineSeverityColor; findings: string[]; nerves_affected: string[]
  } | null>(null)

  useEffect(() => {
    if (!patientId) return
    const load = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('imaging_findings')
        .select('*')
        .eq('patient_id', patientId)
        .not('spinal_level', 'is', null)
      setFindings((data as ImagingFinding[]) ?? [])
      setLoading(false)
    }
    load()
  }, [patientId])

  // Build SpineLevel array from all standard levels + overlay findings
  const findingsByLevel = new Map<string, ImagingFinding[]>()
  for (const f of findings) {
    if (!f.spinal_level) continue
    const key = normaliseSpineLevel(f.spinal_level)
    const existing = findingsByLevel.get(key) ?? []
    findingsByLevel.set(key, [...existing, f])
  }

  const spineLevels: SpineLevel[] = getAllSpineLevels().map(({ level, region }) => {
    const levelFindings = findingsByLevel.get(level) ?? []
    const worstSeverity: SpineSeverityColor = levelFindings.reduce(
      (worst, f) => {
        const s = severityMap[f.severity ?? 'normal'] ?? 'normal'
        const order: SpineSeverityColor[] = ['normal', 'mild', 'mild_nerve', 'moderate', 'significant', 'critical']
        return order.indexOf(s) > order.indexOf(worst) ? s : worst
      },
      'normal' as SpineSeverityColor,
    )
    return {
      level,
      region,
      severity: worstSeverity,
      findings: levelFindings.map((f) => f.plain_language ?? f.description ?? f.finding_type ?? '').filter(Boolean),
      nerves_affected: levelFindings.flatMap((f) => f.nerves_affected ?? []),
    }
  })

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-gray-400 text-sm">
        <div className="w-4 h-4 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
        Loading spine map…
      </div>
    )
  }

  const hasFindings = findings.length > 0

  return (
    <div className="space-y-4">
      {!hasFindings && (
        <div className="text-center py-6 text-gray-400">
          <p className="text-3xl mb-2">🦴</p>
          <p className="text-sm">No spinal findings yet</p>
          <p className="text-xs mt-1">Upload an MRI or spine report to populate the map</p>
        </div>
      )}

      {hasFindings && (
        <SpineMap
          levels={spineLevels}
          onLevelClick={(lvl) => setSelected(lvl)}
        />
      )}

      {/* Level detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full bg-white rounded-t-2xl px-5 py-6 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">{selected.level}</h3>
              <button type="button" onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
            </div>

            {selected.findings.length === 0 ? (
              <p className="text-sm text-gray-400">No findings at this level</p>
            ) : (
              <div className="space-y-3">
                {selected.findings.map((f, i) => (
                  <p key={i} className="text-sm text-gray-700 leading-relaxed">{f}</p>
                ))}
              </div>
            )}

            {selected.nerves_affected.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Nerves affected</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.nerves_affected.map((n, i) => (
                    <span key={i} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{n}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default WholeSpineMap
