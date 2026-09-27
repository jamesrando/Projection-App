import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '../format/currency'
import type { MonthlyProjectionPoint } from '../types/goal'
import { CHART_AREA_OPACITY, CHART_COLORS } from './chartColors'

interface GoalTimelineChartProps {
  monthlySeries: MonthlyProjectionPoint[]
  targetAmount: number
  currentPosition: number
  estimatedMonthsToGoal: number | null
  isReachable: boolean
}

interface ChartPoint {
  month: number
  investments: number
  savings: number
  total: number
  principal: number
  interest: number
}

interface Milestone {
  amount: number
  label: string
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

function buildChartData(
  monthlySeries: MonthlyProjectionPoint[],
  currentPosition: number,
): ChartPoint[] {
  return monthlySeries.map((point) => ({
    month: point.month,
    investments: point.investments,
    savings: point.savings,
    total: point.totalPosition,
    principal: currentPosition + point.cumulativeContributions,
    interest: point.cumulativeInterest,
  }))
}

function buildMilestones(targetAmount: number): Milestone[] {
  const milestones: Milestone[] = []

  if (targetAmount * 0.5 >= 1) {
    milestones.push({ amount: targetAmount * 0.5, label: '50% there' })
  }

  if (targetAmount * 0.75 >= 1) {
    milestones.push({ amount: targetAmount * 0.75, label: formatCurrency(targetAmount * 0.75) })
  }

  milestones.push({ amount: targetAmount, label: 'Goal' })

  return milestones
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
}

function TimelineTooltip({ active, payload }: TimelineTooltipProps) {
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
      </p>
      <dl className="goal-chart__tooltip-list">
        <div>
          <dt>Total</dt>
          <dd>{formatCurrency(point.total)}</dd>
        </div>
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
}: GoalTimelineChartProps) {
  const chartData = buildChartData(monthlySeries, currentPosition)
  const milestones = buildMilestones(targetAmount)
  const maxMonth = chartData[chartData.length - 1]?.month ?? 0
  const showGoalMonthMarker =
    isReachable && estimatedMonthsToGoal !== null && estimatedMonthsToGoal > 0

  return (
    <div className="goal-chart">
      {!isReachable && (
        <p className="goal-chart__notice">
          Projection does not reach the goal within 100 years with current assumptions.
        </p>
      )}

      <div className="goal-chart__canvas" role="img" aria-label="Balance growth over time chart">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
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
              tickFormatter={formatYAxis}
              tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip content={<TimelineTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '0.8125rem', color: CHART_COLORS.muted }}
              iconType="circle"
              iconSize={8}
            />

            <Area
              type="monotone"
              dataKey="principal"
              name="Money in"
              stackId="composition"
              fill={CHART_COLORS.contributions}
              fillOpacity={CHART_AREA_OPACITY.contributions}
              stroke={CHART_COLORS.contributions}
              strokeOpacity={0.5}
              strokeWidth={1}
            />
            <Area
              type="monotone"
              dataKey="interest"
              name="Interest earned"
              stackId="composition"
              fill={CHART_COLORS.interest}
              fillOpacity={CHART_AREA_OPACITY.interest}
              stroke={CHART_COLORS.interest}
              strokeOpacity={0.5}
              strokeWidth={1}
            />

            <Line
              type="monotone"
              dataKey="investments"
              name="Investments"
              stroke={CHART_COLORS.investments}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="savings"
              name="Cash savings"
              stroke={CHART_COLORS.savings}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total"
              stroke={CHART_COLORS.total}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />

            {milestones.map((milestone) => (
              <ReferenceLine
                key={milestone.label}
                y={milestone.amount}
                stroke={CHART_COLORS.muted}
                strokeDasharray="6 4"
                strokeOpacity={0.55}
                label={{
                  value: milestone.label,
                  position: 'insideTopRight',
                  fill: CHART_COLORS.muted,
                  fontSize: 11,
                }}
              />
            ))}

            {showGoalMonthMarker && (
              <ReferenceLine
                x={estimatedMonthsToGoal!}
                stroke={CHART_COLORS.savings}
                strokeDasharray="4 4"
                label={{
                  value: 'Goal reached',
                  position: 'insideTopLeft',
                  fill: CHART_COLORS.savings,
                  fontSize: 11,
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <ul className="goal-chart__legend">
        <li>
          <span
            className="goal-chart__swatch"
            style={{ backgroundColor: CHART_COLORS.contributions }}
            aria-hidden="true"
          />
          <span>Money in</span>
        </li>
        <li>
          <span
            className="goal-chart__swatch"
            style={{ backgroundColor: CHART_COLORS.interest }}
            aria-hidden="true"
          />
          <span>Interest earned</span>
        </li>
      </ul>
    </div>
  )
}
