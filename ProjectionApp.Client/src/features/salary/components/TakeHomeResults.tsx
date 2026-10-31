import { formatCurrency } from '@/shared/lib/format/currency'
import { StatCard } from '@/shared/ui/StatCard'
import type { TakeHomeResult } from '../types'
import { BudgetSplitBar } from './BudgetSplitBar'

export function TakeHomeResults({ result }: { result: TakeHomeResult }) {
  const { taxBreakdown, budgetSplit } = result

  return (
    <div className="goal-results-stack">
      <section className="goal-panel">
        <header className="goal-panel__header">
          <h3 className="goal-panel__title">Take-home summary</h3>
          <p className="goal-panel__description">
            Estimated net income after UK income tax and National Insurance ({result.taxYear}).
          </p>
        </header>
        <div className="goal-panel__body">
          <div className="goal-hero__stats">
            <StatCard label="Gross annual" value={formatCurrency(result.annualGrossSalary)} />
            <StatCard label="Income tax" value={formatCurrency(taxBreakdown.incomeTaxAnnual)} />
            <StatCard
              label="National Insurance"
              value={formatCurrency(taxBreakdown.nationalInsuranceAnnual)}
            />
            <StatCard
              label="Net take-home (annual)"
              value={formatCurrency(result.netAnnual)}
              tone="money"
            />
          </div>
          <div className="salary-hero-stat">
            <StatCard
              label="Net take-home (monthly)"
              value={formatCurrency(result.netMonthly, true)}
              tone="accent"
            />
          </div>
        </div>
      </section>

      <section className="goal-panel">
        <header className="goal-panel__header">
          <h3 className="goal-panel__title">Recommended 50/30/20 budget</h3>
          <p className="goal-panel__description">
            A simple split of your monthly net income across essentials, discretionary spending,
            and savings.
          </p>
        </header>
        <div className="goal-panel__body">
          <BudgetSplitBar split={budgetSplit} />
          <div className="goal-detail-grid salary-budget-grid">
            <StatCard
              label="Needs (monthly)"
              value={formatCurrency(budgetSplit.needs.monthly, true)}
            />
            <StatCard
              label="Wants (monthly)"
              value={formatCurrency(budgetSplit.wants.monthly, true)}
            />
            <StatCard
              label="Savings (monthly)"
              value={formatCurrency(budgetSplit.savings.monthly, true)}
              tone="money"
            />
          </div>
        </div>
      </section>

      <p className="salary-disclaimer">
        Estimate only. Based on {result.taxYear} UK tax rates for England, Wales, and Northern
        Ireland. Does not include pension contributions, student loan repayments, or benefits in
        kind.
      </p>
    </div>
  )
}
