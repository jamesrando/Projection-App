import { formatCurrency } from '../format/currency'
import { formatSharePercent } from '../format/share'

export interface InvestmentsSavingsSplitProps {
  investments: number
  savings: number
  investmentsShare: number
  savingsShare: number
  className?: string
}

export function InvestmentsSavingsSplit({
  investments,
  savings,
  investmentsShare,
  savingsShare,
  className,
}: InvestmentsSavingsSplitProps) {
  const rootClassName = ['goal-split', className].filter(Boolean).join(' ')

  return (
    <div className={rootClassName}>
      <div
        className="goal-split__bar"
        role="img"
        aria-label={`Investments ${formatSharePercent(investmentsShare)}, savings ${formatSharePercent(savingsShare)}`}
      >
        {investmentsShare > 0 && (
          <span
            className="goal-split__segment goal-split__segment--investments"
            style={{ width: `${investmentsShare}%` }}
          />
        )}
        {savingsShare > 0 && (
          <span
            className="goal-split__segment goal-split__segment--savings"
            style={{ width: `${savingsShare}%` }}
          />
        )}
      </div>
      <ul className="goal-split__legend">
        <li className="goal-split__legend-item">
          <span className="goal-split__dot goal-split__dot--investments" aria-hidden="true" />
          <div className="goal-split__legend-copy">
            <span className="goal-split__legend-label">Investments</span>
            <span className="goal-split__legend-value">{formatCurrency(investments)}</span>
          </div>
          <span className="goal-split__legend-share">{formatSharePercent(investmentsShare)}</span>
        </li>
        <li className="goal-split__legend-item">
          <span className="goal-split__dot goal-split__dot--savings" aria-hidden="true" />
          <div className="goal-split__legend-copy">
            <span className="goal-split__legend-label">Cash savings</span>
            <span className="goal-split__legend-value">{formatCurrency(savings)}</span>
          </div>
          <span className="goal-split__legend-share">{formatSharePercent(savingsShare)}</span>
        </li>
      </ul>
    </div>
  )
}
