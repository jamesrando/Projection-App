/** Default UK-style long-run inflation assumption, as a percent (2.5% a year). */
export const DEFAULT_ANNUAL_INFLATION_PERCENT = 2.5

export const MIN_ANNUAL_INFLATION_PERCENT = 0
export const MAX_ANNUAL_INFLATION_PERCENT = 20

/**
 * Purchasing power of a future amount in month-0 pounds.
 * Month 0 is already today's money, so it is left unchanged.
 */
export function discountToToday(
  amount: number,
  month: number,
  annualInflationPercent: number,
): number {
  if (!Number.isFinite(amount) || month <= 0 || annualInflationPercent <= 0) {
    return amount
  }

  const years = month / 12
  return amount / (1 + annualInflationPercent / 100) ** years
}
