import { NavLink, useLocation } from 'react-router-dom'
import { pathToStepId } from '../flow/flowSteps'
import { useFlowProgress } from '../hooks/useFlowProgress'

export function FlowStepper() {
  const location = useLocation()
  const { unlocked, isStepComplete, mainSteps, optionalSteps } = useFlowProgress()
  const currentStep = pathToStepId(location.pathname)

  return (
    <nav className="flow-stepper" aria-label="Projection steps">
      <ol className="flow-stepper__list">
        {mainSteps.map((step) => {
          const isCurrent = currentStep === step.id
          const isComplete = isStepComplete(step.id)
          const isUnlocked = unlocked[step.id]

          if (!isUnlocked) {
            return (
              <li key={step.id} className="flow-stepper__item flow-stepper__item--locked">
                <span className="flow-stepper__link" aria-disabled="true">
                  <span className="flow-stepper__number" aria-hidden="true">
                    {step.stepNumber}
                  </span>
                  <span className="flow-stepper__label">{step.label}</span>
                </span>
              </li>
            )
          }

          return (
            <li
              key={step.id}
              className={`flow-stepper__item${
                isCurrent ? ' flow-stepper__item--current' : ''
              }${isComplete ? ' flow-stepper__item--complete' : ''}`}
            >
              <NavLink
                to={step.path}
                className={({ isActive }) =>
                  `flow-stepper__link${isActive ? ' flow-stepper__link--active' : ''}`
                }
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span className="flow-stepper__number" aria-hidden="true">
                  {step.stepNumber}
                </span>
                <span className="flow-stepper__label">{step.label}</span>
              </NavLink>
            </li>
          )
        })}
      </ol>

      {optionalSteps.map((step) => {
        if (!unlocked[step.id]) {
          return null
        }

        return (
          <NavLink
            key={step.id}
            to={step.path}
            className={({ isActive }) =>
              `flow-stepper__optional${isActive ? ' flow-stepper__optional--active' : ''}`
            }
          >
            {step.label}
          </NavLink>
        )
      })}
    </nav>
  )
}
