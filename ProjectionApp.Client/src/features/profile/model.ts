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

export function totalPosition(profile: ProfileFormState): number | null {
  const { currentInvestments, currentCashSavings } = profile

  if (currentInvestments === null && currentCashSavings === null) {
    return null
  }

  return (currentInvestments ?? 0) + (currentCashSavings ?? 0)
}

/** Minimum inputs required on the finances step before later tabs unlock. */
export function hasMinimumFinancesInputs(profile: ProfileFormState): boolean {
  return profile.currentInvestments !== null || profile.currentCashSavings !== null
}

export function financesEstablished(
  profile: ProfileFormState,
  sync: { savedToServer: boolean; saving: boolean; savePending: boolean },
): boolean {
  return (
    hasMinimumFinancesInputs(profile) &&
    sync.savedToServer &&
    !sync.saving &&
    !sync.savePending
  )
}
