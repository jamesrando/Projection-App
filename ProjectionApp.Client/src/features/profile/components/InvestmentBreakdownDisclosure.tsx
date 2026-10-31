import { useId, useState } from 'react'
import { formatCurrency } from '@/shared/lib/format/currency'
import { formatPercent } from '@/shared/lib/format/percent'
import {
  getInvestmentSummaryLines,
  rollupInvestmentHoldings,
  type InvestmentHoldingRow,
} from '../investmentHoldings'

interface InvestmentBreakdownDisclosureProps {
  holdings: InvestmentHoldingRow[]
  className?: string
}

export function InvestmentBreakdownDisclosure({
  holdings,
  className,
}: InvestmentBreakdownDisclosureProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const lines = getInvestmentSummaryLines(holdings)
  const rollup = rollupInvestmentHoldings(holdings)

  if (lines.length === 0) {
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
            Investment breakdown
          </span>
          <span className="investment-breakdown-disclosure__trigger-hint">
            {formatCurrency(rollup.totalBalance, true)} balance
            {rollup.totalMonthlyContributions !== null && (
              <> · {formatCurrency(rollup.totalMonthlyContributions, true)}/mo</>
            )}
          </span>
        </span>
      </button>

      {open && (
        <div id={panelId} className="investment-breakdown-disclosure__panel">
          <table className="investment-breakdown-disclosure__table">
            <caption className="investment-breakdown-disclosure__caption">
              How your investment balance and monthly contributions are added up
            </caption>
            <thead>
              <tr>
                <th scope="col">Account</th>
                <th scope="col">Balance</th>
                <th scope="col">Return</th>
                <th scope="col">Monthly</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id}>
                  <th scope="row">{line.label}</th>
                  <td>{formatCurrency(line.balance, true)}</td>
                  <td>{formatPercent(line.annualReturnRate)}</td>
                  <td>{formatCurrency(line.monthlyContribution, true)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total</th>
                <td>{formatCurrency(rollup.totalBalance, true)}</td>
                <td>{formatPercent(rollup.weightedAnnualReturnRate)}</td>
                <td>{formatCurrency(rollup.totalMonthlyContributions, true)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
