export function sharePercentOfTotal(amount: number, total: number): number {
  if (total <= 0) {
    return 0
  }

  return Math.round((amount / total) * 1000) / 10
}

export function formatSharePercent(value: number, fractionDigits = 1): string {
  return `${value.toFixed(fractionDigits)}%`
}
