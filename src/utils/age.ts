/** Age helpers. The 18th-birthday rule must match the database (dob + interval '18 years'). */

/** Whole years between a date of birth (YYYY-MM-DD) and `now`. Undefined without a date. */
export function ageFrom(dob: string | null | undefined, now: Date = new Date()): number | undefined {
  if (!dob) return undefined
  const [y, m, d] = dob.slice(0, 10).split('-').map(Number)
  let age = now.getFullYear() - y
  const monthDiff = now.getMonth() + 1 - m
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d)) age--
  return age
}

/**
 * The date guardianship ends: the 18th birthday, as YYYY-MM-DD.
 * Postgres adds 18 years to 29 February and lands on 28 February in a non-leap year, so this does too.
 */
export function eighteenthBirthday(dob: string): string {
  const [y, m, d] = dob.slice(0, 10).split('-').map(Number)
  const year = y + 18
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  const day = m === 2 && d === 29 && !isLeap ? 28 : d
  return `${year}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
