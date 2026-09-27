import type { TakeHomeResult } from '../types/salary'
import { apiFetch, parseApiError } from './client'

export interface CalculateTakeHomeRequest {
  annualGrossSalary?: number
}

export async function calculateTakeHome(
  annualGrossSalary?: number,
): Promise<TakeHomeResult> {
  const body: CalculateTakeHomeRequest | undefined =
    annualGrossSalary !== undefined ? { annualGrossSalary } : undefined

  const response = await apiFetch('/api/salary/take-home', {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Failed to calculate take-home pay'))
  }

  return response.json() as Promise<TakeHomeResult>
}
