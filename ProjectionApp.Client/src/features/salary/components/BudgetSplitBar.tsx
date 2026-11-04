import { formatCurrency } from '@/shared/lib/format/currency'
import { formatSharePercent } from '@/shared/lib/format/share'
import type { BudgetSplit } from '../types'

interface BudgetSplitBarProps {
  split: BudgetSplit
}

export function BudgetSplitBar({ split }: BudgetSplitBarProps) {
  const categories = [
    {
      key: 'needs',
      label: 'Needs',
      description: 'Rent, bills, groceries, transport',
      amount: split.needs.annual,
      share: split.needs.percent,
      segmentClass: 'goal-split__segment--needs',
      dotClass: 'goal-split__dot--needs',
    },
    {
      key: 'wants',
      label: 'Wants',
      description: 'Dining out, subscriptions, hobbies',
      amount: split.wants.annual,
      share: split.wants.percent,
      segmentClass: 'goal-split__segment--wants',
      dotClass: 'goal-split__dot--wants',
    },
    {
      key: 'savings',
      label: 'Savings',
      description: 'Emergency fund, investments, debt overpayment',
      amount: split.savings.annual,
      share: split.savings.percent,
      segmentClass: 'goal-split__segment--budget-savings',
      dotClass: 'goal-split__dot--budget-savings',
    },
  ] as const

  return (
    <div className="goal-split">
      <div
        className="goal-split__bar"
        role="img"
        aria-label={`Needs ${formatSharePercent(split.needs.percent, 0)}, wants ${formatSharePercent(split.wants.percent, 0)}, savings ${formatSharePercent(split.savings.percent, 0)}`}
      >
        {categories.map((category) =>
          category.share > 0 ? (
            <span
              key={category.key}
              className={`goal-split__segment ${category.segmentClass}`}
              style={{ width: `${category.share}%` }}
            />
          ) : null,
        )}
      </div>
      <ul className="goal-split__legend">
        {categories.map((category) => (
          <li key={category.key} className="goal-split__legend-item">
            <span className={`goal-split__dot ${category.dotClass}`} aria-hidden="true" />
            <div className="goal-split__legend-copy">
              <span className="goal-split__legend-label">{category.label}</span>
              <span className="goal-split__legend-value">{formatCurrency(category.amount)}</span>
              <span className="goal-split__legend-hint">{category.description}</span>
            </div>
            <span className="goal-split__legend-share">
              {formatSharePercent(category.share, 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
