import { useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '@/shared/lib/format/currency'
import { CHART_AREA_OPACITY, CHART_COLORS } from '../lib/chartColors'
import {
  DEFAULT_ANNUAL_INFLATION_PERCENT,
  MAX_ANNUAL_INFLATION_PERCENT,
  MIN_ANNUAL_INFLATION_PERCENT,
  discountToToday,
} from '../lib/realMoney'
import type { GoalTimelinePoint } from '../types'

type MoneyBasis = 'nominal' | 'real'

interface GoalTimelineChartProps {
  monthlySeries: GoalTimelinePoint[]
  targetAmount: number
  currentPosition: number
  estimatedMonthsToGoal: number | null
  isReachable: boolean
  baselineSeries?: GoalTimelinePoint[]
}

interface ChartPoint {
  month: number
  investments: number
  savings: number
  total: number
  baselineTotal: number | null
  principal: number
  interest: number
}

function formatMonthAxis(month: number, maxMonth: number): string {
  if (month === 0) {
    return 'Now'
  }

  if (maxMonth <= 24) {
    return `M${month}`
  }

  const years = month / 12
  return years < 10 ? `${years.toFixed(1)}y` : `${Math.round(years)}y`
}

function inBasis(amount: number, month: number, annualInflationPercent: number | null): number {
  if (annualInflationPercent === null) {
    return amount
  }

  return discountToToday(amount, month, annualInflationPercent)
}

function buildChartData(
  monthlySeries: GoalTimelinePoint[],
  currentPosition: number,
  baselineSeries: GoalTimelinePoint[] | undefined,
  annualInflationPercent: number | null,
): ChartPoint[] {
  const baselineByMonth = new Map(
    baselineSeries?.map((point) => [point.month, point.totalPosition]) ?? [],
  )

  return monthlySeries.map((point) => {
    const baselineTotal = baselineByMonth.get(point.month)
    return {
      month: point.month,
      investments: inBasis(point.investments, point.month, annualInflationPercent),
      savings: inBasis(point.savings, point.month, annualInflationPercent),
      total: inBasis(point.totalPosition, point.month, annualInflationPercent),
      baselineTotal:
        baselineTotal === undefined
          ? null
          : inBasis(baselineTotal, point.month, annualInflationPercent),
      principal: inBasis(
        currentPosition + point.cumulativeContributions,
        point.month,
        annualInflationPercent,
      ),
      interest: inBasis(point.cumulativeInterest, point.month, annualInflationPercent),
    }
  })
}

function yDomain(targetAmount: number): [number, (dataMax: number) => number] {
  return [
    0,
    (dataMax) => {
      const top = Math.max(dataMax, targetAmount)
      return top <= 0 ? 1 : top * 1.08
    },
  ]
}

function comparisonTimelinePoint(
  monthlySeries: GoalTimelinePoint[],
  estimatedMonthsToGoal: number | null,
): GoalTimelinePoint | undefined {
  if (estimatedMonthsToGoal !== null) {
    const atGoal = monthlySeries.find((point) => point.month === estimatedMonthsToGoal)
    if (atGoal) {
      return atGoal
    }
  }

  return monthlySeries[monthlySeries.length - 1]
}

function formatHorizon(month: number): string {
  if (month < 24) {
    return month === 1 ? '1 month' : `${month} months`
  }

  const years = month / 12
  const text = years.toFixed(1).replace(/\.0$/, '')
  return `${text} years`
}

function formatInflationPercent(percent: number): string {
  return percent.toFixed(1).replace(/\.0$/, '')
}

function realBasisNote(point: GoalTimelinePoint | undefined, inflationPercent: number): string {
  const rate = formatInflationPercent(inflationPercent)
  if (!point || point.month <= 0) {
    return `Amounts are today's purchasing power, discounted at ${rate}% a year. The goal line stays at the target you entered.`
  }

  const today = discountToToday(point.totalPosition, point.month, inflationPercent)
  return `Discounted at ${rate}% a year. After ${formatHorizon(point.month)} the projected balance is ${formatCurrency(today)} in today's money (${formatCurrency(point.totalPosition)} in future pounds). The goal line stays at the target you entered.`
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) {
    return `£${(value / 1_000_000).toFixed(1)}m`
  }

  if (value >= 1_000) {
    return `£${Math.round(value / 1_000)}k`
  }

  return formatCurrency(value)
}

