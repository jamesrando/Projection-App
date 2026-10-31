import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { analyzeSavingsGoal } from '../api/goals'
import { GOAL_TARGET_AMOUNT } from '../format/currency'
import { loadSavedGoalRuns, saveGoalRunResult } from '../storage/savedGoalRuns'
import type { SavingsGoalResult } from '../types/goal'
import { useProfile } from './ProfileContext'

interface GoalContextValue {
  targetAmount: number
  setTargetAmount: (amount: number) => void
  result: SavingsGoalResult | null
  loading: boolean
  error: string | null
  lastAnalyzedVersion: number | null
  analyze: (overrideTarget?: number) => Promise<boolean>
}

const GoalContext = createContext<GoalContextValue | null>(null)

export function GoalProvider({ children }: { children: ReactNode }) {
  const { flushPendingSave } = useProfile()
  const [targetAmount, setTargetAmount] = useState(GOAL_TARGET_AMOUNT)
  const [result, setResult] = useState<SavingsGoalResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastAnalyzedVersion, setLastAnalyzedVersion] = useState<number | null>(null)
  const hydratedRef = useRef(false)

  useEffect(() => {
    if (hydratedRef.current) {
      return
    }

    hydratedRef.current = true
    const latestRun = loadSavedGoalRuns()[0]
    if (!latestRun) {
      return
    }

    setResult((current) => current ?? latestRun.result)
    setLastAnalyzedVersion((current) =>
      current !== null ? current : (latestRun.profileVersion ?? null),
    )
  }, [])

  const analyze = useCallback(
    async (overrideTarget?: number): Promise<boolean> => {
      const resolvedTarget = overrideTarget ?? targetAmount
      setLoading(true)
      setError(null)

      try {
        const profileVersion = await flushPendingSave()
        const analysis = await analyzeSavingsGoal(resolvedTarget)
        setResult(analysis)
        saveGoalRunResult(analysis, profileVersion)
        setLastAnalyzedVersion(profileVersion)
        if (overrideTarget !== undefined) {
          setTargetAmount(overrideTarget)
        }
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to analyze goal')
        return false
      } finally {
        setLoading(false)
      }
    },
    [flushPendingSave, targetAmount],
  )

  const value: GoalContextValue = {
    targetAmount,
    setTargetAmount,
    result,
    loading,
    error,
    lastAnalyzedVersion,
    analyze,
  }

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>
}

export function useGoal(): GoalContextValue {
  const context = useContext(GoalContext)
  if (!context) {
    throw new Error('useGoal must be used within GoalProvider')
  }

  return context
}
