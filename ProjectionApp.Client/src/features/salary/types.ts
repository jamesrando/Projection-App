export interface BudgetCategory {
  percent: number
  annual: number
  monthly: number
}

export interface BudgetSplit {
  needs: BudgetCategory
  wants: BudgetCategory
  savings: BudgetCategory
}

export interface TaxBreakdown {
  incomeTaxAnnual: number
  nationalInsuranceAnnual: number
  totalDeductionsAnnual: number
  incomeTaxMonthly: number
  nationalInsuranceMonthly: number
  totalDeductionsMonthly: number
}

export interface TakeHomeResult {
  annualGrossSalary: number
  taxBreakdown: TaxBreakdown
  netAnnual: number
  netMonthly: number
  budgetSplit: BudgetSplit
  taxYear: string
}
