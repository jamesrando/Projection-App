import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearSavedGoalRuns,
  loadSavedGoalRuns,
  removeSavedGoalRun,
  saveGoalRunResult,
} from './storage'
import type { SavingsGoalResult } from './types'

const sampleResult: SavingsGoalResult = {
  targetAmount: 100_000,
  currentPosition: 75_000,
  remainingAmount: 25_000,
  progressPercent: 75,
  estimatedMonthsToGoal: 22,
  estimatedYearsToGoal: 1.83,
  investmentInterestRate: null,
  savingsInterestRate: null,
  monthlyInvestmentContributions: null,
  effectiveMonthlyContributions: 1_142.62,
  contributionsInferredFromSalary: true,
  isGoalMet: false,
  isReachable: true,
  breakdown: {
    currentInvestments: 50_000,
    currentCashSavings: 25_000,
    investmentsSharePercent: 66.7,
    savingsSharePercent: 33.3,
    estimatedMonthlyInvestmentGrowth: 1_142.62,
    estimatedMonthlySavingsGrowth: 0,
    projectedInvestments: null,
    projectedCashSavings: null,
    totalContributionsAdded: null,
    investmentInterestEarned: null,
    savingsInterestEarned: null,
    totalInterestEarned: null,
    investmentHoldingProjections: null,
  },
  monthlySeries: null,
}

function createSessionStorageMock(): Storage {
  const store = new Map<string, string>()

  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.get(key) ?? null
    },
    key(index: number) {
      return [...store.keys()][index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, value)
    },
  }
}

describe('savedGoalRuns storage', () => {
  beforeEach(() => {
    globalThis.sessionStorage = createSessionStorageMock()
    clearSavedGoalRuns()
  })

  it('persists and reloads saved goal runs', () => {
    const saved = saveGoalRunResult(sampleResult, 1)
    const loaded = loadSavedGoalRuns()

    expect(loaded).toHaveLength(1)
    expect(loaded[0]?.id).toBe(saved.id)
    expect(loaded[0]?.result.targetAmount).toBe(100_000)
    expect(loaded[0]?.profileVersion).toBe(1)
  })

  it('removes a saved goal run by id', () => {
    const saved = saveGoalRunResult(sampleResult, 1)
    removeSavedGoalRun(saved.id)

    expect(loadSavedGoalRuns()).toHaveLength(0)
  })

  it('clears all saved goal runs', () => {
    saveGoalRunResult(sampleResult, 1)
    saveGoalRunResult({ ...sampleResult, targetAmount: 200_000 }, 2)

    clearSavedGoalRuns()

    expect(loadSavedGoalRuns()).toHaveLength(0)
    expect(sessionStorage.getItem('projection-app:saved-goal-runs')).toBeNull()
  })

  it('migrates legacy session storage key', () => {
    sessionStorage.setItem(
      'projection-app:saved-projections',
      JSON.stringify([
        {
          id: 'legacy-id',
          savedAt: '2026-01-01T00:00:00.000Z',
          result: sampleResult,
        },
      ]),
    )

    const loaded = loadSavedGoalRuns()

    expect(loaded).toHaveLength(1)
    expect(loaded[0]?.id).toBe('legacy-id')
    expect(sessionStorage.getItem('projection-app:saved-goal-runs')).not.toBeNull()
    expect(sessionStorage.getItem('projection-app:saved-projections')).toBeNull()
  })
})
