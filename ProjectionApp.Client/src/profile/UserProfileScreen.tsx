import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CurrencyField } from '../components/CurrencyField'
import { PageHeader } from '../components/PageHeader'
import { PercentField } from '../components/PercentField'
import { Skeleton } from '../components/Skeleton'
import { useProfile } from '../context/ProfileContext'
import { formatCurrency } from '../format/currency'
import { formatPercent } from '../format/percent'
import {
  hasAnyBalance,
  monthlyCashFlow,
  totalPosition,
  type ProfileFormState,
} from './userProfile'

type ProfileField = keyof ProfileFormState

export function UserProfileScreen() {
  const {
    profile,
    loading,
    saving,
    error,
    savedToServer,
    updateField,
    retryLoad,
    retrySave,
  } = useProfile()
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ProfileField, string>>>({})

  function setFieldError(field: ProfileField, message: string | null) {
    setFieldErrors((current) => {
      const next = { ...current }
      if (message) {
        next[field] = message
      } else {
        delete next[field]
      }
      return next
    })
  }

  const monthly = monthlyCashFlow(profile.annualSalary)
  const position = totalPosition(profile)
  const canContinue = savedToServer && hasAnyBalance(profile) && !saving
  const hasFieldErrors = Object.keys(fieldErrors).length > 0

  return (
    <div className="profile">
      <PageHeader
        phase="Step 1"
        title="Your finances"
        subtitle="Enter your current balances, interest rates, and contributions. These inputs drive every projection you run."
      />

      {loading && (
        <div className="profile__layout" aria-busy="true" aria-label="Loading profile">
          <aside className="profile-summary">
            <Skeleton className="skeleton--title" />
            <Skeleton lines={5} />
          </aside>
          <section className="profile-form">
            <Skeleton lines={6} />
          </section>
        </div>
      )}

      {error && (
        <div className="app__error" role="alert">
          <strong>Something went wrong</strong>
          <p>{error}</p>
          <p className="app__hint">Make sure the API is running on http://localhost:5171.</p>
          <button type="button" className="app__retry" onClick={() => (saving ? retrySave() : retryLoad())}>
            Try again
          </button>
        </div>
      )}

      {!loading && (
        <>
          <div className="profile__layout">
            <aside className="profile-summary" aria-label="Current position summary">
              <p className="profile-summary__eyebrow">Current position</p>
              <dl className="profile-summary__metrics">
                <div>
                  <dt>Monthly cash flow</dt>
                  <dd className="profile-summary__value profile-summary__value--money">
                    {formatCurrency(monthly, true)}
                  </dd>
                </div>
                <div>
                  <dt>Investments</dt>
                  <dd className="profile-summary__value">
                    {formatCurrency(profile.currentInvestments)}
                  </dd>
                </div>
                <div>
                  <dt>Cash savings</dt>
                  <dd className="profile-summary__value">
                    {formatCurrency(profile.currentCashSavings)}
                  </dd>
                </div>
                <div>
                  <dt>Monthly investment contributions</dt>
                  <dd className="profile-summary__value profile-summary__value--money">
                    {formatCurrency(profile.monthlyInvestmentContributions, true)}
                  </dd>
                </div>
                <div>
                  <dt>Investment interest rate</dt>
                  <dd className="profile-summary__value">
                    {formatPercent(profile.investmentInterestRate)}
                  </dd>
                </div>
                <div>
                  <dt>Savings interest rate</dt>
                  <dd className="profile-summary__value">
                    {formatPercent(profile.savingsInterestRate)}
                  </dd>
                </div>
                <div className="profile-summary__total">
                  <dt>Total position</dt>
                  <dd className="profile-summary__value profile-summary__value--money">
                    {formatCurrency(position)}
                  </dd>
                </div>
              </dl>
            </aside>

            <section className="profile-form" aria-label="User profile inputs">
              <CurrencyField
                id="annualSalary"
                label="Annual salary"
                hint="Gross annual income before tax."
                value={profile.annualSalary}
                disabled={saving}
                error={fieldErrors.annualSalary}
                onChange={(value) => updateField('annualSalary', value)}
                onError={(message) => setFieldError('annualSalary', message)}
              />

              <div className="profile-field profile-field--derived">
                <span className="profile-field__label">Monthly cash flow</span>
                <p className="profile-field__derived-value">{formatCurrency(monthly, true)}</p>
                <p className="profile-field__hint">Calculated from annual salary divided by 12.</p>
              </div>

              <CurrencyField
                id="currentInvestments"
                label="Current investments"
                hint="Total balance across investment accounts."
                value={profile.currentInvestments}
                disabled={saving}
                error={fieldErrors.currentInvestments}
                onChange={(value) => updateField('currentInvestments', value)}
                onError={(message) => setFieldError('currentInvestments', message)}
              />

              <PercentField
                id="investmentInterestRate"
                label="Investment interest rate"
                hint="Annual rate, compounded monthly on the investment balance. Enter 0 to 100."
                value={profile.investmentInterestRate}
                disabled={saving}
                error={fieldErrors.investmentInterestRate}
                onChange={(value) => updateField('investmentInterestRate', value)}
                onError={(message) => setFieldError('investmentInterestRate', message)}
              />

              <CurrencyField
                id="monthlyInvestmentContributions"
                label="Monthly investment contributions"
                hint="Optional amount added to investments each month."
                value={profile.monthlyInvestmentContributions}
                disabled={saving}
                error={fieldErrors.monthlyInvestmentContributions}
                onChange={(value) => updateField('monthlyInvestmentContributions', value)}
                onError={(message) => setFieldError('monthlyInvestmentContributions', message)}
              />

              <CurrencyField
                id="currentCashSavings"
                label="Current cash savings"
                hint="Cash in checking, savings, and similar accounts."
                value={profile.currentCashSavings}
                disabled={saving}
                error={fieldErrors.currentCashSavings}
                onChange={(value) => updateField('currentCashSavings', value)}
                onError={(message) => setFieldError('currentCashSavings', message)}
              />

              <PercentField
                id="savingsInterestRate"
                label="Savings interest rate"
                hint="Annual rate, compounded monthly on cash savings. Enter 0 to 100."
                value={profile.savingsInterestRate}
                disabled={saving}
                error={fieldErrors.savingsInterestRate}
                onChange={(value) => updateField('savingsInterestRate', value)}
                onError={(message) => setFieldError('savingsInterestRate', message)}
              />
            </section>
          </div>

          <footer className="profile__footer">
            <div
              className="profile__save-status-wrap"
              aria-live="polite"
              aria-atomic="true"
            >
              {saving && <p className="profile__save-status">Saving…</p>}
              {!saving && savedToServer && hasAnyBalance(profile) && (
                <p className="profile__save-status profile__save-status--saved">Profile saved</p>
              )}
            </div>
            <Link
              to="/calculator"
              className={`profile__continue${canContinue && !hasFieldErrors ? '' : ' profile__continue--disabled'}`}
              aria-disabled={!canContinue || hasFieldErrors}
              onClick={(event) => {
                if (!canContinue || hasFieldErrors) {
                  event.preventDefault()
                }
              }}
            >
              Open calculator
            </Link>
          </footer>
        </>
      )}
    </div>
  )
}
