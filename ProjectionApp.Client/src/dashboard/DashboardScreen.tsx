import { Link } from 'react-router-dom'
import { useGoal } from '../context/GoalContext'
import { useProfile } from '../context/ProfileContext'
import { formatCurrency } from '../format/currency'
import { useSavedProjections } from '../hooks/useSavedProjections'
import { hasAnyBalance } from '../profile/userProfile'

const steps = [
  {
    number: '1',
    title: 'Enter your finances',
    description: 'Add your current investments, savings, interest rates, and monthly contributions.',
  },
  {
    number: '2',
    title: 'Set a target',
    description: 'Choose how much you want to reach — for example £100,000 total position.',
  },
  {
    number: '3',
    title: 'See your projection',
    description: 'Get an estimated timeline, progress breakdown, and growth assumptions instantly.',
  },
]

export function DashboardScreen() {
  const { profile, hasBalance, savedToServer } = useProfile()
  const { result } = useGoal()
  const { projections } = useSavedProjections()

  const readyToCalculate = savedToServer && hasBalance
  const primaryLink = readyToCalculate ? '/calculator' : '/finances'
  const primaryLabel = readyToCalculate ? 'Run a projection' : 'Get started'

  return (
    <div className="dashboard">
      <section className="hero" aria-labelledby="hero-title">
        <p className="hero__eyebrow">Free financial projection tool</p>
        <h1 id="hero-title" className="hero__title">
          See how long it takes to reach your savings target
        </h1>
        <p className="hero__subtitle">
          A quick calculator for estimating when your investments and savings will hit a goal —
          based on compound interest and monthly contributions. No account needed.
        </p>
        <div className="hero__actions">
          <Link to={primaryLink} className="hero__cta hero__cta--primary">
            {primaryLabel}
          </Link>
          {projections.length > 0 && (
            <Link to="/projections" className="hero__cta hero__cta--secondary">
              View saved projections ({projections.length})
            </Link>
          )}
        </div>
      </section>

      <section className="how-it-works" aria-labelledby="how-it-works-title">
        <h2 id="how-it-works-title" className="how-it-works__title">
          How it works
        </h2>
        <ol className="how-it-works__steps">
          {steps.map((step) => (
            <li key={step.number} className="how-it-works__step">
              <span className="how-it-works__number" aria-hidden="true">
                {step.number}
              </span>
              <div>
                <h3 className="how-it-works__step-title">{step.title}</h3>
                <p className="how-it-works__step-text">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="dashboard-features" aria-labelledby="features-title">
        <h2 id="features-title" className="dashboard-features__title">
          What you can calculate
        </h2>
        <div className="dashboard-features__grid">
          <article className="feature-card">
            <h3 className="feature-card__title">Time to goal</h3>
            <p className="feature-card__text">
              Estimate how many months or years until your combined investments and savings reach
              your target amount.
            </p>
          </article>
          <article className="feature-card">
            <h3 className="feature-card__title">Progress tracking</h3>
            <p className="feature-card__text">
              See how far you are today, what gap remains, and how contributions versus interest
              drive growth.
            </p>
          </article>
          <article className="feature-card">
            <h3 className="feature-card__title">Take-home pay</h3>
            <p className="feature-card__text">
              Enter your gross salary to see estimated net income and a recommended 50/30/20
              budget split.
            </p>
          </article>
          <article className="feature-card">
            <h3 className="feature-card__title">Session history</h3>
            <p className="feature-card__text">
              Every calculation is saved in your browser for this session — compare scenarios
              without creating an account.
            </p>
          </article>
        </div>
      </section>

      {(result || projections.length > 0) && (
        <section className="dashboard-session" aria-labelledby="session-title">
          <h2 id="session-title" className="dashboard-session__title">
            This session
          </h2>
          <div className="dashboard-session__stats">
            {result && (
              <div className="session-stat">
                <span className="session-stat__label">Latest projection</span>
                <span className="session-stat__value session-stat__value--accent">
                  {result.progressPercent.toFixed(1)}% toward {formatCurrency(result.targetAmount)}
                </span>
              </div>
            )}
            <div className="session-stat">
              <span className="session-stat__label">Saved projections</span>
              <span className="session-stat__value">{projections.length}</span>
            </div>
          </div>
          <Link to="/projections" className="dashboard-session__link">
            Browse saved projections →
          </Link>
        </section>
      )}

      <section className="dashboard-quick-links" aria-label="Quick links">
        <Link to="/finances" className="quick-link">
          <span className="quick-link__label">Your finances</span>
          <span className="quick-link__hint">
            {hasAnyBalance(profile) ? 'Update your inputs' : 'Enter salary, savings & rates'}
          </span>
        </Link>
        <Link to="/calculator" className="quick-link">
          <span className="quick-link__label">Calculator</span>
          <span className="quick-link__hint">Run a new projection</span>
        </Link>
        <Link to="/salary" className="quick-link">
          <span className="quick-link__label">Take-home pay</span>
          <span className="quick-link__hint">Estimate net salary and budget split</span>
        </Link>
      </section>
    </div>
  )
}
