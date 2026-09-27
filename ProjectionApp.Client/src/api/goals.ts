import type { GoalScenarioOverrides, Reach100kGoalResult } from '../types/goal'
import { apiFetch, parseApiError } from './client'

export interface AnalyzeReachGoalRequest {
  targetAmount?: number
  overrides?: GoalScenarioOverrides
}

export async function analyzeReachGoal(
  targetAmount?: number,
  overrides?: GoalScenarioOverrides,
): Promise<Reach100kGoalResult> {
  const body: AnalyzeReachGoalRequest = {}

  if (targetAmount !== undefined) {
    body.targetAmount = targetAmount
  }

  if (overrides !== undefined) {
    body.overrides = overrides
  }

  const hasBody = Object.keys(body).length > 0

  const response = await apiFetch('/api/goals/reach-100k', {
    method: 'POST',
    headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
    body: hasBody ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Failed to analyze goal'))
  }

  return response.json() as Promise<Reach100kGoalResult>
}
