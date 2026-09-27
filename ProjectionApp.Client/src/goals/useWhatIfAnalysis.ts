import { useCallback, useEffect, useState } from 'react'
import { analyzeReachGoal } from '../api/goals'
import type { Reach100kGoalResult } from '../types/goal'

const DEBOUNCE_MS = 400

export const CONTRIBUTION_DELTA_MIN = -500
export const CONTRIBUTION_DELTA_MAX = 1000
export const INVESTMENT_RATE_MIN = 0
export const INVESTMENT_RATE_MAX = 12

export function formatMonthsDelta(
  baselineMonths: number | null,
  scenarioMonths: number | null,
): string | null {
  if (baselineMonths == null || scenarioMonths == null) {
    return null
  }

  const delta = baselineMonths - scenarioMonths
  if (delta === 0) {
    return null
  }

  const abs = Math.abs(delta)
  const unit = abs === 1 ? 'month' : 'months'
  return delta > 0 ? `${abs} ${unit} sooner` : `${abs} ${unit} longer`
}

export function useWhatIfAnalysis(baselineResult: Reach100kGoalResult | null) {
  const baseContribution = baselineResult?.effectiveMonthlyContributions ?? 0
  const baseInvestmentRate = baselineResult?.investmentInterestRate ?? 0

  const [contributionDelta, setContributionDelta] = useState(0)
  const [investmentRate, setInvestmentRate] = useState(baseInvestmentRate)
  const [scenarioResult, setScenarioResult] = useState<Reach100kGoalResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!baselineResult) {
      return
    }

    setContributionDelta(0)
    setInvestmentRate(baselineResult.investmentInterestRate ?? 0)
    setScenarioResult(null)
    setError(null)
  }, [
    baselineResult?.targetAmount,
    baselineResult?.currentPosition,
    baselineResult?.effectiveMonthlyContributions,
    baselineResult?.investmentInterestRate,
  ])

  const hasChanges =
    contributionDelta !== 0 || investmentRate !== (baselineResult?.investmentInterestRate ?? 0)

  useEffect(() => {
    if (!baselineResult || !hasChanges) {
      setScenarioResult(null)
      setLoading(false)
      return
    }

    let cancelled = false
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await analyzeReachGoal(baselineResult.targetAmount, {
          monthlyContribution: baseContribution + contributionDelta,
          investmentInterestRate: investmentRate,
        })

        if (!cancelled) {
          setScenarioResult(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to analyze scenario')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [baselineResult, hasChanges, baseContribution, contributionDelta, investmentRate])

  const reset = useCallback(() => {
    setContributionDelta(0)
    setInvestmentRate(baselineResult?.investmentInterestRate ?? 0)
    setScenarioResult(null)
    setError(null)
  }, [baselineResult?.investmentInterestRate])

  const displayResult =
    hasChanges && scenarioResult ? scenarioResult : baselineResult

  return {
    contributionDelta,
    setContributionDelta,
    investmentRate,
    setInvestmentRate,
    baseContribution,
    baseInvestmentRate,
    scenarioResult: hasChanges ? scenarioResult : null,
    displayResult,
    loading,
    error,
    hasChanges,
    reset,
  }
}
