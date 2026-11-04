import type { InvestmentHoldingRow } from './investmentHoldings'
import type { ProfileFormState } from './model'

function isAllInvestmentsLump(holding: InvestmentHoldingRow): boolean {
  return holding.category === 'other' && holding.customLabel === 'All investments'
}

function countDetailedHoldings(holdings: InvestmentHoldingRow[]): number {
  return holdings.filter(
    (holding) =>
      !isAllInvestmentsLump(holding) &&
      (holding.balance !== null ||
        holding.monthlyContribution !== null ||
        holding.annualReturnRate !== null),
  ).length
}

/** Prefer richer cached breakdown when a refetch returns a lumped or empty breakdown. */
export function mergeProfileFormAfterLoad(
  loaded: ProfileFormState,
  cached: ProfileFormState | undefined,
): ProfileFormState {
  if (!cached) {
    return loaded
  }

  const cachedDetail = countDetailedHoldings(cached.investmentHoldings)
  const loadedDetail = countDetailedHoldings(loaded.investmentHoldings)

  if (cachedDetail === 0) {
    return loaded
  }

  if (loadedDetail >= cachedDetail) {
    return loaded
  }

  return {
    ...loaded,
    investmentsEntryMode:
      cached.investmentsEntryMode === 'breakdown' ? 'breakdown' : loaded.investmentsEntryMode,
    investmentHoldings: cached.investmentHoldings,
  }
}

export function shouldPreferSubmittedHoldings(
  submitted: ProfileFormState,
  savedHoldings: ProfileFormState['investmentHoldings'],
): boolean {
  if (submitted.investmentHoldings.length === 0) {
    return false
  }

  if (savedHoldings.length === 0) {
    return true
  }

  if (
    submitted.investmentHoldings.length > 1 &&
    savedHoldings.length === 1 &&
    isAllInvestmentsLump(savedHoldings[0]!)
  ) {
    return true
  }

  return submitted.investmentHoldings.length > savedHoldings.length
}
