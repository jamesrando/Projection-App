import { Link } from 'react-router-dom'
import { useFlowProgress } from '@/features/flow/useFlowProgress'
import { useGoal } from '@/features/goals/useGoal'
import { useSavedGoalRuns } from '@/features/goals/useSavedGoalRuns'
import { formatCurrency } from '@/shared/lib/format/currency'

const steps = [
  {
    number: '1',
    title: 'Enter your finances',
    description: 'Add your salary, savings, interest rates, and monthly contributions.',
  },
  {
    number: '2',
    title: 'Run a calculation',
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
  const { savedRuns } = useSavedGoalRuns()
  const { nextPath, financesComplete, hasResults } = useFlowProgress()

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
          {hasResults ? (
            <>
              <Link to="/results" className="hero__cta hero__cta--primary">
                View your results
              </Link>
              <Link to="/calculator" className="hero__cta hero__cta--secondary">
                Run another calculation
              </Link>
            </>
          ) : (
            <>
              <span className="hero__cta hero__cta--secondary hero__cta--disabled" aria-disabled="true">
                View your results
              </span>
              <Link to={nextPath} className="hero__cta hero__cta--primary">
                {financesComplete ? 'Run a calculation' : 'Start the process'}
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

      {hasResults && (
        <section className="dashboard-session" aria-labelledby="session-title">
          <h2 id="session-title" className="dashboard-session__title">
            Your latest calculation
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
              <span className="session-stat__value">{savedRuns.length}</span>
            </div>
          </div>
          <Link to="/results" className="dashboard-session__link">
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
