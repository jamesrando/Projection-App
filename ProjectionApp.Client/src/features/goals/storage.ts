import type { SavedGoalRun, SavingsGoalResult } from './types'

const STORAGE_KEY = 'projection-app:saved-goal-runs'
const LEGACY_STORAGE_KEY = 'projection-app:saved-projections'
const MAX_SAVED = 20

const listeners = new Set<() => void>()

function migrateLegacyStorage() {
  try {
    const legacy = sessionStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacy && !sessionStorage.getItem(STORAGE_KEY)) {
      sessionStorage.setItem(STORAGE_KEY, legacy)
      sessionStorage.removeItem(LEGACY_STORAGE_KEY)
    }
  } catch {
    // ignore storage errors during migration
  }
}

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

export function subscribeSavedGoalRuns(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function loadSavedGoalRuns(): SavedGoalRun[] {
  migrateLegacyStorage()

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as SavedGoalRun[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persist(runs: SavedGoalRun[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(runs))
  notifyListeners()
}

export function saveGoalRunResult(
  result: SavingsGoalResult,
  profileVersion: number,
): SavedGoalRun {
  const entry: SavedGoalRun = {
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    result,
    profileVersion,
  }

  const existing = loadSavedGoalRuns()
  persist([entry, ...existing].slice(0, MAX_SAVED))

  return entry
}

export function removeSavedGoalRun(id: string) {
  persist(loadSavedGoalRuns().filter((item) => item.id !== id))
}

export function clearSavedGoalRuns() {
  sessionStorage.removeItem(STORAGE_KEY)
  notifyListeners()
}
