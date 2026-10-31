import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProfile } from '@/features/profile/useProfile'
import { currencySymbol } from '@/shared/lib/format/currency'
import { CurrencyField } from '@/shared/ui/CurrencyField'
import { PageHeader } from '@/shared/ui/PageHeader'
import { calculateTakeHome } from './api'
import { TakeHomeResults } from './components/TakeHomeResults'

export function TakeHomeScreen() {
  const { profile, loading: profileLoading } = useProfile()
  const [draftSalary, setDraftSalary] = useState<number | null>(null)
  const [salaryError, setSalaryError] = useState<string | null>(null)
  const [prefilledFromProfile, setPrefilledFromProfile] = useState(false)
  const calculate = useMutation({
    mutationFn: calculateTakeHome,
  })

  useEffect(() => {
    if (draftSalary === null && profile.annualSalary !== null && profile.annualSalary > 0) {
      setDraftSalary(profile.annualSalary)
      setPrefilledFromProfile(true)
    }
  }, [draftSalary, profile.annualSalary])

  const canCalculate = draftSalary !== null && draftSalary > 0 && !salaryError
  const loading = calculate.isPending
  const result = calculate.isError ? null : calculate.data ?? null
  const error =
    calculate.error instanceof Error
      ? calculate.error.message
      : calculate.error
        ? 'Something went wrong'
        : null

  function handleCalculate() {
    if (!canCalculate) {
      return
    }

    calculate.mutate(draftSalary)
  }

  function handleSalaryChange(value: number | null) {
    setDraftSalary(value)
    setPrefilledFromProfile(
      value !== null && profile.annualSalary !== null && value === profile.annualSalary,
    )
  }

  const salaryHint =
    prefilledFromProfile && profile.annualSalary !== null
      ? 'Pre-filled from your profile. You can override it here.'
      : 'Your gross annual salary before tax and deductions.'

  return (
    <div className="goal">
      <PageHeader
        phase="Tool"
        title="Take-home pay"
        subtitle="Enter your gross annual salary to estimate net income after UK tax and National Insurance, plus a recommended 50/30/20 budget split."
        actions={
          <button
            type="button"
            className={`goal-card__action goal__analyze${loading ? ' goal-card__action--loading' : ''}`}
            disabled={loading || !canCalculate || profileLoading}
            onClick={() => void handleCalculate()}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Calculating…
              </>
            ) : result ? (
              'Recalculate'
            ) : (
              'Calculate'
            )}
          </button>
        }
      />

      <section className="goal-target-form" aria-label="Salary input">
        <CurrencyField
          id="annualGrossSalary"
          label="Annual gross salary"
          hint={salaryHint}
          value={draftSalary}
          disabled={loading}
          error={salaryError}
          onChange={handleSalaryChange}
          onError={setSalaryError}
        />
        {!profileLoading && profile.annualSalary === null && (
          <p className="app__hint salary-profile-hint">
            No salary saved in your profile yet.{' '}
            <Link to="/finances" className="app__banner-link">
              Add it on the finances page
            </Link>{' '}
            to pre-fill next time.
          </p>
        )}
      </section>

      {error && (
        <div className="app__error goal__error" role="alert">
          <strong>Unable to calculate take-home pay</strong>
          <p>{error}</p>
          <button type="button" className="app__retry" onClick={() => void handleCalculate()}>
            Try again
          </button>
        </div>
      )}

      {!error && !result && !loading && (
        <section className="goal-empty" aria-label="Calculator prompt">
          <div className="goal-empty__icon" aria-hidden="true">
            {currencySymbol}
          </div>
          <h2 className="goal-empty__title">Ready to calculate</h2>
          <p className="goal-empty__text">
            Enter your gross salary and hit calculate to see your estimated take-home pay and a
            recommended monthly budget split.
          </p>
        </section>
      )}

      {loading && !result && (
        <p className="app__status goal__loading" aria-live="polite">
          Calculating your take-home pay…
        </p>
      )}

      {result && (
        <div className={loading ? 'goal-results-stack goal-results-stack--loading' : 'goal-results-stack'}>
          {loading && (
            <p className="app__status goal__loading" aria-live="polite">
              Recalculating…
            </p>
          )}
          <TakeHomeResults result={result} />
        </div>
      )}

      <footer className="flow-footer">
        <Link to="/finances" className="flow-footer__back">
          ← Back to your finances
        </Link>
      </footer>
    </div>
  )
}
