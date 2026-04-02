export function getAnomalyLevel(status: string): 0 | 1 | 2 | 3 | 4 | 5 {
  switch (status.toLowerCase()) {
    case 'normal':
      return 0
    case 'borderline_low':
    case 'borderline_high':
    case 'borderline':
      return 1
    case 'abnormal_low':
    case 'abnormal_high':
    case 'abnormal':
      return 3
    case 'critical':
      return 5
    default:
      return 0
  }
}

export function isAbnormal(status: string): boolean {
  const level = getAnomalyLevel(status)
  return level >= 3
}

export function isCritical(status: string): boolean {
  return status.toLowerCase() === 'critical'
}

export function getStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case 'normal':
      return 'Normal'
    case 'borderline_low':
      return 'Borderline Low'
    case 'borderline_high':
      return 'Borderline High'
    case 'borderline':
      return 'Borderline'
    case 'abnormal_low':
      return 'Abnormal Low'
    case 'abnormal_high':
      return 'Abnormal High'
    case 'abnormal':
      return 'Abnormal'
    case 'critical':
      return 'Critical'
    default:
      return 'Unknown'
  }
}
