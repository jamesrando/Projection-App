import { describe, expect, it } from 'vitest'
import { formatCurrency, parseCurrencyInput } from './currency'

describe('formatCurrency', () => {
  it('returns an em dash for null', () => {
    expect(formatCurrency(null)).toBe('—')
  })

  it('formats whole pounds by default', () => {
    expect(formatCurrency(100_000)).toBe('£100,000')
  })

  it('formats pence when precise', () => {
    expect(formatCurrency(1142.62, true)).toBe('£1,142.62')
  })
})

describe('parseCurrencyInput', () => {
  it('returns null for blank input', () => {
    expect(parseCurrencyInput('')).toBeNull()
  })

  it('parses currency symbols and commas', () => {
    expect(parseCurrencyInput('£1,250.50')).toBe(1250.5)
  })

  it('rejects invalid values', () => {
    expect(parseCurrencyInput('abc')).toBeNull()
    expect(parseCurrencyInput('-5')).toBeNull()
  })
})
