import type { ProjectionSummary } from '../types/projection'

export async function getProjections(): Promise<ProjectionSummary[]> {
  const response = await fetch('/api/projections')

  if (!response.ok) {
    throw new Error(`Failed to load projections (${response.status})`)
  }

  return response.json() as Promise<ProjectionSummary[]>
}
