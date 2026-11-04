import { describe, expect, it } from 'vitest'
import { formatSharePercent, sharePercentOfTotal } from './share'

describe('sharePercentOfTotal', () => {
  it('returns zero when total is not positive', () => {
    expect(sharePercentOfTotal(10, 0)).toBe(0)
  })

  it('rounds to one decimal place', () => {
    expect(sharePercentOfTotal(1, 3)).toBe(33.3)
  })
})

describe('formatSharePercent', () => {
  it('formats with configurable precision', () => {
    expect(formatSharePercent(33.333)).toBe('33.3%')
    expect(formatSharePercent(50, 0)).toBe('50%')
  })
})
