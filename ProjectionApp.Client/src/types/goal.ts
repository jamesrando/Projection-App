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
}

export interface Reach100kGoalResult {
  targetAmount: number
  currentPosition: number
  remainingAmount: number
  progressPercent: number
  monthlyCashFlow: number | null
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
}
