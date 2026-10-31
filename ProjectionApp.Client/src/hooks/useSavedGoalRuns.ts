import { useCallback, useEffect, useState } from 'react'
import {
  clearSavedGoalRuns,
  loadSavedGoalRuns,
  removeSavedGoalRun,
  subscribeSavedGoalRuns,
} from '../storage/savedGoalRuns'
import type { SavedGoalRun } from '../types/savedGoalRun'

export function useSavedGoalRuns() {
  const [savedRuns, setSavedRuns] = useState<SavedGoalRun[]>(() => loadSavedGoalRuns())

  useEffect(() => subscribeSavedGoalRuns(() => setSavedRuns(loadSavedGoalRuns())), [])

  const remove = useCallback((id: string) => removeSavedGoalRun(id), [])
  const clear = useCallback(() => clearSavedGoalRuns(), [])

  return { savedRuns, remove, clear }
}
