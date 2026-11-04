import { Link } from 'react-router-dom'
import { PageHeader } from '@/shared/ui/PageHeader'
import { GoalResults } from './components/GoalResults'
import { SavedGoalRunCard } from './components/SavedGoalRunCard'
import { StaleAnalysisBanner } from './components/StaleAnalysisBanner'
import { WhatIfPanel } from './components/WhatIfPanel'
import { useGoal } from './useGoal'
import { useAnalysisFreshness } from './useAnalysisFreshness'
import { useSavedGoalRuns } from './useSavedGoalRuns'
import { useWhatIfAnalysis } from './useWhatIfAnalysis'

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
        <Link to="/finances" className="profile__continue">
          Run another calculation
        </Link>
      </footer>
    </div>
  )
}
