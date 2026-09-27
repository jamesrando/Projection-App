import type { ProjectionSummary } from '../types/projection'
import { apiFetch, parseApiError } from './client'

export async function getProjections(): Promise<ProjectionSummary[]> {
  const response = await apiFetch('/api/projections')

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Failed to load projections'))
  }

  return response.json() as Promise<ProjectionSummary[]>
}
