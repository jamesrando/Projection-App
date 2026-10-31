import { useMemo } from 'react'
import { useGoal } from '../context/GoalContext'
import { useProfile } from '../context/ProfileContext'
import { useSavedGoalRuns } from './useSavedGoalRuns'

export function useAnalysisFreshness() {
  const { profileVersion } = useProfile()
  const { result, lastAnalyzedVersion } = useGoal()
  const { savedRuns } = useSavedGoalRuns()

  const analyzedProfileVersion = useMemo(() => {
    if (result !== null && lastAnalyzedVersion !== null) {
      return lastAnalyzedVersion
    }

    const latestVersion = savedRuns[0]?.profileVersion
    return latestVersion !== undefined ? latestVersion : null
  }, [result, lastAnalyzedVersion, savedRuns])

  const hasBaseline = result !== null || savedRuns.length > 0

  const isStale = useMemo(
    () =>
      hasBaseline &&
      (analyzedProfileVersion === null || profileVersion !== analyzedProfileVersion),
    [hasBaseline, analyzedProfileVersion, profileVersion],
  )

  return { isStale, analyzedProfileVersion, hasBaseline }
}
