import { describe, expect, it } from 'vitest'
import { formatPercent, parsePercentInput, validatePercentInput } from './percent'

describe('formatPercent', () => {
  it('returns an em dash for null', () => {
    expect(formatPercent(null)).toBe('—')
  })

  it('trims trailing zeros', () => {
    expect(formatPercent(7)).toBe('7%')
    expect(formatPercent(7.5)).toBe('7.5%')
  })
})

describe('parsePercentInput', () => {
  it('accepts values with or without a percent sign', () => {
    expect(parsePercentInput('7')).toBe(7)
    expect(parsePercentInput('7%')).toBe(7)
  })

  it('rejects out-of-range values', () => {
    expect(parsePercentInput('101')).toBeNull()
    expect(parsePercentInput('-1')).toBeNull()
  })
})

describe('validatePercentInput', () => {
  it('returns null for valid blank or numeric input', () => {
    expect(validatePercentInput('')).toBeNull()
    expect(validatePercentInput('12.5')).toBeNull()
  })

  it('returns an error message for invalid input', () => {
    expect(validatePercentInput('abc')).toBe('Enter a valid number')
    expect(validatePercentInput('150')).toBe('Enter a value between 0 and 100')
  })
})
