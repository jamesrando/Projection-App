import type { SaveUserProfileRequest, UserProfile } from '../types/profile'

export class ProfileNotFoundError extends Error {
  constructor() {
    super('Profile not found')
    this.name = 'ProfileNotFoundError'
  }
}

export async function getProfile(): Promise<UserProfile | null> {
  const response = await fetch('/api/profile')

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Failed to load profile (${response.status})`)
  }

  return response.json() as Promise<UserProfile>
}

export async function saveProfile(request: SaveUserProfileRequest): Promise<UserProfile> {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Failed to save profile (${response.status})`)
  }

  return response.json() as Promise<UserProfile>
}
