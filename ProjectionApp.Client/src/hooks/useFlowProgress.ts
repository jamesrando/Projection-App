import { useMemo } from 'react'
import { useGoal } from '../context/GoalContext'
import { useProfile } from '../context/ProfileContext'
import {
  MAIN_FLOW_STEPS,
  OPTIONAL_FLOW_STEPS,
  type FlowStepId,
} from '../flow/flowSteps'
import { useSavedProjections } from './useSavedProjections'

export type FlowUnlocks = Record<FlowStepId, boolean>

export function useFlowProgress() {
  const { savedToServer, hasBalance, saving, profile } = useProfile()
  const { result } = useGoal()
  const { projections } = useSavedProjections()

  const financesComplete = savedToServer && hasBalance && !saving
  const hasProjection = result !== null || projections.length > 0
  const canAccessSalary = profile.annualSalary !== null && profile.annualSalary > 0

  const unlocked = useMemo<FlowUnlocks>(
    () => ({
      home: true,
      finances: true,
      calculator: financesComplete,
      results: hasProjection,
      salary: canAccessSalary,
    }),
    [financesComplete, hasProjection, canAccessSalary],
  )

  const nextPath = useMemo(() => {
    if (!financesComplete) {
      return '/finances'
    }

    if (!hasProjection) {
      return '/calculator'
    }

    return '/projections'
  }, [financesComplete, hasProjection])

  const nextLabel = useMemo(() => {
    if (!financesComplete) {
      return 'Enter your finances'
    }

    if (!hasProjection) {
      return 'Run a projection'
    }

    return 'View your results'
  }, [financesComplete, hasProjection])

  function isStepComplete(stepId: FlowStepId): boolean {
    switch (stepId) {
      case 'finances':
        return financesComplete
      case 'calculator':
        return hasProjection
      case 'results':
        return hasProjection
      default:
        return false
    }
  }

  return {
    unlocked,
    financesComplete,
    hasProjection,
    nextPath,
    nextLabel,
    mainSteps: MAIN_FLOW_STEPS,
    optionalSteps: OPTIONAL_FLOW_STEPS,
    isStepComplete,
  }
}
