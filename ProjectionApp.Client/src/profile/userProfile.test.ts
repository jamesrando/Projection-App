import { describe, expect, it } from 'vitest'
import { hasAnyBalance, monthlyCashFlow, totalPosition } from './userProfile'

describe('userProfile helpers', () => {
  it('derives monthly cash flow from annual salary', () => {
    expect(monthlyCashFlow(60_000)).toBe(5_000)
    expect(monthlyCashFlow(null)).toBeNull()
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

  it('detects when any balance field is present', () => {
    expect(
      hasAnyBalance({
        annualSalary: 50_000,
        currentInvestments: null,
        currentCashSavings: null,
        investmentInterestRate: null,
        savingsInterestRate: null,
        monthlyInvestmentContributions: null,
      }),
    ).toBe(true)
  })
})
