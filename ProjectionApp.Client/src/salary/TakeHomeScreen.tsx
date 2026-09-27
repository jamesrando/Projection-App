import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { calculateTakeHome } from '../api/salary'
import { CurrencyField } from '../components/CurrencyField'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { useProfile } from '../context/ProfileContext'
import { currencySymbol, formatCurrency } from '../format/currency'
import type { BudgetSplit, TakeHomeResult } from '../types/salary'

function formatShare(value: number): string {
  return `${value.toFixed(0)}%`
}

interface BudgetSplitBarProps {
  split: BudgetSplit
}

function BudgetSplitBar({ split }: BudgetSplitBarProps) {
  const categories = [
    {
      key: 'needs',
      label: 'Needs',
      description: 'Rent, bills, groceries, transport',
      amount: split.needs.annual,
      share: split.needs.percent,
      segmentClass: 'goal-split__segment--needs',
      dotClass: 'goal-split__dot--needs',
    },
    {
      key: 'wants',
      label: 'Wants',
      description: 'Dining out, subscriptions, hobbies',
      amount: split.wants.annual,
      share: split.wants.percent,
      segmentClass: 'goal-split__segment--wants',
      dotClass: 'goal-split__dot--wants',
    },
    {
      key: 'savings',
      label: 'Savings',
      description: 'Emergency fund, investments, debt overpayment',
      amount: split.savings.annual,
      share: split.savings.percent,
      segmentClass: 'goal-split__segment--budget-savings',
      dotClass: 'goal-split__dot--budget-savings',
    },
  ] as const

  return (
    <div className="goal-split">
      <div
        className="goal-split__bar"
        role="img"
        aria-label={`Needs ${formatShare(split.needs.percent)}, wants ${formatShare(split.wants.percent)}, savings ${formatShare(split.savings.percent)}`}
      >
        {categories.map((category) =>
          category.share > 0 ? (
            <span
              key={category.key}
              className={`goal-split__segment ${category.segmentClass}`}
              style={{ width: `${category.share}%` }}
            />
          ) : null,
        )}
      </div>
      <ul className="goal-split__legend">
        {categories.map((category) => (
          <li key={category.key} className="goal-split__legend-item">
            <span className={`goal-split__dot ${category.dotClass}`} aria-hidden="true" />
            <div className="goal-split__legend-copy">
              <span className="goal-split__legend-label">{category.label}</span>
              <span className="goal-split__legend-value">{formatCurrency(category.amount)}</span>
              <span className="goal-split__legend-hint">{category.description}</span>
            </div>
            <span className="goal-split__legend-share">{formatShare(category.share)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TakeHomeResults({ result }: { result: TakeHomeResult }) {
  const { taxBreakdown, budgetSplit } = result

  return (
    <div className="goal-results-stack">
      <section className="goal-panel">
        <header className="goal-panel__header">
          <h3 className="goal-panel__title">Take-home summary</h3>
          <p className="goal-panel__description">
            Estimated net income after UK income tax and National Insurance ({result.taxYear}).
          </p>
        </header>
        <div className="goal-panel__body">
          <div className="goal-hero__stats">
            <StatCard label="Gross annual" value={formatCurrency(result.annualGrossSalary)} />
            <StatCard label="Income tax" value={formatCurrency(taxBreakdown.incomeTaxAnnual)} />
            <StatCard
              label="National Insurance"
              value={formatCurrency(taxBreakdown.nationalInsuranceAnnual)}
            />
            <StatCard
              label="Net take-home (annual)"
              value={formatCurrency(result.netAnnual)}
              tone="money"
            />
          </div>
          <div className="salary-hero-stat">
            <StatCard
              label="Net take-home (monthly)"
              value={formatCurrency(result.netMonthly, true)}
              tone="accent"
            />
          </div>
        </div>
      </section>

      <section className="goal-panel">
        <header className="goal-panel__header">
          <h3 className="goal-panel__title">Recommended 50/30/20 budget</h3>
          <p className="goal-panel__description">
            A simple split of your monthly net income across essentials, discretionary spending,
            and savings.
          </p>
        </header>
        <div className="goal-panel__body">
          <BudgetSplitBar split={budgetSplit} />
          <div className="goal-detail-grid salary-budget-grid">
            <StatCard
              label="Needs (monthly)"
              value={formatCurrency(budgetSplit.needs.monthly, true)}
            />
            <StatCard
              label="Wants (monthly)"
              value={formatCurrency(budgetSplit.wants.monthly, true)}
            />
            <StatCard
              label="Savings (monthly)"
              value={formatCurrency(budgetSplit.savings.monthly, true)}
              tone="money"
            />
          </div>
        </div>
      </section>

      <p className="salary-disclaimer">
        Estimate only. Based on {result.taxYear} UK tax rates for England, Wales, and Northern
        Ireland. Does not include pension contributions, student loan repayments, or benefits in
        kind.
      </p>
    </div>
  )
}

export function TakeHomeScreen() {
  const { profile, loading: profileLoading } = useProfile()
  const [draftSalary, setDraftSalary] = useState<number | null>(null)
  const [salaryError, setSalaryError] = useState<string | null>(null)
  const [result, setResult] = useState<TakeHomeResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prefilledFromProfile, setPrefilledFromProfile] = useState(false)

  useEffect(() => {
    if (draftSalary === null && profile.annualSalary !== null && profile.annualSalary > 0) {
      setDraftSalary(profile.annualSalary)
      setPrefilledFromProfile(true)
    }
  }, [draftSalary, profile.annualSalary])

  const canCalculate = draftSalary !== null && draftSalary > 0 && !salaryError

  async function handleCalculate() {
    if (!canCalculate) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const nextResult = await calculateTakeHome(draftSalary)
      setResult(nextResult)
    } catch (nextError) {
      setResult(null)
      setError(nextError instanceof Error ? nextError.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
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
    </div>
  )
}
