import { describe, expect, it } from 'vitest'
import { discountToToday } from './realMoney'

describe('discountToToday', () => {
  it('leaves the starting month unchanged', () => {
    expect(discountToToday(100_000, 0, 2.5)).toBe(100_000)
  })

  it('discounts one year at the annual rate', () => {
    expect(discountToToday(102_500, 12, 2.5)).toBeCloseTo(100_000, 6)
  })

  it('compounds over a long horizon', () => {
    const years = 15
    const nominal = 100_000 * 1.025 ** years
    expect(discountToToday(nominal, years * 12, 2.5)).toBeCloseTo(100_000, 4)
  })

  it('leaves amounts unchanged when inflation is zero', () => {
    expect(discountToToday(80_000, 180, 0)).toBe(80_000)
  })
})
