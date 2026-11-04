import { useMemo } from 'react'
import { useGoal } from '@/features/goals/useGoal'
import { useSavedGoalRuns } from '@/features/goals/useSavedGoalRuns'
import { financesEstablished } from '@/features/profile/model'
import { useProfile } from '@/features/profile/useProfile'
import { flowUnlocks, MAIN_FLOW_STEPS, OPTIONAL_FLOW_STEPS, type FlowStepId } from './flowSteps'

export type FlowUnlocks = Record<FlowStepId, boolean>

export function useFlowProgress() {
  const { savedToServer, saving, savePending, profile, loading } = useProfile()
  const { result } = useGoal()
  const { savedRuns } = useSavedGoalRuns()

  const financesComplete = financesEstablished(profile, {
    savedToServer,
    saving,
    savePending,
  })
  const hasResults = result !== null || savedRuns.length > 0
  const canAccessSalary = profile.annualSalary !== null && profile.annualSalary > 0

  const unlocked = useMemo<FlowUnlocks>(
    () =>
      flowUnlocks({
        financesComplete,
        hasResults,
        canAccessSalary,
      }),
    [financesComplete, hasResults, canAccessSalary],
  )

  const nextPath = useMemo(() => {
    if (!hasResults) {
      return '/finances'
    }

    return '/results'
  }, [hasResults])

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
    profileLoading: loading,
    hasResults,
    nextPath,
    nextLabel,
    mainSteps: MAIN_FLOW_STEPS,
    optionalSteps: OPTIONAL_FLOW_STEPS,
    isStepComplete,
  }
}