interface TimelineTooltipProps {
  active?: boolean
  payload?: Array<{ payload: ChartPoint }>
  showBaseline?: boolean
  moneyBasis?: MoneyBasis
}

function TimelineTooltip({ active, payload, showBaseline, moneyBasis }: TimelineTooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

  const point = payload[0]?.payload
  if (!point) {
    return null
  }

  return (
    <div className="goal-chart__tooltip">
      <p className="goal-chart__tooltip-title">
        {point.month === 0 ? 'Starting position' : `Month ${point.month}`}
        {moneyBasis === 'real' ? " · today's pounds" : ''}
      </p>
      <dl className="goal-chart__tooltip-list">
        <div>
          <dt>{showBaseline ? 'What-if total' : 'Total'}</dt>
          <dd>{formatCurrency(point.total)}</dd>
        </div>
        {showBaseline && point.baselineTotal !== null && (
          <div>
            <dt>Current plan</dt>
            <dd>{formatCurrency(point.baselineTotal)}</dd>
          </div>
        )}
        <div>
          <dt>Investments</dt>
          <dd>{formatCurrency(point.investments)}</dd>
        </div>
        <div>
          <dt>Cash savings</dt>
          <dd>{formatCurrency(point.savings)}</dd>
        </div>
        <div>
          <dt>Money in</dt>
          <dd>{formatCurrency(point.principal)}</dd>
        </div>
        <div>
          <dt>Interest earned</dt>
          <dd>{formatCurrency(point.interest)}</dd>
        </div>
      </dl>
    </div>
  )
}

