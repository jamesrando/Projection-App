import { useMemo } from 'react'
import { useGoal } from '../context/GoalContext'
import { useProfile } from '../context/ProfileContext'
import {
  MAIN_FLOW_STEPS,
  OPTIONAL_FLOW_STEPS,
  type FlowStepId,
} from '../flow/flowSteps'
import { useSavedGoalRuns } from './useSavedGoalRuns'

export type FlowUnlocks = Record<FlowStepId, boolean>

export function useFlowProgress() {
  const { savedToServer, isProfileCompleteForGoals, saving, savePending, profile } =
    useProfile()
  const { result } = useGoal()
  const { savedRuns } = useSavedGoalRuns()

  const financesComplete =
    savedToServer && isProfileCompleteForGoals && !saving && !savePending
  const hasResults = result !== null || savedRuns.length > 0
  const canAccessSalary = profile.annualSalary !== null && profile.annualSalary > 0

  const unlocked = useMemo<FlowUnlocks>(
    () => ({
      home: true,
      finances: true,
      calculator: financesComplete,
      results: hasResults,
      salary: canAccessSalary,
    }),
    [financesComplete, hasResults, canAccessSalary],
  )

  const nextPath = useMemo(() => {
    if (!financesComplete) {
      return '/finances'
    }

    if (!hasResults) {
      return '/calculator'
    }

    return '/results'
  }, [financesComplete, hasResults])

  const nextLabel = useMemo(() => {
    if (!financesComplete) {
      return 'Enter your finances'
    }

    if (!hasResults) {
      return 'Run a calculation'
    }

    return 'View your results'
  }, [financesComplete, hasResults])

  function isStepComplete(stepId: FlowStepId): boolean {
    switch (stepId) {
      case 'finances':
        return financesComplete
      case 'calculator':
        return hasResults
      case 'results':
        return hasResults
      default:
        return false
    }
  }

  return {
    unlocked,
    financesComplete,
    hasResults,
    nextPath,
    nextLabel,
    mainSteps: MAIN_FLOW_STEPS,
    optionalSteps: OPTIONAL_FLOW_STEPS,
    isStepComplete,
  }
}
