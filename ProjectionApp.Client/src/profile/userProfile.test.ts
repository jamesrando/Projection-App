import { describe, expect, it } from 'vitest'
import { MAX_INTEREST_RATE_PERCENT, MIN_INTEREST_RATE_PERCENT } from './profileRules'
import { totalPosition } from './userProfile'

describe('userProfile helpers', () => {
  it('sums investments and savings for total position', () => {
    expect(
      totalPosition({
        annualSalary: null,
        currentInvestments: 40_000,
        currentCashSavings: 10_000,
        investmentInterestRate: null,
        savingsInterestRate: null,
        monthlyInvestmentContributions: null,
      }),
    ).toBe(50_000)
  })
})

describe('profileRules', () => {
  it('mirrors domain interest rate bounds', () => {
    expect(MIN_INTEREST_RATE_PERCENT).toBe(0)
    expect(MAX_INTEREST_RATE_PERCENT).toBe(100)
  })
})