export function GoalTimelineChart({
  monthlySeries,
  targetAmount,
  currentPosition,
  estimatedMonthsToGoal,
  isReachable,
  baselineSeries,
}: GoalTimelineChartProps) {
  const [moneyBasis, setMoneyBasis] = useState<MoneyBasis>('nominal')
  const [inflationInput, setInflationInput] = useState(String(DEFAULT_ANNUAL_INFLATION_PERCENT))
  const [inflationPercent, setInflationPercent] = useState(DEFAULT_ANNUAL_INFLATION_PERCENT)
  const showBaseline = Boolean(baselineSeries?.length)
  const annualInflationPercent = moneyBasis === 'real' ? inflationPercent : null
  const chartData = buildChartData(
    monthlySeries,
    currentPosition,
    baselineSeries,
    annualInflationPercent,
  )
  const maxMonth = chartData[chartData.length - 1]?.month ?? 0
  const showGoalMonthMarker =
    moneyBasis === 'nominal' &&
    isReachable &&
    estimatedMonthsToGoal !== null &&
    estimatedMonthsToGoal > 0
  const comparisonPoint = comparisonTimelinePoint(monthlySeries, estimatedMonthsToGoal)

  return (
    <div className="goal-chart">
      <div className="goal-chart__toolbar">
        <div className="goal-chart__basis" role="group" aria-label="Money basis">
          <button
            type="button"
            aria-pressed={moneyBasis === 'nominal'}
            onClick={() => setMoneyBasis('nominal')}
          >
            Future pounds
          </button>
          <button
            type="button"
            aria-pressed={moneyBasis === 'real'}
            onClick={() => setMoneyBasis('real')}
          >
            Today's money
          </button>
        </div>
        {moneyBasis === 'real' && (
          <label className="goal-chart__inflation" htmlFor="goal-inflation-rate">
            Inflation
            <input
              id="goal-inflation-rate"
              type="number"
              min={MIN_ANNUAL_INFLATION_PERCENT}
              max={MAX_ANNUAL_INFLATION_PERCENT}
              step={0.1}
              value={inflationInput}
              onChange={(event) => {
                const raw = event.target.value
                setInflationInput(raw)
                const parsed = Number(raw)
                if (raw.trim() === '' || !Number.isFinite(parsed)) {
                  return
                }

                setInflationPercent(
                  Math.min(
                    MAX_ANNUAL_INFLATION_PERCENT,
                    Math.max(MIN_ANNUAL_INFLATION_PERCENT, parsed),
                  ),
                )
              }}
              onBlur={() => setInflationInput(formatInflationPercent(inflationPercent))}
            />
            % a year
          </label>
        )}
      </div>

      <p className="goal-chart__basis-note">
        {moneyBasis === 'nominal'
          ? 'Amounts are future pounds. A balance years from now will not buy what the same figure buys today.'
          : realBasisNote(comparisonPoint, inflationPercent)}
      </p>

      {!isReachable && (
        <p className="goal-chart__notice">
          Projection does not reach the goal within 100 years with current assumptions.
        </p>
      )}

      <div
        className="goal-chart__canvas"
        role="img"
        aria-label={
          showBaseline
            ? moneyBasis === 'real'
              ? "What-if balance compared with your current plan, in today's pounds"
              : 'What-if balance compared with your current plan, in future pounds'
            : moneyBasis === 'real'
              ? "Balance growth over time in today's pounds"
              : 'Balance growth over time in future pounds'
        }
      >
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartData} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="month"
              tickFormatter={(month) => formatMonthAxis(Number(month), maxMonth)}
              tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
              axisLine={{ stroke: CHART_COLORS.grid }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              domain={yDomain(targetAmount)}
              tickFormatter={formatYAxis}
              tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip
              content={<TimelineTooltip showBaseline={showBaseline} moneyBasis={moneyBasis} />}
            />

            <Area
              type="monotone"
              dataKey="savings"
              name="Cash savings"
              stackId="balance"
              fill={CHART_COLORS.savings}
              fillOpacity={CHART_AREA_OPACITY.savings}
              stroke={CHART_COLORS.savings}
              strokeWidth={1.5}
              activeDot={false}
            />
            <Area
              type="monotone"
              dataKey="investments"
              name="Investments"
              stackId="balance"
              fill={CHART_COLORS.investments}
              fillOpacity={CHART_AREA_OPACITY.investments}
              stroke={CHART_COLORS.investments}
              strokeWidth={1.5}
              activeDot={{ r: 4, stroke: CHART_COLORS.goal, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="interest"
              name="Interest earned"
              stroke={CHART_COLORS.interest}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
            {showBaseline && (
              <Line
                type="monotone"
                dataKey="baselineTotal"
                name="Current plan"
                stroke={CHART_COLORS.baseline}
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                activeDot={{ r: 4 }}
                connectNulls
              />
            )}

            <ReferenceLine
              y={targetAmount}
              stroke={CHART_COLORS.goal}
              strokeDasharray="6 4"
              label={{
                value: 'Goal',
                position: 'insideTopLeft',
                fill: CHART_COLORS.goal,
                fontSize: 12,
              }}
            />

            {showGoalMonthMarker && (
              <ReferenceLine
                x={estimatedMonthsToGoal!}
                stroke={CHART_COLORS.goal}
                strokeDasharray="4 4"
                strokeOpacity={0.35}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {showBaseline && (
        <p className="goal-chart__compare-note">
          Filled areas are this what-if. The dashed line is your current plan.
        </p>
      )}

      <ul className="goal-chart__legend">
        <li>
          <span
            className="goal-chart__swatch"
            style={{ backgroundColor: CHART_COLORS.investments }}
            aria-hidden="true"
          />
          <span>Investments</span>
        </li>
        <li>
          <span
            className="goal-chart__swatch"
            style={{ backgroundColor: CHART_COLORS.savings }}
            aria-hidden="true"
          />
          <span>Cash savings</span>
        </li>
        <li>
          <span
            className="goal-chart__swatch"
            style={{ backgroundColor: CHART_COLORS.interest }}
            aria-hidden="true"
          />
          <span>Interest earned</span>
        </li>
        <li>
          <span className="goal-chart__swatch goal-chart__swatch--goal" aria-hidden="true" />
          <span>Goal</span>
        </li>
        {showBaseline && (
          <li>
            <span className="goal-chart__swatch goal-chart__swatch--baseline" aria-hidden="true" />
            <span>Current plan</span>
          </li>
        )}
      </ul>
    </div>
  )
}
