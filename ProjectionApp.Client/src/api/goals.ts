import type { Reach100kGoalResult } from '../types/goal'

export async function analyzeReach100kGoal(): Promise<Reach100kGoalResult> {
  const response = await fetch('/api/goals/reach-100k', {
    method: 'POST',
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Failed to analyze goal (${response.status})`)
  }

  return response.json() as Promise<Reach100kGoalResult>
}
