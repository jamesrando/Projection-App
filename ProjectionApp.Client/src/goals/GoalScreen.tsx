import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CurrencyField } from '../components/CurrencyField'
import { PageHeader } from '../components/PageHeader'
import { useGoal } from '../context/GoalContext'
import { useProfile } from '../context/ProfileContext'
import { currencySymbol, formatCurrency } from '../format/currency'

export function GoalScreen() {
  const navigate = useNavigate()
  const { profileVersion, hasBalance, loading: profileLoading } = useProfile()
  const { targetAmount, setTargetAmount, loading, error, analyze } = useGoal()
  const [targetError, setTargetError] = useState<string | null>(null)
  const [draftTarget, setDraftTarget] = useState<number | null>(targetAmount)

  useEffect(() => {
    setDraftTarget(targetAmount)
  }, [targetAmount])

  const canCalculate =
    hasBalance &&
    !profileLoading &&
    draftTarget !== null &&
    draftTarget > 0 &&
    !targetError

  async function handleCalculate() {
    if (!canCalculate) {
      return
    }

    setTargetAmount(draftTarget!)
    const succeeded = await analyze(profileVersion, draftTarget!)
    if (succeeded) {
      navigate('/projections')
    }
  }

  return (
    <div className="goal">
      <PageHeader
        phase="Step 2 of 3"
        title="Projection calculator"
        subtitle="Set your target amount, then calculate to see how long it takes to get there."
      />

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

      {!hasBalance && !profileLoading && (
        <section className="goal-empty" aria-label="Finances required">
          <div className="goal-empty__icon" aria-hidden="true">
            {currencySymbol}
          </div>
          <h2 className="goal-empty__title">Enter your finances first</h2>
          <p className="goal-empty__text">
            Complete step 1 before running a projection.
          </p>
          <Link to="/finances" className="hero__cta hero__cta--primary goal-empty__cta">
            Back to your finances
          </Link>
        </section>
      )}

      {hasBalance && !error && !loading && (
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

      {hasBalance && loading && (
        <p className="app__status goal__loading" aria-live="polite">
          Calculating your projection…
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
          ) : (
            'Calculate and view results'
          )}
        </button>
      </footer>
    </div>
  )
}
