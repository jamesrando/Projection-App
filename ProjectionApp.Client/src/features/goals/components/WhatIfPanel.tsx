import { formatCurrency } from '@/shared/lib/format/currency'
import type { SavingsGoalResult } from '../types'
import {
  CONTRIBUTION_DELTA_MAX,
  CONTRIBUTION_DELTA_MIN,
  formatMonthsDelta,
  INVESTMENT_RATE_MAX,
  INVESTMENT_RATE_MIN,
} from '../useWhatIfAnalysis'

interface WhatIfPanelProps {
  baseline: SavingsGoalResult
  contributionDelta: number
  setContributionDelta: (value: number) => void
  investmentRate: number
  setInvestmentRate: (value: number) => void
  baseContribution: number
  baseInvestmentRate: number
  scenarioResult: SavingsGoalResult | null
  loading: boolean
  error: string | null
  hasChanges: boolean
  reset: () => void
  disabled?: boolean
}

function formatContributionDelta(delta: number): string {
  if (delta === 0) {
    return 'No change'
  }

  const prefix = delta > 0 ? '+' : '−'
  return `${prefix}${formatCurrency(Math.abs(delta), true)}`
}

function formatDeltaTone(
  baseline: SavingsGoalResult,
  scenario: SavingsGoalResult | null,
): 'positive' | 'negative' | 'neutral' | null {
  if (!scenario) {
    return null
  }

  if (scenario.isGoalMet && !baseline.isGoalMet) {
    return 'positive'
  }

  if (!scenario.isReachable && baseline.isReachable) {
    return 'negative'
  }

  const delta = formatMonthsDelta(baseline.estimatedMonthsToGoal, scenario.estimatedMonthsToGoal)
  if (!delta) {
    return 'neutral'
  }

  return delta.includes('sooner') ? 'positive' : 'negative'
}

function renderDeltaMessage(
  baseline: SavingsGoalResult,
  scenario: SavingsGoalResult | null,
): string | null {
  if (baseline.isGoalMet) {
    return 'Goal already reached — adjust assumptions to explore other scenarios.'
  }

  if (!scenario) {
    return null
  }

  if (scenario.isGoalMet) {
    return 'This scenario reaches your goal immediately.'
  }

  if (!scenario.isReachable) {
    return 'Not reachable with these assumptions within 100 years.'
  }

  return formatMonthsDelta(baseline.estimatedMonthsToGoal, scenario.estimatedMonthsToGoal)
}

export function WhatIfPanel({
  baseline,
  contributionDelta,
  setContributionDelta,
  investmentRate,
  setInvestmentRate,
  baseContribution,
  baseInvestmentRate,
  scenarioResult,
  loading,
  error,
  hasChanges,
  reset,
  disabled = false,
}: WhatIfPanelProps) {
  const deltaMessage = renderDeltaMessage(baseline, scenarioResult)
  const deltaTone = formatDeltaTone(baseline, scenarioResult)

  return (
    <section className="what-if-panel" aria-labelledby="what-if-title">
      <header className="what-if-panel__header">
        <div>
          <h2 id="what-if-title" className="what-if-panel__title">
            What-if analysis
          </h2>
          <p className="what-if-panel__description">
            Explore how changing contributions or returns affects your timeline.
          </p>
        </div>
        {hasChanges && (
          <button type="button" className="what-if-panel__reset" onClick={reset}>
            Reset
          </button>
        )}
      </header>

      {disabled && (
        <p className="what-if-panel__disabled-hint">
          Recalculate on the calculator step to explore what-if scenarios with your current
          finances.
        </p>
      )}

      <div className="what-if-panel__sliders">
        <div className="what-if-slider">
          <div className="what-if-slider__label-row">
            <label htmlFor="contribution-delta">Extra monthly savings</label>
            <span className="what-if-slider__value">{formatContributionDelta(contributionDelta)}</span>
          </div>
          <input
            id="contribution-delta"
            type="range"
            min={CONTRIBUTION_DELTA_MIN}
            max={CONTRIBUTION_DELTA_MAX}
            step={50}
            value={contributionDelta}
            disabled={disabled}
            onChange={(event) => setContributionDelta(Number(event.target.value))}
            aria-valuetext={`${formatContributionDelta(contributionDelta)} per month on top of ${formatCurrency(baseContribution, true)}`}
          />
          <p className="what-if-slider__hint">
            Baseline: {formatCurrency(baseContribution, true)}/mo →{' '}
            {formatCurrency(baseContribution + contributionDelta, true)}/mo
          </p>
        </div>

        <div className="what-if-slider">
          <div className="what-if-slider__label-row">
            <label htmlFor="investment-rate">Investment return</label>
            <span className="what-if-slider__value">{investmentRate.toFixed(1)}%</span>
          </div>
          <input
            id="investment-rate"
            type="range"
            min={INVESTMENT_RATE_MIN}
            max={INVESTMENT_RATE_MAX}
            step={0.5}
            value={investmentRate}
            disabled={disabled}
            onChange={(event) => setInvestmentRate(Number(event.target.value))}
            aria-valuetext={`${investmentRate.toFixed(1)} percent annual return`}
          />
          <p className="what-if-slider__hint">
            Baseline: {baseInvestmentRate.toFixed(1)}% annual, compounded monthly
          </p>
        </div>
      </div>

      {(loading || deltaMessage || error) && (
        <div className="what-if-panel__status" aria-live="polite">
          {loading && <p className="what-if-panel__loading">Updating scenario…</p>}
          {error && <p className="what-if-panel__error">{error}</p>}
          {!loading && !error && deltaMessage && hasChanges && (
            <p
              className={`what-if-delta${
                deltaTone ? ` what-if-delta--${deltaTone}` : ''
              }`}
            >
              {deltaMessage}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
