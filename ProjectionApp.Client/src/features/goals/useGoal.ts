import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useProfile } from '@/features/profile/useProfile'
import { GOAL_TARGET_AMOUNT } from '@/shared/lib/format/currency'
import { analyzeSavingsGoal } from './api'
import { clearSavedGoalRuns, loadSavedGoalRuns, saveGoalRunResult } from './storage'
import type { SavingsGoalResult } from './types'

export const goalQueryKey = ['goal', 'session'] as const

export interface GoalSession {
  targetAmount: number
  result: SavingsGoalResult | null
  lastAnalyzedVersion: number | null
}

function emptyGoalSession(targetAmount = GOAL_TARGET_AMOUNT): GoalSession {
  return {
    targetAmount,
    result: null,
    lastAnalyzedVersion: null,
  }
}

function readGoalSession(): GoalSession {
  const latestRun = loadSavedGoalRuns()[0]
  if (!latestRun) {
    return emptyGoalSession()
  }

  return {
    targetAmount: latestRun.result.targetAmount,
    result: latestRun.result,
    lastAnalyzedVersion: latestRun.profileVersion ?? null,
  }
}

export function useGoal() {
  const queryClient = useQueryClient()
  const { flushPendingSave } = useProfile()

  const query = useQuery({
    queryKey: goalQueryKey,
    queryFn: async () => queryClient.getQueryData<GoalSession>(goalQueryKey) ?? readGoalSession(),
    initialData: readGoalSession,
    staleTime: Infinity,
  })

  const analyzeMutation = useMutation({
    mutationFn: async (resolvedTarget: number) => {
      const profileVersion = await flushPendingSave()
      const analysis = await analyzeSavingsGoal(resolvedTarget)
      saveGoalRunResult(analysis, profileVersion)
      return { analysis, profileVersion, resolvedTarget }
    },
    onSuccess: ({ analysis, profileVersion, resolvedTarget }) => {
      queryClient.setQueryData<GoalSession>(goalQueryKey, {
        targetAmount: resolvedTarget,
        result: analysis,
        lastAnalyzedVersion: profileVersion,
      })
    },
  })

  function setTargetAmount(amount: number) {
    queryClient.setQueryData<GoalSession>(goalQueryKey, (current) => ({
      ...(current ?? readGoalSession()),
      targetAmount: amount,
    }))
  }

  function clearCachedResults() {
    const current = queryClient.getQueryData<GoalSession>(goalQueryKey) ?? readGoalSession()
    clearSavedGoalRuns()
    queryClient.setQueryData<GoalSession>(goalQueryKey, emptyGoalSession(current.targetAmount))
  }

  async function analyze(overrideTarget?: number): Promise<boolean> {
    const resolvedTarget = overrideTarget ?? query.data.targetAmount

    try {
      await analyzeMutation.mutateAsync(resolvedTarget)
      return true
    } catch {
      return false
    }
  }

  return {
    targetAmount: query.data.targetAmount,
    setTargetAmount,
    result: query.data.result,
    loading: analyzeMutation.isPending,
    error:
      analyzeMutation.error instanceof Error
        ? analyzeMutation.error.message
        : analyzeMutation.error
          ? 'Failed to analyze goal'
          : null,
    lastAnalyzedVersion: query.data.lastAnalyzedVersion,
    analyze,
    clearCachedResults,
  }
}
