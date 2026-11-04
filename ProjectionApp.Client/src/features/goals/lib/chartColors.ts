/** Theme tokens from index.css. SVG attributes accept these var() values. */
export const CHART_COLORS = {
  investments: 'var(--accent)',
  savings: 'var(--money)',
  interest: 'var(--interest)',
  goal: 'var(--text-h)',
  baseline: 'var(--text-muted)',
  grid: 'var(--border)',
  muted: 'var(--text-muted)',
} as const

export const CHART_AREA_OPACITY = {
  investments: 0.88,
  savings: 0.8,
} as const
