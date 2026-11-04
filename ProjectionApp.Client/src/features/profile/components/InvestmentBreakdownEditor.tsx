import { CurrencyField } from '@/shared/ui/CurrencyField'
import { PercentField } from '@/shared/ui/PercentField'
import { formatCurrency } from '@/shared/lib/format/currency'
import { formatPercent } from '@/shared/lib/format/percent'
import {
  createInvestmentHoldingRow,
  INVESTMENT_CATEGORY_OPTIONS,
  investmentCategoryLabel,
  rollupInvestmentHoldings,
  type InvestmentCategory,
  type InvestmentHoldingRow,
} from '../investmentHoldings'

interface InvestmentBreakdownEditorProps {
  holdings: InvestmentHoldingRow[]
  disabled?: boolean
  rowErrors: Partial<Record<string, Partial<Record<'balance' | 'annualReturnRate' | 'monthlyContribution', string>>>>
  onChange: (holdings: InvestmentHoldingRow[]) => void
  onRowFieldError: (
    rowId: string,
    field: 'balance' | 'annualReturnRate' | 'monthlyContribution',
    message: string | null,
  ) => void
}

function updateRow(
  holdings: InvestmentHoldingRow[],
  rowId: string,
  patch: Partial<InvestmentHoldingRow>,
): InvestmentHoldingRow[] {
  return holdings.map((row) => (row.id === rowId ? { ...row, ...patch } : row))
}

export function InvestmentBreakdownEditor({
  holdings,
  disabled = false,
  rowErrors,
  onChange,
  onRowFieldError,
}: InvestmentBreakdownEditorProps) {
  const rollup = rollupInvestmentHoldings(holdings)

  return (
    <div className="investment-breakdown">
      <p className="investment-breakdown__rollup">
        Combined total{' '}
        <strong>{formatCurrency(rollup.totalBalance, true)}</strong>
        {rollup.weightedAnnualReturnRate !== null && (
          <>
            {' '}
            at <strong>{formatPercent(rollup.weightedAnnualReturnRate)}</strong> weighted return
          </>
        )}
        {rollup.totalMonthlyContributions !== null && (
          <>
            {' '}
            with <strong>{formatCurrency(rollup.totalMonthlyContributions, true)}</strong>/mo added
          </>
        )}
      </p>

      <ul className="investment-breakdown__list">
        {holdings.map((row, index) => {
          const errors = rowErrors[row.id] ?? {}
          const showCustomLabel = row.category === 'other'

          return (
            <li key={row.id} className="investment-breakdown__row">
              <div className="investment-breakdown__row-header">
                <p className="investment-breakdown__row-title">
                  {investmentCategoryLabel(row.category, row.customLabel) || `Holding ${index + 1}`}
                </p>
                <button
                  type="button"
                  className="investment-breakdown__remove"
                  disabled={disabled || holdings.length <= 1}
                  onClick={() => onChange(holdings.filter((holding) => holding.id !== row.id))}
                >
                  Remove
                </button>
              </div>

              <div className="investment-breakdown__row-grid">
                <div className="investment-breakdown__field investment-breakdown__field--category">
                  <label htmlFor={`${row.id}-category`}>Type</label>
                  <select
                    id={`${row.id}-category`}
                    className="investment-breakdown__select"
                    disabled={disabled}
                    value={row.category}
                    onChange={(event) =>
                      onChange(
                        updateRow(holdings, row.id, {
                          category: event.target.value as InvestmentCategory,
                        }),
                      )
                    }
                  >
                    {INVESTMENT_CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {showCustomLabel && (
                  <div className="investment-breakdown__field investment-breakdown__field--label">
                    <label htmlFor={`${row.id}-label`}>Label</label>
                    <input
                      id={`${row.id}-label`}
                      className="investment-breakdown__text-input"
                      type="text"
                      disabled={disabled}
                      placeholder="e.g. Trading account"
                      value={row.customLabel ?? ''}
                      onChange={(event) =>
                        onChange(
                          updateRow(holdings, row.id, {
                            customLabel: event.target.value.trim() === '' ? null : event.target.value,
                          }),
                        )
                      }
                    />
                  </div>
                )}

                <CurrencyField
                  id={`${row.id}-balance`}
                  label="Balance"
                  hint="Current value in this account or asset."
                  value={row.balance}
                  disabled={disabled}
                  error={errors.balance}
                  onChange={(value) => onChange(updateRow(holdings, row.id, { balance: value }))}
                  onError={(message) => onRowFieldError(row.id, 'balance', message)}
                />

                <PercentField
                  id={`${row.id}-rate`}
                  label="Expected return"
                  hint="Annual return, compounded monthly."
                  value={row.annualReturnRate}
                  disabled={disabled}
                  error={errors.annualReturnRate}
                  onChange={(value) =>
                    onChange(updateRow(holdings, row.id, { annualReturnRate: value }))
                  }
                  onError={(message) => onRowFieldError(row.id, 'annualReturnRate', message)}
                />

                <CurrencyField
                  id={`${row.id}-contribution`}
                  label="Monthly contribution"
                  hint="Optional. Added to this holding each month."
                  value={row.monthlyContribution}
                  disabled={disabled}
                  error={errors.monthlyContribution}
                  onChange={(value) =>
                    onChange(updateRow(holdings, row.id, { monthlyContribution: value }))
                  }
                  onError={(message) => onRowFieldError(row.id, 'monthlyContribution', message)}
                />
              </div>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        className="investment-breakdown__add"
        disabled={disabled}
        onClick={() => onChange([...holdings, createInvestmentHoldingRow()])}
      >
        Add another holding
      </button>
    </div>
  )
}
