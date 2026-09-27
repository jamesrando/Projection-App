import type { Reach100kGoalResult } from '../types/goal'
import { apiFetch, parseApiError } from './client'

export interface AnalyzeReachGoalRequest {
  targetAmount?: number
}

export async function analyzeReachGoal(
  targetAmount?: number,
): Promise<Reach100kGoalResult> {
  const body: AnalyzeReachGoalRequest | undefined =
    targetAmount !== undefined ? { targetAmount } : undefined

  const response = await apiFetch('/api/goals/reach-100k', {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Failed to analyze goal'))
  }

  return response.json() as Promise<Reach100kGoalResult>
}
