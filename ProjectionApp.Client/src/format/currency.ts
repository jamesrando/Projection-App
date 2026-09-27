export const GOAL_TARGET_AMOUNT = 100_000

const currencyWhole = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})

const currencyPrecise = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const currencySymbol = '£'

export function formatCurrency(value: number | null, precise = false): string {
  if (value === null) {
    return '—'
  }

  return precise ? currencyPrecise.format(value) : currencyWhole.format(value)
}

export function formatGoalTarget(): string {
  return formatCurrency(GOAL_TARGET_AMOUNT)
}

export function parseCurrencyInput(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') {
    return null
  }

  const normalized = trimmed.replace(/[£$,]/g, '')
  const parsed = Number(normalized)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }

  return parsed
}
