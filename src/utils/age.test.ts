import { describe, it, expect } from 'vitest'
import { ageFrom, eighteenthBirthday } from './age'

describe('ageFrom', () => {
  it('is undefined without a date of birth', () => {
    expect(ageFrom(null)).toBeUndefined()
    expect(ageFrom('')).toBeUndefined()
  })
  it('counts whole years, not yet reaching a birthday later this year', () => {
    expect(ageFrom('2010-06-15', new Date(2026, 5, 14))).toBe(15) // day before 16th birthday
    expect(ageFrom('2010-06-15', new Date(2026, 5, 15))).toBe(16) // on the birthday
    expect(ageFrom('2010-06-15', new Date(2026, 0, 1))).toBe(15)
  })
})

describe('eighteenthBirthday', () => {
  it('adds 18 years', () => {
    expect(eighteenthBirthday('2015-03-09')).toBe('2033-03-09')
  })
  it('matches Postgres for 29 February: 28 February when the year is not a leap year', () => {
    expect(eighteenthBirthday('2008-02-29')).toBe('2026-02-28')
    expect(eighteenthBirthday('2004-02-29')).toBe('2022-02-28')
  })
  it('keeps 29 February when the 18th year is a leap year', () => {
    expect(eighteenthBirthday('2006-02-28')).toBe('2024-02-28')
    expect(eighteenthBirthday('2000-02-29')).toBe('2018-02-28') // 2018 is not a leap year
  })
})
