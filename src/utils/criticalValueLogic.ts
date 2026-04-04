import { CRITICAL_VALUE_ACTIONS } from '@/constants/criticalValues'

const EMERGENCY_PARAMETERS = new Set([
  'potassium',
  'sodium',
  'glucose',
  'hemoglobin',
  'platelet_count',
  'troponin',
  'INR',
  'pH',
])

const CRITICAL_PRIORITY_MAP: Record<string, 'high' | 'urgent' | 'critical'> = {
  potassium: 'critical',
  sodium: 'critical',
  glucose: 'critical',
  creatinine: 'urgent',
  hemoglobin: 'critical',
  platelet_count: 'critical',
  troponin: 'critical',
  INR: 'critical',
  calcium: 'urgent',
  pH: 'critical',
}

// Determines action text for a critical lab parameter
export function getCriticalAction(
  parameterName: string,
  status: 'critical_low' | 'critical_high',
  value: number,
  unit: string
): string {
  const key = parameterName.toLowerCase().replace(/\s+/g, '_')
  const entry = CRITICAL_VALUE_ACTIONS[key] ?? CRITICAL_VALUE_ACTIONS[parameterName]

  if (!entry) {
    return status === 'critical_high'
      ? `Critically high ${parameterName} (${value} ${unit}). Contact your doctor today.`
      : `Critically low ${parameterName} (${value} ${unit}). Contact your doctor today.`
  }

  const baseAction = status === 'critical_high' ? entry.high_action : entry.low_action
  return `${parameterName}: ${value} ${unit} — ${baseAction}`
}

// Returns true if parameter requires emergency action
export function isEmergencyValue(
  parameterName: string
): boolean {
  const key = parameterName.toLowerCase().replace(/\s+/g, '_')
  const normalised = EMERGENCY_PARAMETERS.has(key) ? key : parameterName

  const entry = CRITICAL_VALUE_ACTIONS[normalised] ?? CRITICAL_VALUE_ACTIONS[key]
  if (entry) {
    return entry.contact_urgency === 'emergency'
  }

  return EMERGENCY_PARAMETERS.has(key) || EMERGENCY_PARAMETERS.has(parameterName)
}

// Returns notification priority for a critical value
export function getCriticalPriority(parameterName: string): 'high' | 'urgent' | 'critical' {
  const key = parameterName.toLowerCase().replace(/\s+/g, '_')
  return CRITICAL_PRIORITY_MAP[key] ?? CRITICAL_PRIORITY_MAP[parameterName] ?? 'high'
}
