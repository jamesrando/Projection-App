import { Link } from 'react-router-dom'
import { useGoal } from '../context/GoalContext'
import { useFlowProgress } from '../hooks/useFlowProgress'
import { formatCurrency } from '../format/currency'
import { useSavedProjections } from '../hooks/useSavedProjections'

const steps = [
  {
    number: '1',
    title: 'Enter your finances',
    description: 'Add your salary, savings, interest rates, and monthly contributions.',
  },
  {
    number: '2',
    title: 'Run a projection',
    description: 'Choose a target amount and calculate how long it takes to get there.',
  },
  {
    number: '3',
    title: 'Review your results',
    description: 'See your timeline, progress breakdown, and saved scenarios for this session.',
  },
]

export function DashboardScreen() {
  const { result } = useGoal()
  const { projections } = useSavedProjections()
  const { nextPath, financesComplete, hasProjection } = useFlowProgress()

  return (
    <div className="dashboard">
      <section className="hero" aria-labelledby="hero-title">
        <p className="hero__eyebrow">Free financial projection tool</p>
        <h1 id="hero-title" className="hero__title">
          See how long it takes to reach your savings target
        </h1>
        <p className="hero__subtitle">
          A guided three-step calculator for estimating when your investments and savings will hit
          a goal — based on compound interest and monthly contributions. No account needed.
        </p>
        <div className="hero__actions">
          {hasProjection ? (
            <>
              <Link to="/projections" className="hero__cta hero__cta--primary">
                View your results
              </Link>
              <Link to="/calculator" className="hero__cta hero__cta--secondary">
                Run another projection
              </Link>
            </>
          ) : (
            <>
              <span className="hero__cta hero__cta--secondary hero__cta--disabled" aria-disabled="true">
                View your results
              </span>
              <Link to={nextPath} className="hero__cta hero__cta--primary">
                {financesComplete ? 'Run a projection' : 'Start the process'}
              </Link>
            </>
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

      {hasProjection && (
        <section className="dashboard-session" aria-labelledby="session-title">
          <h2 id="session-title" className="dashboard-session__title">
            Your latest projection
          </h2>
          <div className="dashboard-session__stats">
            {result && (
              <div className="session-stat">
                <span className="session-stat__label">Progress</span>
                <span className="session-stat__value session-stat__value--accent">
                  {result.progressPercent.toFixed(1)}% toward {formatCurrency(result.targetAmount)}
                </span>
              </div>
            )}
            <div className="session-stat">
              <span className="session-stat__label">Saved this session</span>
              <span className="session-stat__value">{projections.length}</span>
            </div>
          </div>
          <Link to="/projections" className="dashboard-session__link">
            Continue to your results →
          </Link>
        </section>
      )}

      {!financesComplete && (
        <p className="dashboard__hint">
          Start with step 1 — enter at least one balance or your salary to unlock the calculator.
        </p>
      )}
    </div>
  )
}
