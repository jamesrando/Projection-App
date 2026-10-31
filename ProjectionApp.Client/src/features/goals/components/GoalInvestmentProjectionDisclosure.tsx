import { useId, useState } from 'react'
import { investmentCategoryLabelFromApi } from '@/features/profile/investmentHoldings'
import { formatCurrency } from '@/shared/lib/format/currency'
import { formatSharePercent } from '@/shared/lib/format/share'
import type { InvestmentHoldingProjection } from '../types'

interface GoalInvestmentProjectionDisclosureProps {
  projections: InvestmentHoldingProjection[]
  projectedInvestmentsTotal: number
  className?: string
}

export function GoalInvestmentProjectionDisclosure({
  projections,
  projectedInvestmentsTotal,
  className,
}: GoalInvestmentProjectionDisclosureProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  if (projections.length <= 1) {
    return null
  }

  const rootClassName = ['investment-breakdown-disclosure', className].filter(Boolean).join(' ')

  return (
    <div className={rootClassName}>
      <button
        type="button"
        className="investment-breakdown-disclosure__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span
          className={`investment-breakdown-disclosure__chevron${open ? ' investment-breakdown-disclosure__chevron--open' : ''}`}
          aria-hidden="true"
        />
        <span className="investment-breakdown-disclosure__trigger-copy">
          <span className="investment-breakdown-disclosure__trigger-label">
            Investment split at goal
          </span>
          <span className="investment-breakdown-disclosure__trigger-hint">
            {formatCurrency(projectedInvestmentsTotal, true)} across {projections.length} accounts
          </span>
        </span>
      </button>

      {open && (
        <div id={panelId} className="investment-breakdown-disclosure__panel">
          <table className="investment-breakdown-disclosure__table">
            <caption className="investment-breakdown-disclosure__caption">
              Projected value of each investment account when you reach your goal
            </caption>
            <thead>
              <tr>
                <th scope="col">Account</th>
                <th scope="col">Now</th>
                <th scope="col">At goal</th>
                <th scope="col">Share</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((projection) => (
                <tr key={projection.id}>
                  <th scope="row">
                    {investmentCategoryLabelFromApi(projection.category, projection.customLabel)}
                  </th>
                  <td>{formatCurrency(projection.currentBalance, true)}</td>
                  <td>{formatCurrency(projection.projectedBalance, true)}</td>
                  <td>{formatSharePercent(projection.projectedSharePercent)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Investments total</th>
                <td>
                  {formatCurrency(
                    projections.reduce((sum, row) => sum + row.currentBalance, 0),
                    true,
                  )}
                </td>
                <td>{formatCurrency(projectedInvestmentsTotal, true)}</td>
                <td>{formatSharePercent(100)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
