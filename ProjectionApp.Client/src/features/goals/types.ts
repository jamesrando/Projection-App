export interface GoalScenarioOverrides {
  monthlyContribution?: number
  investmentInterestRate?: number
  savingsInterestRate?: number
}

export interface GoalTimelinePoint {
  month: number
  investments: number
  savings: number
  totalPosition: number
  cumulativeContributions: number
  cumulativeInterest: number
}

export interface InvestmentHoldingProjection {
  id: string
  category: string
  customLabel: string | null
  currentBalance: number
  projectedBalance: number
  projectedSharePercent: number
}

export interface GoalBreakdown {
  currentInvestments: number
  currentCashSavings: number
  investmentsSharePercent: number
  savingsSharePercent: number
  estimatedMonthlyInvestmentGrowth: number
  estimatedMonthlySavingsGrowth: number
  projectedInvestments: number | null
  projectedCashSavings: number | null
  totalContributionsAdded: number | null
  investmentInterestEarned: number | null
  savingsInterestEarned: number | null
  totalInterestEarned: number | null
  investmentHoldingProjections: InvestmentHoldingProjection[] | null
}

export interface SavingsGoalResult {
  targetAmount: number
  currentPosition: number
  remainingAmount: number
  progressPercent: number
  estimatedMonthsToGoal: number | null
  estimatedYearsToGoal: number | null
  investmentInterestRate: number | null
  savingsInterestRate: number | null
  monthlyInvestmentContributions: number | null
  effectiveMonthlyContributions: number
  contributionsInferredFromSalary: boolean
  isGoalMet: boolean
  isReachable: boolean
  breakdown: GoalBreakdown
  monthlySeries: GoalTimelinePoint[] | null
}

export interface SavedGoalRun {
  id: string
  savedAt: string
  result: SavingsGoalResult
  /** Profile version used for this run; omitted on runs saved before versioning. */
  profileVersion?: number
}
