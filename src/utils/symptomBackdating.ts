// Returns true if onset_date is before today (symptom is backdated)
export function isBackdated(onsetDate: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const onset = new Date(onsetDate)
  onset.setHours(0, 0, 0, 0)
  return onset < today
}

// Returns human-readable duration string: "3 months ago", "1 year ago"
export function getOnsetDuration(onsetDate: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const onset = new Date(onsetDate)
  onset.setHours(0, 0, 0, 0)

  const diffMs = today.getTime() - onset.getTime()
  if (diffMs < 0) return 'in the future'

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return '1 week ago'
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 60) return '1 month ago'
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  if (diffDays < 730) return '1 year ago'
  return `${Math.floor(diffDays / 365)} years ago`
}

// Validates that onset date is not in the future
export function validateOnsetDate(onsetDate: string): { valid: boolean; error?: string } {
  if (!onsetDate || onsetDate.trim() === '') {
    return { valid: false, error: 'Onset date is required.' }
  }

  const onset = new Date(onsetDate)
  if (isNaN(onset.getTime())) {
    return { valid: false, error: 'Onset date is not a valid date.' }
  }

  const today = new Date()
  today.setHours(23, 59, 59, 999)

  if (onset > today) {
    return { valid: false, error: 'Onset date cannot be in the future.' }
  }

  return { valid: true }
}
