import { MAX_INTEREST_RATE_PERCENT, MIN_INTEREST_RATE_PERCENT } from '../profile/profileRules'

export function formatPercent(value: number | null): string {
  if (value === null) {
    return '—'
  }

  const text = value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
  return `${text}%`
}

export function parsePercentInput(raw: string): number | null {
  const trimmed = raw.trim().replace(/%$/, '')
  if (trimmed === '') {
    return null
  }

  const parsed = Number(trimmed)
  if (
    !Number.isFinite(parsed) ||
    parsed < MIN_INTEREST_RATE_PERCENT ||
    parsed > MAX_INTEREST_RATE_PERCENT
  ) {
    return null
  }

  return parsed
}

export function validatePercentInput(raw: string): string | null {
  const trimmed = raw.trim().replace(/%$/, '')
  if (trimmed === '') {
    return null
  }

  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed)) {
    return 'Enter a valid number'
  }

  if (parsed < MIN_INTEREST_RATE_PERCENT || parsed > MAX_INTEREST_RATE_PERCENT) {
    return `Enter a value between ${MIN_INTEREST_RATE_PERCENT} and ${MAX_INTEREST_RATE_PERCENT}`
  }

  return null
}
