import { URINE_COLORS } from '@/constants/urineColors'

// Returns the matching color entry for a given color id
export function getUrineColorInfo(colorId: string): typeof URINE_COLORS[number] | undefined {
  return URINE_COLORS.find((c) => c.id === colorId)
}

// Returns guidance text based on color and patient conditions
export function getUrineGuidance(colorId: string, conditions: string[]): string {
  const color = getUrineColorInfo(colorId)
  if (!color) return 'Unknown colour selected. Please select from the provided options.'

  const lowerConditions = conditions.map((c) => c.toLowerCase())
  const hasKidneyDisease =
    lowerConditions.some((c) => c.includes('kidney') || c.includes('renal') || c.includes('nephro'))
  const hasLiverDisease =
    lowerConditions.some((c) => c.includes('liver') || c.includes('hepat'))
  const hasDiabetes =
    lowerConditions.some((c) => c.includes('diabet'))
  const hasUrinaryIssue =
    lowerConditions.some((c) => c.includes('uti') || c.includes('urinary') || c.includes('bladder') || c.includes('prostat'))

  let guidance = color.meaning

  if (colorId === 'dark_yellow' || colorId === 'amber') {
    if (hasKidneyDisease) {
      guidance += ' Given your kidney condition, increase fluid intake and monitor closely. Contact your doctor if this persists.'
    } else {
      guidance += ' Drink more water throughout the day.'
    }
  } else if (colorId === 'orange') {
    if (hasKidneyDisease || hasLiverDisease) {
      guidance += ' Given your medical history, contact your doctor today rather than waiting.'
    } else {
      guidance += ' If not related to vitamin supplements or medications, contact your doctor today.'
    }
  } else if (colorId === 'brown') {
    if (hasLiverDisease) {
      guidance += ' Given your liver condition, contact your doctor today — this may indicate worsening liver function.'
    } else {
      guidance += ' Contact your doctor today for evaluation.'
    }
  } else if (colorId === 'pink_red') {
    guidance += ' This requires urgent medical attention. Do not delay seeking care.'
  } else if (colorId === 'cloudy_white') {
    if (hasUrinaryIssue) {
      guidance += ' Given your urinary history, contact your doctor today for a urine culture.'
    } else {
      guidance += ' Contact your doctor for a urine test.'
    }
  } else if (colorId === 'dark_brown_cola') {
    guidance += ' This is a medical emergency. Seek immediate care.'
  } else if (colorId === 'green_blue') {
    guidance += ' Usually caused by certain medications or foods (e.g., asparagus). Confirm with your doctor if not medication-related.'
  } else if (colorId === 'pale_yellow' || colorId === 'yellow') {
    if (hasDiabetes) {
      guidance += ' Continue monitoring your fluid intake regularly.'
    } else {
      guidance += ' Keep up your hydration.'
    }
  }

  return guidance
}

// Returns true if color requires immediate medical attention
export function requiresUrgentAttention(colorId: string): boolean {
  const color = getUrineColorInfo(colorId)
  return color?.action === 'urgent'
}
