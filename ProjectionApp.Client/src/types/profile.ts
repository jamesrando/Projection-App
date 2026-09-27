export interface UserProfile {
  id: string
  annualSalary: number | null
  currentInvestments: number | null
  currentCashSavings: number | null
  investmentInterestRate: number | null
  savingsInterestRate: number | null
  monthlyInvestmentContributions: number | null
  monthlyCashFlow: number | null
  totalPosition: number
}

export interface SaveUserProfileRequest {
  annualSalary: number | null
  currentInvestments: number | null
  currentCashSavings: number | null
  investmentInterestRate: number | null
  savingsInterestRate: number | null
  monthlyInvestmentContributions: number | null
}
