import type { InvestmentHoldingDto } from './types'

export type InvestmentCategory =
  | 'stocksIsa'
  | 'pension'
  | 'brokerage'
  | 'crypto'
  | 'propertyEquity'
  | 'other'

export type InvestmentsEntryMode = 'simple' | 'breakdown'

export interface InvestmentHoldingRow {
  id: string
  category: InvestmentCategory
  customLabel: string | null
  balance: number | null
  annualReturnRate: number | null
  monthlyContribution: number | null
}

export interface InvestmentRollup {
  totalBalance: number | null
  weightedAnnualReturnRate: number | null
  totalMonthlyContributions: number | null
}

export const INVESTMENT_CATEGORY_OPTIONS: ReadonlyArray<{
  value: InvestmentCategory
  label: string
}> = [
  { value: 'stocksIsa', label: 'Stocks & shares ISA' },
  { value: 'pension', label: 'Pension' },
  { value: 'brokerage', label: 'General investing (GIA)' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'propertyEquity', label: 'Property (equity)' },
  { value: 'other', label: 'Other' },
]

export function investmentCategoryLabel(
  category: InvestmentCategory,
  customLabel: string | null,
): string {
  if (category === 'other' && customLabel?.trim()) {
    return customLabel.trim()
  }

  return INVESTMENT_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? 'Other'
}

export interface InvestmentSummaryLine {
  id: string
  label: string
  balance: number | null
  annualReturnRate: number | null
  monthlyContribution: number | null
}

export function getInvestmentSummaryLines(
  holdings: InvestmentHoldingRow[],
): InvestmentSummaryLine[] {
  return holdings
    .filter(
      (holding) =>
        holding.balance !== null ||
        holding.monthlyContribution !== null ||
        holding.annualReturnRate !== null,
    )
    .map((holding) => ({
      id: holding.id,
      label: investmentCategoryLabel(holding.category, holding.customLabel),
      balance: holding.balance,
      annualReturnRate: holding.annualReturnRate,
      monthlyContribution: holding.monthlyContribution,
    }))
}

export function shouldShowInvestmentBreakdown(
  mode: InvestmentsEntryMode,
  holdings: InvestmentHoldingRow[],
): boolean {
  return mode === 'breakdown' && getInvestmentSummaryLines(holdings).length > 0
}

export function createInvestmentHoldingRow(
  partial?: Partial<Omit<InvestmentHoldingRow, 'id'>>,
): InvestmentHoldingRow {
  return {
    id: crypto.randomUUID(),
    category: 'stocksIsa',
    customLabel: null,
    balance: null,
    annualReturnRate: null,
    monthlyContribution: null,
    ...partial,
  }
}

export function rollupInvestmentHoldings(holdings: InvestmentHoldingRow[]): InvestmentRollup {
  if (holdings.length === 0) {
    return {
      totalBalance: null,
      weightedAnnualReturnRate: null,
      totalMonthlyContributions: null,
    }
  }

  let totalBalance = 0
  let anyBalanceInput = false
  let weightedRateNumerator = 0
  let weightedRateDenominator = 0
  let totalContributions = 0
  let anyContributionInput = false

  for (const holding of holdings) {
    if (holding.balance !== null) {
      anyBalanceInput = true
      totalBalance += holding.balance

      if (holding.balance > 0) {
        const rate = holding.annualReturnRate ?? 0
        weightedRateNumerator += holding.balance * rate
        weightedRateDenominator += holding.balance
      }
    }

    if (holding.monthlyContribution !== null) {
      anyContributionInput = true
      totalContributions += holding.monthlyContribution
    }
  }

  const weightedAnnualReturnRate =
    weightedRateDenominator > 0
      ? Math.round((weightedRateNumerator / weightedRateDenominator) * 100) / 100
      : null

  return {
    totalBalance: anyBalanceInput ? totalBalance : null,
    weightedAnnualReturnRate,
    totalMonthlyContributions: anyContributionInput ? totalContributions : null,
  }
}

export function applyInvestmentRollupToForm<T extends {
  investmentsEntryMode: InvestmentsEntryMode
  investmentHoldings: InvestmentHoldingRow[]
  currentInvestments: number | null
  investmentInterestRate: number | null
  monthlyInvestmentContributions: number | null
}>(form: T): T {
  if (form.investmentsEntryMode !== 'breakdown') {
    return form
  }

  const rolled = rollupInvestmentHoldings(form.investmentHoldings)

  return {
    ...form,
    currentInvestments: rolled.totalBalance,
    investmentInterestRate: rolled.weightedAnnualReturnRate,
    monthlyInvestmentContributions: rolled.totalMonthlyContributions,
  }
}

export function switchInvestmentsEntryMode<
  T extends {
    investmentsEntryMode: InvestmentsEntryMode
    investmentHoldings: InvestmentHoldingRow[]
    currentInvestments: number | null
    investmentInterestRate: number | null
    monthlyInvestmentContributions: number | null
  },
>(form: T, mode: InvestmentsEntryMode): T {
  if (mode === form.investmentsEntryMode) {
    return form
  }

  if (mode === 'breakdown') {
    if (form.investmentHoldings.length > 0) {
      return applyInvestmentRollupToForm({ ...form, investmentsEntryMode: 'breakdown' })
    }

    const hasSimpleValues =
      form.currentInvestments !== null ||
      form.investmentInterestRate !== null ||
      form.monthlyInvestmentContributions !== null

    const holdings = hasSimpleValues
      ? [
          createInvestmentHoldingRow({
            category: 'stocksIsa',
            balance: form.currentInvestments,
            annualReturnRate: form.investmentInterestRate,
            monthlyContribution: form.monthlyInvestmentContributions,
          }),
        ]
      : [
          createInvestmentHoldingRow({ category: 'stocksIsa' }),
          createInvestmentHoldingRow({ category: 'pension' }),
        ]

    return applyInvestmentRollupToForm({
      ...form,
      investmentsEntryMode: 'breakdown',
      investmentHoldings: holdings,
    })
  }

  return {
    ...form,
    investmentsEntryMode: 'simple',
  }
}

export function holdingRowToDto(row: InvestmentHoldingRow): InvestmentHoldingDto {
  return {
    id: row.id,
    category: row.category,
    customLabel: row.customLabel,
    balance: row.balance,
    annualReturnRate: row.annualReturnRate,
    monthlyContribution: row.monthlyContribution,
  }
}

export function holdingRowFromDto(dto: InvestmentHoldingDto): InvestmentHoldingRow {
  return {
    id: dto.id,
    category: isInvestmentCategory(dto.category) ? dto.category : 'other',
    customLabel: dto.customLabel,
    balance: dto.balance,
    annualReturnRate: dto.annualReturnRate,
    monthlyContribution: dto.monthlyContribution,
  }
}

function isInvestmentCategory(value: string): value is InvestmentCategory {
  return INVESTMENT_CATEGORY_OPTIONS.some((option) => option.value === value)
}

export function investmentCategoryLabelFromApi(
  category: string,
  customLabel: string | null,
): string {
  return investmentCategoryLabel(
    isInvestmentCategory(category) ? category : 'other',
    customLabel,
  )
}
