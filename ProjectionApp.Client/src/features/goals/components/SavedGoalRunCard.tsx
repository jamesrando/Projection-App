import { useState } from 'react'
import { formatCurrency } from '@/shared/lib/format/currency'
import type { SavedGoalRun } from '../types'

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

export function SavedGoalRunCard({
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
