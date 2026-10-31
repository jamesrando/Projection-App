import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CurrencyField } from '@/shared/ui/CurrencyField'
import { InvestmentsSavingsSplit } from '@/shared/ui/InvestmentsSavingsSplit'
import { PageHeader } from '@/shared/ui/PageHeader'
import { PercentField } from '@/shared/ui/PercentField'
import { Skeleton } from '@/shared/ui/Skeleton'
import { formatCurrency } from '@/shared/lib/format/currency'
import { formatPercent } from '@/shared/lib/format/percent'
import { sharePercentOfTotal } from '@/shared/lib/format/share'
import { useProfile } from './useProfile'
import { totalPosition, type ProfileFormState } from './model'

type ProfileField = keyof ProfileFormState

interface ProfileSectionProps {
  title: string
  description: string
  children: ReactNode
}

function ProfileSection({ title, description, children }: ProfileSectionProps) {
  return (
    <section className="profile-section">
      <header className="profile-section__header">
        <h2 className="profile-section__title">{title}</h2>
        <p className="profile-section__description">{description}</p>
      </header>
      <div className="profile-section__fields">{children}</div>
    </section>
  )
}

export function UserProfileScreen() {
  const navigate = useNavigate()
  const {
    profile,
    loading,
    saving,
    savePending,
    error,
    savedToServer,
    isProfileCompleteForGoals,
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

  const position = totalPosition(profile) ?? 0
  const investments = profile.currentInvestments ?? 0
  const savings = profile.currentCashSavings ?? 0
  const investmentsShare = sharePercentOfTotal(investments, position)
  const savingsShare = sharePercentOfTotal(savings, position)
  const profileSynced = savedToServer && !saving && !savePending
  const canContinue = profileSynced && isProfileCompleteForGoals
  const hasFieldErrors = Object.keys(fieldErrors).length > 0

  return (
    <div className="profile">
      <PageHeader
        phase="Step 1 of 3"
        title="Your finances"
        subtitle="Enter your current balances, interest rates, and contributions. These inputs drive every goal calculation you run."
      />

      {loading && (
        <div className="profile__layout" aria-busy="true" aria-label="Loading profile">
          <aside className="profile-summary">
            <Skeleton className="skeleton--title" />
            <Skeleton lines={4} />
          </aside>
          <div className="profile-form-stack">
            <section className="profile-section">
              <Skeleton lines={4} />
            </section>
            <section className="profile-section">
              <Skeleton lines={3} />
            </section>
          </div>
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
            <aside className="profile-summary profile-summary--sticky" aria-label="Current position summary">
              <div className="profile-summary__hero">
                <p className="profile-summary__eyebrow">Total position</p>
                <p className="profile-summary__total-value">{formatCurrency(position || null)}</p>
                <p className="profile-summary__hero-hint">
                  {position > 0
                    ? 'Live summary as you update your balances below.'
                    : 'Add at least one balance to continue.'}
                </p>
              </div>

              {position > 0 && (
                <InvestmentsSavingsSplit
                  className="profile-summary__split"
                  investments={investments}
                  savings={savings}
                  investmentsShare={investmentsShare}
                  savingsShare={savingsShare}
                />
              )}

              <dl className="profile-summary__tiles">
                <div className="profile-summary__tile">
                  <dt>Monthly contributions</dt>
                  <dd>{formatCurrency(profile.monthlyInvestmentContributions, true)}</dd>
                </div>
                <div className="profile-summary__tile">
                  <dt>Investment rate</dt>
                  <dd>{formatPercent(profile.investmentInterestRate)}</dd>
                </div>
                <div className="profile-summary__tile">
                  <dt>Savings rate</dt>
                  <dd>{formatPercent(profile.savingsInterestRate)}</dd>
                </div>
              </dl>
            </aside>

            <div className="profile-form-stack">
              <ProfileSection
                title="Investments"
                description="Long-term accounts such as ISAs, pensions, and brokerage holdings."
              >
                <CurrencyField
                  id="currentInvestments"
                  label="Current balance"
                  hint="Total balance across investment accounts."
                  value={profile.currentInvestments}
                  disabled={saving}
                  error={fieldErrors.currentInvestments}
                  onChange={(value) => updateField('currentInvestments', value)}
                  onError={(message) => setFieldError('currentInvestments', message)}
                />

                <div className="profile-section__row">
                  <PercentField
                    id="investmentInterestRate"
                    label="Annual interest rate"
                    hint="Compounded monthly. Enter 0 to 100."
                    value={profile.investmentInterestRate}
                    disabled={saving}
                    error={fieldErrors.investmentInterestRate}
                    onChange={(value) => updateField('investmentInterestRate', value)}
                    onError={(message) => setFieldError('investmentInterestRate', message)}
                  />

                  <CurrencyField
                    id="monthlyInvestmentContributions"
                    label="Monthly contributions"
                    hint="Optional. Added to investments each month."
                    value={profile.monthlyInvestmentContributions}
                    disabled={saving}
                    error={fieldErrors.monthlyInvestmentContributions}
                    onChange={(value) => updateField('monthlyInvestmentContributions', value)}
                    onError={(message) => setFieldError('monthlyInvestmentContributions', message)}
                  />
                </div>
              </ProfileSection>

              <ProfileSection
                title="Cash savings"
                description="Accessible cash in checking, savings, and similar accounts."
              >
                <CurrencyField
                  id="currentCashSavings"
                  label="Current balance"
                  hint="Cash in checking, savings, and similar accounts."
                  value={profile.currentCashSavings}
                  disabled={saving}
                  error={fieldErrors.currentCashSavings}
                  onChange={(value) => updateField('currentCashSavings', value)}
                  onError={(message) => setFieldError('currentCashSavings', message)}
                />

                <PercentField
                  id="savingsInterestRate"
                  label="Annual interest rate"
                  hint="Compounded monthly. Enter 0 to 100."
                  value={profile.savingsInterestRate}
                  disabled={saving}
                  error={fieldErrors.savingsInterestRate}
                  onChange={(value) => updateField('savingsInterestRate', value)}
                  onError={(message) => setFieldError('savingsInterestRate', message)}
                />
              </ProfileSection>
            </div>
          </div>

          <footer className="profile__footer">
            <div
              className="profile__save-status-wrap"
              aria-live="polite"
              aria-atomic="true"
            >
              {(saving || savePending) && <p className="profile__save-status">Saving…</p>}
              {!saving && !savePending && savedToServer && isProfileCompleteForGoals && (
                <p className="profile__save-status profile__save-status--saved">Profile saved</p>
              )}
              {!saving && !savePending && savedToServer && !isProfileCompleteForGoals && (
                <p className="profile__save-status">
                  Enter salary, investments, or cash savings to continue
                </p>
              )}
            </div>
            <div className="profile__footer-actions">
              <button
                type="button"
                className="profile__continue"
                disabled={!canContinue || hasFieldErrors}
                onClick={() => {
                  if (canContinue && !hasFieldErrors) {
                    navigate('/calculator')
                  }
                }}
              >
                Continue to calculator
              </button>
            </div>
          </footer>
        </>
      )}
    </div>
  )
}
