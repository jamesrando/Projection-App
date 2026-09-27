import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useGoal } from '../context/GoalContext'
import { GoalResults } from '../goals/GoalResults'
import { WhatIfPanel } from '../goals/WhatIfPanel'
import { useWhatIfAnalysis } from '../goals/useWhatIfAnalysis'
import { formatCurrency } from '../format/currency'
import { useSavedProjections } from '../hooks/useSavedProjections'
import type { SavedProjection } from '../types/savedProjection'

function formatSavedAt(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function formatTimeline(projection: SavedProjection): string {
  const { result } = projection

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

function SavedProjectionCard({
  projection,
  onRemove,
}: {
  projection: SavedProjection
  onRemove: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const { result } = projection

  return (
    <article className="saved-projection">
      <header className="saved-projection__header">
        <div>
          <h2 className="saved-projection__title">
            {formatCurrency(result.targetAmount)} target
          </h2>
          <p className="saved-projection__meta">{formatSavedAt(projection.savedAt)}</p>
        </div>
        <div className="saved-projection__actions">
          <button
            type="button"
            className="saved-projection__toggle"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'Hide details' : 'Show details'}
          </button>
          <button
            type="button"
            className="saved-projection__remove"
            aria-label="Remove saved projection"
            onClick={() => onRemove(projection.id)}
          >
            Remove
          </button>
        </div>
      </header>

      <dl className="saved-projection__summary">
        <div>
          <dt>Progress</dt>
          <dd className="saved-projection__value saved-projection__value--accent">
            {result.progressPercent.toFixed(1)}%
          </dd>
        </div>
        <div>
          <dt>Current position</dt>
          <dd className="saved-projection__value">{formatCurrency(result.currentPosition)}</dd>
        </div>
        <div>
          <dt>Timeline</dt>
          <dd className="saved-projection__value">{formatTimeline(projection)}</dd>
        </div>
        <div>
          <dt>Gap remaining</dt>
          <dd className="saved-projection__value">{formatCurrency(result.remainingAmount)}</dd>
        </div>
      </dl>

      {expanded && (
        <div className="saved-projection__details">
          <dl className="saved-projection__detail-grid">
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

export function ProjectionsScreen() {
  const { result } = useGoal()
  const { projections, remove, clear } = useSavedProjections()
  const baselineResult = result ?? projections[0]?.result ?? null
  const whatIf = useWhatIfAnalysis(baselineResult)
  const previousProjections = projections.slice(1)

  return (
    <div className="projections">
      <PageHeader
        phase="Step 3 of 3"
        title="Your results"
        subtitle="Review your projection breakdown and compare scenarios saved during this session."
        actions={
          projections.length > 1 ? (
            <button type="button" className="goal-card__action" onClick={clear}>
              Clear history
            </button>
          ) : undefined
        }
      />

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
            />
          }
        />
      )}

      {previousProjections.length > 0 && (
        <section className="projections-history" aria-labelledby="history-title">
          <h2 id="history-title" className="projections-history__title">
            Previous scenarios
          </h2>
          <div className="saved-projections-list">
            {previousProjections.map((projection) => (
              <SavedProjectionCard key={projection.id} projection={projection} onRemove={remove} />
            ))}
          </div>
        </section>
      )}

      <footer className="flow-footer">
        <Link to="/finances" className="flow-footer__back">
          ← Edit finances
        </Link>
        <Link to="/calculator" className="profile__continue">
          Run another projection
        </Link>
      </footer>
    </div>
  )
}
