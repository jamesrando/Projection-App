import { useEffect, useState } from 'react'
import { getProfile, saveProfile } from '../api/profile'
import type { UserProfile } from '../types/profile'
import { currencySymbol, formatCurrency, parseCurrencyInput } from '../format/currency'
import {
  emptyProfileForm,
  hasAnyBalance,
  monthlyCashFlow,
  totalPosition,
  type ProfileFormState,
} from './userProfile'

function toFormState(profile: UserProfile): ProfileFormState {
  return {
    annualSalary: profile.annualSalary,
    currentInvestments: profile.currentInvestments,
    currentCashSavings: profile.currentCashSavings,
    investmentInterestRate: profile.investmentInterestRate,
    savingsInterestRate: profile.savingsInterestRate,
    monthlyInvestmentContributions: profile.monthlyInvestmentContributions,
  }
}

function formatPercent(value: number | null): string {
  if (value === null) {
    return '—'
  }

  const text = value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
  return `${text}%`
}

function parsePercentInput(raw: string): number | null {
  const trimmed = raw.trim().replace(/%$/, '')
  if (trimmed === '') {
    return null
  }

  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    return null
  }

  return parsed
}

type ProfileField = keyof ProfileFormState

interface CurrencyFieldProps {
  id: ProfileField
  label: string
  hint: string
  value: number | null
  disabled?: boolean
  onChange: (field: ProfileField, value: number | null) => void
}

interface PercentFieldProps {
  id: ProfileField
  label: string
  hint: string
  value: number | null
  disabled?: boolean
  onChange: (field: ProfileField, value: number | null) => void
}

function PercentField({ id, label, hint, value, disabled = false, onChange }: PercentFieldProps) {
  const [draft, setDraft] = useState(value === null ? '' : String(value))

  useEffect(() => {
    setDraft(value === null ? '' : String(value))
  }, [value])

  function handleBlur() {
    const parsed = parsePercentInput(draft)
    if (draft.trim() !== '' && parsed === null) {
      setDraft(value === null ? '' : String(value))
      return
    }

    onChange(id, parsed)
    setDraft(parsed === null ? '' : String(parsed))
  }

  return (
    <div className="profile-field">
      <label className="profile-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="profile-field__input-wrap">
        <input
          id={id}
          className="profile-field__input"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          value={draft}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={handleBlur}
        />
        <span className="profile-field__suffix" aria-hidden="true">
          %
        </span>
      </div>
      <p className="profile-field__hint">{hint}</p>
    </div>
  )
}

function CurrencyField({ id, label, hint, value, disabled = false, onChange }: CurrencyFieldProps) {
  const [draft, setDraft] = useState(value === null ? '' : String(value))

  useEffect(() => {
    setDraft(value === null ? '' : String(value))
  }, [value])

  function handleBlur() {
    const parsed = parseCurrencyInput(draft)
    onChange(id, parsed)
    setDraft(parsed === null ? '' : String(parsed))
  }

  return (
    <div className="profile-field">
      <label className="profile-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="profile-field__input-wrap">
        <span className="profile-field__prefix" aria-hidden="true">
          {currencySymbol}
        </span>
        <input
          id={id}
          className="profile-field__input"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          value={draft}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={handleBlur}
        />
      </div>
      <p className="profile-field__hint">{hint}</p>
    </div>
  )
}

interface UserProfileScreenProps {
  onContinue: () => void
}

export function UserProfileScreen({ onContinue }: UserProfileScreenProps) {
  const [profile, setProfile] = useState<ProfileFormState>(() => emptyProfileForm())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedToServer, setSavedToServer] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      try {
        const data = await getProfile()
        if (!cancelled) {
          if (data) {
            setProfile(toFormState(data))
            setSavedToServer(true)
          }
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load profile')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [])

  async function persistProfile(nextProfile: ProfileFormState) {
    setSaving(true)
    setError(null)

    try {
      await saveProfile(nextProfile)
      setSavedToServer(true)
    } catch (err) {
      setSavedToServer(false)
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  function updateField(field: ProfileField, value: number | null) {
    const nextProfile = { ...profile, [field]: value }
    setProfile(nextProfile)
    void persistProfile(nextProfile)
  }

  const monthly = monthlyCashFlow(profile.annualSalary)
  const position = totalPosition(profile)
  const canContinue = savedToServer && hasAnyBalance(profile) && !saving

  return (
    <div className="profile">
      <header className="profile__header">
        <p className="profile__phase">Phase 1 — Capture input</p>
        <h1>Build your profile</h1>
        <p className="profile__subtitle">
          Tell us about your current financial situation so we can build projections from a realistic
          starting point.
        </p>
      </header>

      {loading && <p className="app__status">Loading profile…</p>}

      {error && (
        <div className="app__error" role="alert">
          <strong>Something went wrong</strong>
          <p>{error}</p>
          <p className="app__hint">Make sure the API is running on http://localhost:5171.</p>
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
                  <dd className="profile-summary__value">{formatPercent(profile.investmentInterestRate)}</dd>
                </div>
                <div>
                  <dt>Savings interest rate</dt>
                  <dd className="profile-summary__value">{formatPercent(profile.savingsInterestRate)}</dd>
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
                onChange={updateField}
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
                onChange={updateField}
              />

              <PercentField
                id="investmentInterestRate"
                label="Investment interest rate"
                hint="Annual rate, compounded monthly on the investment balance. Enter 0 to 100."
                value={profile.investmentInterestRate}
                disabled={saving}
                onChange={updateField}
              />

              <CurrencyField
                id="monthlyInvestmentContributions"
                label="Monthly investment contributions"
                hint="Optional amount added to investments each month."
                value={profile.monthlyInvestmentContributions}
                disabled={saving}
                onChange={updateField}
              />

              <CurrencyField
                id="currentCashSavings"
                label="Current cash savings"
                hint="Cash in checking, savings, and similar accounts."
                value={profile.currentCashSavings}
                disabled={saving}
                onChange={updateField}
              />

              <PercentField
                id="savingsInterestRate"
                label="Savings interest rate"
                hint="Annual rate, compounded monthly on cash savings. Enter 0 to 100."
                value={profile.savingsInterestRate}
                disabled={saving}
                onChange={updateField}
              />
            </section>
          </div>

          <footer className="profile__footer">
            {saving && <p className="profile__save-status">Saving…</p>}
            {!saving && savedToServer && hasAnyBalance(profile) && (
              <p className="profile__save-status profile__save-status--saved">Profile saved</p>
            )}
            <button
              type="button"
              className="profile__continue"
              disabled={!canContinue}
              onClick={onContinue}
            >
              Continue to goal
            </button>
          </footer>
        </>
      )}
    </div>
  )
}
