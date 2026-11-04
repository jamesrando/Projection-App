const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const url = input.startsWith('http') ? input : `${baseUrl}${input}`
  return fetch(url, init)
}

export async function parseApiError(response: Response, fallback: string): Promise<string> {
  const body = (await response.json().catch(() => null)) as { error?: string } | null
  return body?.error ?? `${fallback} (${response.status})`
}
