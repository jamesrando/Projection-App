import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StaleAnalysisBanner } from '../components/StaleAnalysisBanner'
import { useGoal } from '../context/GoalContext'
import { useAnalysisFreshness } from '../hooks/useAnalysisFreshness'
import { GoalResults } from '../goals/GoalResults'
import { WhatIfPanel } from '../goals/WhatIfPanel'
import { useWhatIfAnalysis } from '../goals/useWhatIfAnalysis'
import { formatCurrency } from '../format/currency'
import { useSavedGoalRuns } from '../hooks/useSavedGoalRuns'
import type { SavedGoalRun } from '../types/savedGoalRun'

function formatSavedAt(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function formatTimeline(run: SavedGoalRun): string {
  const { result } = run

  if (result.isGoalMet) {
    return 'Goal already reached'
  }

  if (!result.isReachable) {
    return 'Not reachable with current assumptions'
  }

  if (result.estimatedYearsToGoal !== null) {
    const years = result.estimatedYearsToGoal
    const text = years.toFixed(1).replace(/\.0$/, '')
    return `~${text} ${years === 1 ? 'year' : 'years'}`
  }

  return 'Timeline unavailable'
}

function SavedGoalRunCard({
  run,
  onRemove,
}: {
  run: SavedGoalRun
  onRemove: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const { result } = run

  return (
    <article className="saved-goal-run">
      <header className="saved-goal-run__header">
        <div>
          <h2 className="saved-goal-run__title">
            {formatCurrency(result.targetAmount)} target
          </h2>
          <p className="saved-goal-run__meta">{formatSavedAt(run.savedAt)}</p>
        </div>
        <div className="saved-goal-run__actions">
          <button
            type="button"
            className="saved-goal-run__toggle"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Hide details' : 'Show details'}
          </button>
          <button
            type="button"
            className="saved-goal-run__remove"
            aria-label="Remove saved scenario"
            onClick={() => onRemove(run.id)}
          >
            Remove
          </button>
        </div>
      </header>

      <dl className="saved-goal-run__summary">
        <div>
          <dt>Progress</dt>
          <dd className="saved-goal-run__value saved-goal-run__value--accent">
            {result.progressPercent.toFixed(1)}%
          </dd>
        </div>
        <div>
          <dt>Current position</dt>
          <dd className="saved-goal-run__value">{formatCurrency(result.currentPosition)}</dd>
        </div>
        <div>
          <dt>Timeline</dt>
          <dd className="saved-goal-run__value">{formatTimeline(run)}</dd>
        </div>
        <div>
          <dt>Gap remaining</dt>
          <dd className="saved-goal-run__value">{formatCurrency(result.remainingAmount)}</dd>
        </div>
      </dl>

      {expanded && (
        <div className="saved-goal-run__details">
          <dl className="saved-goal-run__detail-grid">
            <div>
              <dt>Monthly contributions</dt>
              <dd>{formatCurrency(result.effectiveMonthlyContributions, true)}</dd>
            </div>
            <div>
              <dt>Investment rate</dt>
              <dd>
                {result.investmentInterestRate !== null
                  ? `${result.investmentInterestRate}%`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Savings rate</dt>
              <dd>
                {result.savingsInterestRate !== null ? `${result.savingsInterestRate}%` : '—'}
              </dd>
            </div>
            <div>
              <dt>Total interest earned</dt>
              <dd>{formatCurrency(result.breakdown.totalInterestEarned)}</dd>
            </div>
          </dl>
        </div>
      )}
    </article>
  )
}

export function ResultsScreen() {
  const { result } = useGoal()
  const { savedRuns, remove, clear } = useSavedGoalRuns()
  const { isStale } = useAnalysisFreshness()
  const baselineResult = result ?? savedRuns[0]?.result ?? null
  const whatIf = useWhatIfAnalysis(baselineResult, { enabled: !isStale })
  const previousRuns = savedRuns.slice(1)
  const showingSessionFallback = result === null && savedRuns.length > 0

  return (
    <div className="results">
      <PageHeader
        phase="Step 3 of 3"
        title="Your results"
        subtitle="Review your goal breakdown and compare scenarios saved during this session."
        actions={
          savedRuns.length > 1 ? (
            <button type="button" className="goal-card__action" onClick={clear}>
              Clear history
            </button>
          ) : undefined
        }
      />

      {isStale && <StaleAnalysisBanner className="results__stale-banner" />}

      {showingSessionFallback && !isStale && (
        <p className="results__session-note" role="status">
          Showing your latest saved calculation from this session.
        </p>
      )}

      {baselineResult && whatIf.displayResult && (
        <GoalResults
          result={whatIf.displayResult}
          compareBaseline={whatIf.hasChanges ? baselineResult : undefined}
          afterHero={
            <WhatIfPanel
              baseline={baselineResult}
              contributionDelta={whatIf.contributionDelta}
              setContributionDelta={whatIf.setContributionDelta}
              investmentRate={whatIf.investmentRate}
              setInvestmentRate={whatIf.setInvestmentRate}
              baseContribution={whatIf.baseContribution}
              baseInvestmentRate={whatIf.baseInvestmentRate}
              scenarioResult={whatIf.scenarioResult}
              loading={whatIf.loading}
              error={whatIf.error}
              hasChanges={whatIf.hasChanges}
              reset={whatIf.reset}
              disabled={isStale}
            />
          }
        />
      )}

      {previousRuns.length > 0 && (
        <section className="results-history" aria-labelledby="history-title">
          <h2 id="history-title" className="results-history__title">
            Previous scenarios
          </h2>
          <div className="saved-goal-runs-list">
            {previousRuns.map((run) => (
              <SavedGoalRunCard key={run.id} run={run} onRemove={remove} />
            ))}
          </div>
        </section>
      )}

      <footer className="flow-footer">
        <Link to="/finances" className="flow-footer__back">
          ← Edit finances
        </Link>
        <Link to="/calculator" className="profile__continue">
          Run another calculation
        </Link>
      </footer>
    </div>
  )
}
