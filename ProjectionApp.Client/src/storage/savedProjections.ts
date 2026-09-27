import type { Reach100kGoalResult } from '../types/goal'
import type { SavedProjection } from '../types/savedProjection'

const STORAGE_KEY = 'projection-app:saved-projections'
const MAX_SAVED = 20

const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

export function subscribeSavedProjections(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function loadSavedProjections(): SavedProjection[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as SavedProjection[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persist(projections: SavedProjection[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(projections))
  notifyListeners()
}

export function saveProjectionResult(result: Reach100kGoalResult): SavedProjection {
  const entry: SavedProjection = {
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    result,
  }

  const existing = loadSavedProjections()
  persist([entry, ...existing].slice(0, MAX_SAVED))

  return entry
}

export function removeSavedProjection(id: string) {
  persist(loadSavedProjections().filter((item) => item.id !== id))
}

export function clearSavedProjections() {
  sessionStorage.removeItem(STORAGE_KEY)
  notifyListeners()
}
