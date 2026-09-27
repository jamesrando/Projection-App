import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { analyzeReachGoal } from '../api/goals'
import { GOAL_TARGET_AMOUNT } from '../format/currency'
import { saveProjectionResult } from '../storage/savedProjections'
import type { Reach100kGoalResult } from '../types/goal'

interface GoalContextValue {
  targetAmount: number
  setTargetAmount: (amount: number) => void
  result: Reach100kGoalResult | null
  loading: boolean
  error: string | null
  lastAnalyzedVersion: number | null
  analyze: (profileVersion: number, overrideTarget?: number) => Promise<void>
}

const GoalContext = createContext<GoalContextValue | null>(null)

export function GoalProvider({ children }: { children: ReactNode }) {
  const [targetAmount, setTargetAmount] = useState(GOAL_TARGET_AMOUNT)
  const [result, setResult] = useState<Reach100kGoalResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastAnalyzedVersion, setLastAnalyzedVersion] = useState<number | null>(null)

  const analyze = useCallback(
    async (profileVersion: number, overrideTarget?: number) => {
      const resolvedTarget = overrideTarget ?? targetAmount
      setLoading(true)
      setError(null)

      try {
        const analysis = await analyzeReachGoal(resolvedTarget)
        setResult(analysis)
        saveProjectionResult(analysis)
        setLastAnalyzedVersion(profileVersion)
        if (overrideTarget !== undefined) {
          setTargetAmount(overrideTarget)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to analyze goal')
      } finally {
        setLoading(false)
      }
    },
    [targetAmount],
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
