import { describe, expect, it } from 'vitest'
import { MAX_INTEREST_RATE_PERCENT, MIN_INTEREST_RATE_PERCENT } from './profileRules'
import { hasMinimumFinancesInputs, totalPosition } from './model'

describe('userProfile helpers', () => {
  it('requires at least one balance for minimum finances inputs', () => {
    const empty = {
      annualSalary: 50_000,
      currentInvestments: null,
      currentCashSavings: null,
      investmentInterestRate: 7,
      savingsInterestRate: 5,
      monthlyInvestmentContributions: null,
    }

    expect(hasMinimumFinancesInputs(empty)).toBe(false)
    expect(hasMinimumFinancesInputs({ ...empty, currentInvestments: 0 })).toBe(true)
    expect(hasMinimumFinancesInputs({ ...empty, currentCashSavings: 1_000 })).toBe(true)
  })

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
