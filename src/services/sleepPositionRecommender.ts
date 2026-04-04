import { SLEEP_POSITIONS } from '@/constants/sleepPositions'

/**
 * Recommends the best sleep position ID based on patient conditions and spinal findings.
 * Returns a position id matching SLEEP_POSITIONS entries.
 */
export function getRecommendedPosition(
  conditions: string[],
  spinalFindings: string[],
): string {
  const lower = [...conditions, ...spinalFindings].map((s) => s.toLowerCase())

  const hasGERD = lower.some((s) => s.includes('gerd') || s.includes('reflux') || s.includes('acid'))
  const hasLumbarDisc = lower.some((s) =>
    s.includes('l4') || s.includes('l5') || s.includes('lumbar disc') || s.includes('disc bulge'),
  )
  const hasHeartCondition = lower.some((s) =>
    s.includes('heart') || s.includes('cardiac') || s.includes('cardia'),
  )

  if (hasGERD && hasLumbarDisc) return 'left_side_pillow'
  if (hasGERD) return 'left_side_pillow'
  if (hasLumbarDisc) return 'side_pillow_between_knees'
  if (hasHeartCondition) return 'left_side_pillow'

  return 'back'
}

/**
 * Returns personalised sleep guidance text for the given position and patient conditions.
 */
export function getPositionGuidance(positionId: string, conditions: string[]): string {
  const position = SLEEP_POSITIONS.find((p) => p.id === positionId)
  if (!position) return 'Follow your doctor\'s sleep position recommendations.'

  const lower = conditions.map((c) => c.toLowerCase())
  const hasLumbar = lower.some((c) => c.includes('lumbar') || c.includes('l4') || c.includes('l5'))
  const hasGERD = lower.some((c) => c.includes('gerd') || c.includes('reflux'))

  let guidance = `Recommended: ${position.label}. ${position.description}`

  if (positionId === 'left_side_pillow') {
    if (hasGERD) guidance += ' Sleeping on your left side helps reduce acid reflux.'
    if (hasLumbar) guidance += ' Place a pillow between your knees to reduce pressure on your lower back.'
  } else if (positionId === 'side_pillow_between_knees') {
    if (hasLumbar) guidance += ' The pillow between your knees keeps your spine aligned and protects your L4-L5 disc.'
  } else if (positionId === 'back') {
    guidance += ' Use a pillow under your knees to maintain the natural curve of your spine.'
  }

  return guidance
}
