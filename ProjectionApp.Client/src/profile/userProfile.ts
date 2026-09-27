export interface ProfileFormState {
  annualSalary: number | null
  currentInvestments: number | null
  currentCashSavings: number | null
  investmentInterestRate: number | null
  savingsInterestRate: number | null
  monthlyInvestmentContributions: number | null
}

export const emptyProfileForm = (): ProfileFormState => ({
  annualSalary: null,
  currentInvestments: null,
  currentCashSavings: null,
  investmentInterestRate: null,
  savingsInterestRate: null,
  monthlyInvestmentContributions: null,
})

export function monthlyCashFlow(annualSalary: number | null): number | null {
  if (annualSalary === null) {
    return null
  }

  return annualSalary / 12
}

export function totalPosition(profile: ProfileFormState): number | null {
  const { currentInvestments, currentCashSavings } = profile

  if (currentInvestments === null && currentCashSavings === null) {
    return null
  }

  return (currentInvestments ?? 0) + (currentCashSavings ?? 0)
}

export function hasAnyBalance(profile: ProfileFormState): boolean {
  return (
    profile.annualSalary !== null ||
    profile.currentInvestments !== null ||
    profile.currentCashSavings !== null
  )
}
