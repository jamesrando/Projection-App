import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProfile } from '@/features/profile/useProfile'
import { currencySymbol, formatCurrency } from '@/shared/lib/format/currency'
import { CurrencyField } from '@/shared/ui/CurrencyField'
import { PageHeader } from '@/shared/ui/PageHeader'
import { StaleAnalysisBanner } from './components/StaleAnalysisBanner'
import { useGoal } from './useGoal'
import { useAnalysisFreshness } from './useAnalysisFreshness'

export function GoalScreen() {
  const navigate = useNavigate()
  const {
    isProfileCompleteForGoals,
    loading: profileLoading,
    saving,
    savePending,
    savedToServer,
  } = useProfile()
  const { targetAmount, setTargetAmount, loading, error, analyze } = useGoal()
  const { isStale, hasBaseline } = useAnalysisFreshness()
  const [targetError, setTargetError] = useState<string | null>(null)
  const [draftTarget, setDraftTarget] = useState<number | null>(targetAmount)

  useEffect(() => {
    setDraftTarget(targetAmount)
  }, [targetAmount])

  const profileBusy = saving || savePending

  const profileReadyForGoals =
    savedToServer && isProfileCompleteForGoals && !profileBusy

  const canCalculate =
    profileReadyForGoals &&
    !profileLoading &&
    draftTarget !== null &&
    draftTarget > 0 &&
    !targetError

  async function handleCalculate() {
    if (!canCalculate) {
      return
    }

    setTargetAmount(draftTarget!)
    const succeeded = await analyze(draftTarget!)
    if (succeeded) {
      navigate('/results')
    }
  }

  return (
    <div className="goal">
      <PageHeader
        phase="Step 2 of 3"
        title="Savings goal calculator"
        subtitle="Set your target amount, then calculate to see how long it takes to get there."
      />

      {hasBaseline && isStale && <StaleAnalysisBanner className="goal__stale-banner" />}

      <section className="goal-target-form" aria-label="Goal target">
        <CurrencyField
          id="targetAmount"
          label="Goal target"
          hint="The total position you want to reach."
          value={draftTarget}
          disabled={loading}
          error={targetError}
          onChange={(value) => {
            if (value !== null && value > 0) {
              setDraftTarget(value)
            }
          }}
          onError={setTargetError}
        />
      </section>

      {error && (
        <div className="app__error goal__error" role="alert">
          <strong>Unable to analyze goal</strong>
          <p>{error}</p>
          <button type="button" className="app__retry" onClick={() => void handleCalculate()}>
            Try again
          </button>
        </div>
      )}

      {!profileReadyForGoals && !profileLoading && (
        <section className="goal-empty" aria-label="Finances required">
          <div className="goal-empty__icon" aria-hidden="true">
            {currencySymbol}
          </div>
          <h2 className="goal-empty__title">Enter your finances first</h2>
          <p className="goal-empty__text">
            Complete step 1 before running a calculation.
          </p>
          <Link to="/finances" className="hero__cta hero__cta--primary goal-empty__cta">
            Back to your finances
          </Link>
        </section>
      )}

      {profileReadyForGoals && !error && !loading && (
        <section className="goal-empty" aria-label="Calculator prompt">
          <div className="goal-empty__icon" aria-hidden="true">
            {currencySymbol}
          </div>
          <h2 className="goal-empty__title">Ready to calculate</h2>
          <p className="goal-empty__text">
            We will use your saved finances to estimate progress toward{' '}
            {formatCurrency(draftTarget ?? targetAmount)} and take you to your results.
          </p>
        </section>
      )}

      {profileReadyForGoals && loading && (
        <p className="app__status goal__loading" aria-live="polite">
          Calculating your timeline…
        </p>
      )}

      <footer className="flow-footer">
        <Link to="/finances" className="flow-footer__back">
          ← Edit finances
        </Link>
        <button
          type="button"
          className={`goal-card__action goal__analyze${loading ? ' goal-card__action--loading' : ''}`}
          disabled={!canCalculate || loading}
          onClick={() => void handleCalculate()}
        >
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Calculating…
            </>
          ) : profileBusy ? (
            'Saving finances…'
          ) : (
            'Calculate and view results'
          )}
        </button>
      </footer>
    </div>
  )
}
