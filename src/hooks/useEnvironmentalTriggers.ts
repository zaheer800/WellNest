import { useEffect, useState } from 'react'
import { getSymptomLogs } from '@/services/supabase'
import type { SymptomLog, EnvironmentData } from '@/types/health.types'

type EnvKey = keyof EnvironmentData
type Severity = 'high' | 'medium' | 'low'

interface EnvCorrelation {
  env_key: EnvKey
  env_value: string
  avg_episodes: number
  vs_baseline: number
  severity: Severity
}

function classifySeverity(vsBaseline: number): Severity {
  if (vsBaseline >= 0.5) return 'high'
  if (vsBaseline >= 0.25) return 'medium'
  return 'low'
}

function computeCorrelations(logs: SymptomLog[]): EnvCorrelation[] {
  if (logs.length === 0) return []

  const totalLogs = logs.length

  // Group by env_key + env_value and count episodes + average severity
  const buckets: Record<string, { count: number; totalSeverity: number }> = {}

  for (const log of logs) {
    const env = log.environment ?? {}
    for (const [key, value] of Object.entries(env) as [EnvKey, string][]) {
      if (!value) continue
      const bucketKey = `${key}::${value}`
      if (!buckets[bucketKey]) buckets[bucketKey] = { count: 0, totalSeverity: 0 }
      buckets[bucketKey].count += 1
      buckets[bucketKey].totalSeverity += log.severity
    }
  }

  // Baseline: average episodes per env state assuming uniform distribution
  const overallAvgSeverity = logs.reduce((sum, l) => sum + l.severity, 0) / totalLogs

  const correlations: EnvCorrelation[] = Object.entries(buckets).map(([bucketKey, stats]) => {
    const [env_key, env_value] = bucketKey.split('::') as [EnvKey, string]
    const avg_episodes = stats.count / totalLogs
    const avgSeverityForEnv = stats.totalSeverity / stats.count
    const vs_baseline = (avgSeverityForEnv - overallAvgSeverity) / Math.max(overallAvgSeverity, 1)
    return {
      env_key,
      env_value,
      avg_episodes,
      vs_baseline,
      severity: classifySeverity(Math.abs(vs_baseline)),
    }
  })

  return correlations
    .filter((c) => c.vs_baseline > 0)
    .sort((a, b) => b.vs_baseline - a.vs_baseline)
}

function buildInsights(correlations: EnvCorrelation[]): string[] {
  return correlations
    .filter((c) => c.severity === 'high' || c.severity === 'medium')
    .slice(0, 5)
    .map((c) => {
      const pct = Math.round(c.vs_baseline * 100)
      return `Symptoms are ${pct}% more severe in ${c.env_key.replace('_', ' ')}: ${c.env_value.replace('_', ' ')}.`
    })
}

export function useEnvironmentalTriggers(patientId: string) {
  const [correlations, setCorrelations] = useState<EnvCorrelation[]>([])
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!patientId) return

    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const logs = await getSymptomLogs(patientId, 200)
        if (cancelled) return
        const computed = computeCorrelations(logs as SymptomLog[])
        setCorrelations(computed)
        setInsights(buildInsights(computed))
      } catch {
        // Silently fail — environmental triggers are supplementary
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [patientId])

  return { correlations, loading, insights }
}
