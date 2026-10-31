import { apiFetch, parseApiError } from '@/shared/api/client'
import type { GoalScenarioOverrides, SavingsGoalResult } from './types'

export interface AnalyzeSavingsGoalRequest {
  targetAmount?: number
  overrides?: GoalScenarioOverrides
}

export async function analyzeSavingsGoal(
  targetAmount?: number,
  overrides?: GoalScenarioOverrides,
): Promise<SavingsGoalResult> {
  const body: AnalyzeSavingsGoalRequest = {}

  if (targetAmount !== undefined) {
    body.targetAmount = targetAmount
  }

  if (overrides !== undefined) {
    body.overrides = overrides
  }

  const hasBody = Object.keys(body).length > 0

  const response = await apiFetch('/api/goals/analyze', {
    method: 'POST',
    headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
    body: hasBody ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Failed to analyze goal'))
  }

  return response.json() as Promise<SavingsGoalResult>
}
