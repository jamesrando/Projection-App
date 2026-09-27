import { formatCurrency } from '../format/currency'
import type { Reach100kGoalResult } from '../types/goal'
import {
  CONTRIBUTION_DELTA_MAX,
  CONTRIBUTION_DELTA_MIN,
  formatMonthsDelta,
  INVESTMENT_RATE_MAX,
  INVESTMENT_RATE_MIN,
} from './useWhatIfAnalysis'

interface WhatIfPanelProps {
  baseline: Reach100kGoalResult
  contributionDelta: number
  setContributionDelta: (value: number) => void
  investmentRate: number
  setInvestmentRate: (value: number) => void
  baseContribution: number
  baseInvestmentRate: number
  scenarioResult: Reach100kGoalResult | null
  loading: boolean
  error: string | null
  hasChanges: boolean
  reset: () => void
}

function formatContributionDelta(delta: number): string {
  if (delta === 0) {
    return 'No change'
  }

  const prefix = delta > 0 ? '+' : '−'
  return `${prefix}${formatCurrency(Math.abs(delta), true)}`
}

function formatDeltaTone(
  baseline: Reach100kGoalResult,
  scenario: Reach100kGoalResult | null,
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
  baseline: Reach100kGoalResult,
  scenario: Reach100kGoalResult | null,
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
          {loading && <p className="what-if-panel__loading">Updating projection…</p>}
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
