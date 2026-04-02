export type SpineRegion = 'cervical' | 'thoracic' | 'lumbar' | 'sacral'
export type SpineSeverityColor = 'normal' | 'mild' | 'mild_nerve' | 'moderate' | 'significant' | 'critical'

export interface SpineLevel {
  level: string        // e.g. 'C4', 'L4-L5'
  region: SpineRegion
  severity: SpineSeverityColor
  findings: string[]
  nerves_affected: string[]
}

const SEVERITY_HEX: Record<SpineSeverityColor, string> = {
  normal: '#4CAF50',
  mild: '#FFF176',
  mild_nerve: '#FFB74D',
  moderate: '#FF8A65',
  significant: '#E53935',
  critical: '#7B1FA2',
}

// Returns hex color for a severity level
export function getSeverityColor(severity: SpineSeverityColor): string {
  return SEVERITY_HEX[severity] ?? SEVERITY_HEX.normal
}

// Returns all standard spine levels (C1-C7, D1-D12, L1-L5, S1-S2)
export function getAllSpineLevels(): Array<{ level: string; region: SpineRegion }> {
  const levels: Array<{ level: string; region: SpineRegion }> = []

  for (let i = 1; i <= 7; i++) {
    levels.push({ level: `C${i}`, region: 'cervical' })
  }
  for (let i = 1; i <= 12; i++) {
    levels.push({ level: `D${i}`, region: 'thoracic' })
  }
  for (let i = 1; i <= 5; i++) {
    levels.push({ level: `L${i}`, region: 'lumbar' })
  }
  levels.push({ level: 'S1', region: 'sacral' })
  levels.push({ level: 'S2', region: 'sacral' })

  return levels
}

// Normalises a raw spinal level string to canonical form: 'l4-l5' → 'L4-L5'
export function normaliseSpineLevel(raw: string): string {
  if (!raw) return raw

  return raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/([CDLSTcdlst])(\d+)\s*[-–—]\s*([CDLSTcdlst])(\d+)/i, '$1$2-$3$4')
    .replace(/([CDLSTcdlst])(\d+)\s*[-–—]\s*(\d+)/i, '$1$2-$1$3')
}
