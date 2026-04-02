export function formatMl(ml: number): string {
  if (ml >= 1000) {
    const liters = ml / 1000
    return `${parseFloat(liters.toFixed(1))} L`
  }
  return `${ml} ml`
}

export function formatScore(score: number): string {
  return `${Math.round(score)}/100`
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-500'
  return 'text-red-500'
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function getSeverityColor(severity: 'advisory' | 'strict' | 'absolute'): string {
  switch (severity) {
    case 'advisory':
      return 'text-yellow-600'
    case 'strict':
      return 'text-orange-600'
    case 'absolute':
      return 'text-red-600'
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'normal':
      return 'text-green-600'
    case 'borderline_low':
    case 'borderline_high':
    case 'borderline':
      return 'text-yellow-500'
    case 'abnormal_low':
    case 'abnormal_high':
    case 'abnormal':
    case 'critical':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

export function capitalize(s: string): string {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}
