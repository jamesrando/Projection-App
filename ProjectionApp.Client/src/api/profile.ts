import type { SaveUserProfileRequest, UserProfile } from '../types/profile'
import { apiFetch, parseApiError } from './client'

export class ProfileNotFoundError extends Error {
  constructor() {
    super('Profile not found')
    this.name = 'ProfileNotFoundError'
  }
}

export async function getProfile(): Promise<UserProfile | null> {
  const response = await apiFetch('/api/profile')

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Failed to load profile'))
  }

  return response.json() as Promise<UserProfile>
}

export async function saveProfile(request: SaveUserProfileRequest): Promise<UserProfile> {
  const response = await apiFetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Failed to save profile'))
  }

  return response.json() as Promise<UserProfile>
}
