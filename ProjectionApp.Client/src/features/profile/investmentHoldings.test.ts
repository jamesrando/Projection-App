import { describe, expect, it } from 'vitest'
import {
  createInvestmentHoldingRow,
  getInvestmentSummaryLines,
  rollupInvestmentHoldings,
  shouldShowInvestmentBreakdown,
  switchInvestmentsEntryMode,
} from './investmentHoldings'
import { emptyProfileForm } from './model'

describe('rollupInvestmentHoldings', () => {
  it('computes balance-weighted return and totals', () => {
    const result = rollupInvestmentHoldings([
      createInvestmentHoldingRow({ balance: 10_000, annualReturnRate: 5, monthlyContribution: 100 }),
      createInvestmentHoldingRow({ balance: 30_000, annualReturnRate: 7, monthlyContribution: 200 }),
    ])

    expect(result.totalBalance).toBe(40_000)
    expect(result.totalMonthlyContributions).toBe(300)
    expect(result.weightedAnnualReturnRate).toBe(6.5)
  })
})

describe('getInvestmentSummaryLines', () => {
  it('lists holdings that have any entered value', () => {
    const lines = getInvestmentSummaryLines([
      createInvestmentHoldingRow({ balance: 1_000 }),
      createInvestmentHoldingRow(),
    ])

    expect(lines).toHaveLength(1)
    expect(lines[0]?.balance).toBe(1_000)
  })
})

describe('shouldShowInvestmentBreakdown', () => {
  it('is shown only in breakdown mode with line items', () => {
    const holdings = [createInvestmentHoldingRow({ balance: 500 })]

    expect(shouldShowInvestmentBreakdown('breakdown', holdings)).toBe(true)
    expect(shouldShowInvestmentBreakdown('simple', holdings)).toBe(false)
  })
})

describe('switchInvestmentsEntryMode', () => {
  it('seeds breakdown rows from simple totals', () => {
    const form = {
      ...emptyProfileForm(),
      currentInvestments: 25_000,
      investmentInterestRate: 6,
      monthlyInvestmentContributions: 400,
      investmentsEntryMode: 'simple' as const,
      investmentHoldings: [],
    }

    const next = switchInvestmentsEntryMode(form, 'breakdown')

    expect(next.investmentsEntryMode).toBe('breakdown')
    expect(next.investmentHoldings).toHaveLength(1)
    expect(next.investmentHoldings[0]?.balance).toBe(25_000)
    expect(next.currentInvestments).toBe(25_000)
  })

  it('keeps category rows when toggling back to simple mode', () => {
    const holdings = [
      createInvestmentHoldingRow({ category: 'stocksIsa', balance: 10_000 }),
      createInvestmentHoldingRow({ category: 'pension', balance: 20_000 }),
    ]
    const breakdown = {
      ...emptyProfileForm(),
      investmentsEntryMode: 'breakdown' as const,
      investmentHoldings: holdings,
      currentInvestments: 30_000,
    }

    const simple = switchInvestmentsEntryMode(breakdown, 'simple')
    expect(simple.investmentHoldings).toHaveLength(2)

    const restored = switchInvestmentsEntryMode(simple, 'breakdown')
    expect(restored.investmentHoldings[0]?.category).toBe('stocksIsa')
    expect(restored.investmentHoldings[1]?.category).toBe('pension')
  })
})
