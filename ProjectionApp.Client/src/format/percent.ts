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
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
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

  if (parsed < 0 || parsed > 100) {
    return 'Enter a value between 0 and 100'
  }

  return null
}
