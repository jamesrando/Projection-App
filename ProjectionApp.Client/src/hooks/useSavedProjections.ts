import { useCallback, useEffect, useState } from 'react'
import {
  clearSavedProjections,
  loadSavedProjections,
  removeSavedProjection,
  subscribeSavedProjections,
} from '../storage/savedProjections'
import type { SavedProjection } from '../types/savedProjection'

export function useSavedProjections() {
  const [projections, setProjections] = useState<SavedProjection[]>(() => loadSavedProjections())

  useEffect(() => subscribeSavedProjections(() => setProjections(loadSavedProjections())), [])

  const remove = useCallback((id: string) => removeSavedProjection(id), [])
  const clear = useCallback(() => clearSavedProjections(), [])

  return { projections, remove, clear }
}
