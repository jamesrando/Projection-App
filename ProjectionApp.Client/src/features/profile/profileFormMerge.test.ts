import { describe, expect, it } from 'vitest'
import { createInvestmentHoldingRow } from './investmentHoldings'
import { emptyProfileForm } from './model'
import { mergeProfileFormAfterLoad, shouldPreferSubmittedHoldings } from './profileFormMerge'

describe('mergeProfileFormAfterLoad', () => {
  it('keeps cached breakdown when refetch returns a single lumped row', () => {
    const cached = {
      ...emptyProfileForm(),
      investmentsEntryMode: 'breakdown' as const,
      investmentHoldings: [
        createInvestmentHoldingRow({ category: 'stocksIsa', balance: 10_000 }),
        createInvestmentHoldingRow({ category: 'pension', balance: 30_000 }),
      ],
    }
    const loaded = {
      ...emptyProfileForm(),
      investmentsEntryMode: 'breakdown' as const,
      investmentHoldings: [
        createInvestmentHoldingRow({
          category: 'other',
          customLabel: 'All investments',
          balance: 40_000,
        }),
      ],
    }

    const merged = mergeProfileFormAfterLoad(loaded, cached)

    expect(merged.investmentHoldings).toHaveLength(2)
    expect(merged.investmentHoldings[0]?.category).toBe('stocksIsa')
    expect(merged.investmentHoldings[1]?.category).toBe('pension')
  })
})

describe('shouldPreferSubmittedHoldings', () => {
  it('prefers submitted rows over a single all-investments lump', () => {
    const submitted = {
      ...emptyProfileForm(),
      investmentsEntryMode: 'breakdown' as const,
      investmentHoldings: [
        createInvestmentHoldingRow({ category: 'stocksIsa', balance: 10_000 }),
        createInvestmentHoldingRow({ category: 'pension', balance: 30_000 }),
      ],
    }

    expect(
      shouldPreferSubmittedHoldings(submitted, [
        createInvestmentHoldingRow({
          category: 'other',
          customLabel: 'All investments',
          balance: 40_000,
        }),
      ]),
    ).toBe(true)
  })
})
