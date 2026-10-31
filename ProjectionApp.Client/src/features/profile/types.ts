export interface InvestmentHoldingDto {
  id: string
  category: string
  customLabel: string | null
  balance: number | null
  annualReturnRate: number | null
  monthlyContribution: number | null
}

export interface UserProfile {
  id: string
  annualSalary: number | null
  currentInvestments: number | null
  currentCashSavings: number | null
  investmentInterestRate: number | null
  savingsInterestRate: number | null
  monthlyInvestmentContributions: number | null
  investmentHoldings: InvestmentHoldingDto[] | null
  useInvestmentBreakdown: boolean
  totalPosition: number
  hasMinimumGoalInputs: boolean
}

export interface SaveUserProfileRequest {
  annualSalary: number | null
  currentInvestments: number | null
  currentCashSavings: number | null
  investmentInterestRate: number | null
  savingsInterestRate: number | null
  monthlyInvestmentContributions: number | null
  investmentHoldings: InvestmentHoldingDto[] | null
  useInvestmentBreakdown: boolean
}
