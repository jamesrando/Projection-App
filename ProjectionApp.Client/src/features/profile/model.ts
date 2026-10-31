import {
  applyInvestmentRollupToForm,
  holdingRowToDto,
  holdingRowFromDto,
  type InvestmentsEntryMode,
  type InvestmentHoldingRow,
} from './investmentHoldings'
import type { SaveUserProfileRequest, UserProfile } from './types'

export interface ProfileFormState {
  annualSalary: number | null
  currentInvestments: number | null
  currentCashSavings: number | null
  investmentInterestRate: number | null
  savingsInterestRate: number | null
  monthlyInvestmentContributions: number | null
  investmentsEntryMode: InvestmentsEntryMode
  investmentHoldings: InvestmentHoldingRow[]
}

export const emptyProfileForm = (): ProfileFormState => ({
  annualSalary: null,
  currentInvestments: null,
  currentCashSavings: null,
  investmentInterestRate: null,
  savingsInterestRate: null,
  monthlyInvestmentContributions: null,
  investmentsEntryMode: 'simple',
  investmentHoldings: [],
})

export function profileToFormState(profile: UserProfile): ProfileFormState {
  const investmentsEntryMode: InvestmentsEntryMode = profile.useInvestmentBreakdown
    ? 'breakdown'
    : 'simple'

  return {
    annualSalary: profile.annualSalary,
    currentInvestments: profile.currentInvestments,
    currentCashSavings: profile.currentCashSavings,
    investmentInterestRate: profile.investmentInterestRate,
    savingsInterestRate: profile.savingsInterestRate,
    monthlyInvestmentContributions: profile.monthlyInvestmentContributions,
    investmentsEntryMode,
    investmentHoldings: profile.investmentHoldings?.map(holdingRowFromDto) ?? [],
  }
}

export function formStateToSaveRequest(form: ProfileFormState): SaveUserProfileRequest {
  const rolled = applyInvestmentRollupToForm(form)
  const useInvestmentBreakdown = rolled.investmentsEntryMode === 'breakdown'

  return {
    annualSalary: rolled.annualSalary,
    currentInvestments: useInvestmentBreakdown
      ? rolled.currentInvestments
      : form.currentInvestments,
    investmentInterestRate: useInvestmentBreakdown
      ? rolled.investmentInterestRate
      : form.investmentInterestRate,
    monthlyInvestmentContributions: useInvestmentBreakdown
      ? rolled.monthlyInvestmentContributions
      : form.monthlyInvestmentContributions,
    currentCashSavings: rolled.currentCashSavings,
    savingsInterestRate: rolled.savingsInterestRate,
    investmentHoldings:
      rolled.investmentHoldings.length > 0
        ? rolled.investmentHoldings.map(holdingRowToDto)
        : null,
    useInvestmentBreakdown,
  }
}

export function totalPosition(profile: ProfileFormState): number | null {
  const { currentInvestments, currentCashSavings } = applyInvestmentRollupToForm(profile)

  if (currentInvestments === null && currentCashSavings === null) {
    return null
  }

  return (currentInvestments ?? 0) + (currentCashSavings ?? 0)
}

/** Minimum inputs required on the finances step before later tabs unlock. */
export function hasMinimumFinancesInputs(profile: ProfileFormState): boolean {
  const rolled = applyInvestmentRollupToForm(profile)
  return rolled.currentInvestments !== null || rolled.currentCashSavings !== null
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
