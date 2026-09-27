import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearSavedProjections,
  loadSavedProjections,
  removeSavedProjection,
  saveProjectionResult,
} from './savedProjections'
import type { Reach100kGoalResult } from '../types/goal'

const sampleResult: Reach100kGoalResult = {
  targetAmount: 100_000,
  currentPosition: 75_000,
  remainingAmount: 25_000,
  progressPercent: 75,
  monthlyCashFlow: 8_333.33,
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
  },
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

describe('savedProjections storage', () => {
  beforeEach(() => {
    globalThis.sessionStorage = createSessionStorageMock()
    clearSavedProjections()
  })

  it('persists and reloads saved projections', () => {
    const saved = saveProjectionResult(sampleResult)
    const loaded = loadSavedProjections()

    expect(loaded).toHaveLength(1)
    expect(loaded[0]?.id).toBe(saved.id)
    expect(loaded[0]?.result.targetAmount).toBe(100_000)
  })

  it('removes a saved projection by id', () => {
    const saved = saveProjectionResult(sampleResult)
    removeSavedProjection(saved.id)

    expect(loadSavedProjections()).toHaveLength(0)
  })
})
