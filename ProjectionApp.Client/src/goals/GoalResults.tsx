import type { ReactNode } from 'react'
import { StatCard } from '../components/StatCard'
import { formatCurrency } from '../format/currency'
import { formatPercent } from '../format/percent'
import type { GoalBreakdown, Reach100kGoalResult } from '../types/goal'
import { GoalTimelineChart } from './GoalTimelineChart'
import { formatMonthsDelta } from './useWhatIfAnalysis'

function formatYears(years: number): string {
  const text = years.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
  return `${text} ${years === 1 ? 'year' : 'years'}`
}

function formatMonths(months: number): string {
  return `${months} ${months === 1 ? 'month' : 'months'}`
}

function formatShare(value: number): string {
  return `${value.toFixed(1)}%`
}

function hasProjection(breakdown: GoalBreakdown): boolean {
  return breakdown.projectedInvestments !== null && breakdown.projectedCashSavings !== null
}

function projectedShare(amount: number, total: number): number {
  if (total <= 0) {
    return 0
  }

  return Math.round((amount / total) * 1000) / 10
}

interface PositionSplitProps {
  investments: number
  savings: number
  investmentsShare: number
  savingsShare: number
}

function PositionSplit({
  investments,
  savings,
  investmentsShare,
  savingsShare,
}: PositionSplitProps) {
  return (
    <div className="goal-split">
      <div
        className="goal-split__bar"
        role="img"
        aria-label={`Investments ${formatShare(investmentsShare)}, savings ${formatShare(savingsShare)}`}
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
          <span className="goal-split__legend-share">{formatShare(investmentsShare)}</span>
        </li>
        <li className="goal-split__legend-item">
          <span className="goal-split__dot goal-split__dot--savings" aria-hidden="true" />
          <div className="goal-split__legend-copy">
            <span className="goal-split__legend-label">Cash savings</span>
            <span className="goal-split__legend-value">{formatCurrency(savings)}</span>
          </div>
          <span className="goal-split__legend-share">{formatShare(savingsShare)}</span>
        </li>
      </ul>
    </div>
  )
}

interface AssumptionTileProps {
  label: string
  value: string
  hint: string
}

function AssumptionTile({ label, value, hint }: AssumptionTileProps) {
  return (
    <div className="goal-tile">
      <span className="goal-tile__label">{label}</span>
      <span className="goal-tile__value">{value}</span>
      <span className="goal-tile__hint">{hint}</span>
    </div>
  )
}

interface GrowthCompositionProps {
  contributions: number
  investmentInterest: number
  savingsInterest: number
}

function GrowthComposition({
  contributions,
  investmentInterest,
  savingsInterest,
}: GrowthCompositionProps) {
  const totalInterest = investmentInterest + savingsInterest
  const total = contributions + totalInterest
  if (total <= 0) {
    return null
  }

  const contributionsShare = Math.round((contributions / total) * 1000) / 10
  const interestShare = Math.round((totalInterest / total) * 1000) / 10

  return (
    <div className="goal-composition">
      <div
        className="goal-composition__bar"
        role="img"
        aria-label={`Contributions ${formatShare(contributionsShare)}, interest ${formatShare(interestShare)}`}
      >
        {contributionsShare > 0 && (
          <span
            className="goal-composition__segment goal-composition__segment--contributions"
            style={{ width: `${contributionsShare}%` }}
          />
        )}
        {interestShare > 0 && (
          <span
            className="goal-composition__segment goal-composition__segment--interest"
            style={{ width: `${interestShare}%` }}
          />
        )}
      </div>
      <ul className="goal-composition__legend">
        <li>
          <span className="goal-split__dot goal-split__dot--contributions" aria-hidden="true" />
          <span>Contributions</span>
          <strong>{formatCurrency(contributions)}</strong>
        </li>
        <li>
          <span className="goal-split__dot goal-split__dot--interest" aria-hidden="true" />
          <span>Interest earned</span>
          <strong>{formatCurrency(totalInterest)}</strong>
        </li>
      </ul>
    </div>
  )
}

function GoalPanel({
  title,
  description,
  children,
  className = '',
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`goal-panel ${className}`.trim()}>
      <header className="goal-panel__header">
        <h3 className="goal-panel__title">{title}</h3>
        {description && <p className="goal-panel__description">{description}</p>}
      </header>
      <div className="goal-panel__body">{children}</div>
    </section>
  )
}

interface GoalResultsProps {
  result: Reach100kGoalResult
  compareBaseline?: Reach100kGoalResult | null
  afterHero?: ReactNode
}

export function GoalResults({ result, compareBaseline, afterHero }: GoalResultsProps) {
  const { breakdown } = result
  const projectionAvailable = hasProjection(breakdown)
  const targetLabel = formatCurrency(result.targetAmount)
  const monthsDelta =
    compareBaseline && !compareBaseline.isGoalMet
      ? formatMonthsDelta(compareBaseline.estimatedMonthsToGoal, result.estimatedMonthsToGoal)
      : null
  const baselineSeries =
    compareBaseline?.monthlySeries && compareBaseline.monthlySeries.length > 1
      ? compareBaseline.monthlySeries
      : undefined
  const projectedTotal =
    projectionAvailable &&
    breakdown.projectedInvestments !== null &&
    breakdown.projectedCashSavings !== null
      ? breakdown.projectedInvestments + breakdown.projectedCashSavings
      : 0

  const timelineLabel = result.isGoalMet
    ? 'Goal reached'
    : !result.isReachable
      ? 'Goal unreachable'
      : result.estimatedMonthsToGoal === null
        ? 'Timeline unavailable'
        : formatYears(result.estimatedYearsToGoal!)

  const timelineDetail = result.isGoalMet
    ? `You are already at or above ${targetLabel}.`
    : !result.isReachable
      ? 'Goal may not be reachable with current assumptions within 100 years.'
      : result.estimatedMonthsToGoal === null
        ? 'Add an annual interest rate, monthly contribution, or salary so we can estimate savings.'
        : formatMonths(result.estimatedMonthsToGoal)

  return (
    <div className="goal-results-stack">
      <section className="goal-hero" aria-label="Goal summary">
        <div className="goal-hero__top">
          <div>
            <p className="goal-hero__eyebrow">Progress toward {targetLabel}</p>
            <p className="goal-hero__percent">{result.progressPercent.toFixed(1)}%</p>
          </div>
          <div
            className={`goal-hero__badge${
              result.isGoalMet ? ' goal-hero__badge--met' : !result.isReachable ? ' goal-hero__badge--warning' : ''
            }`}
          >
            <span className="goal-hero__badge-label">
              {result.isGoalMet ? 'Status' : 'Estimated timeline'}
            </span>
            <span className="goal-hero__badge-value">{timelineLabel}</span>
            <span className="goal-hero__badge-detail">{timelineDetail}</span>
            {monthsDelta && (
              <span
                className={`goal-hero__delta${
                  monthsDelta.includes('sooner')
                    ? ' goal-hero__delta--positive'
                    : ' goal-hero__delta--negative'
                }`}
              >
                {monthsDelta}
              </span>
            )}
          </div>
        </div>

        {afterHero}

        <div
          className="goal-hero__progress"
          role="progressbar"
          aria-valuenow={result.progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${result.progressPercent.toFixed(1)}% toward ${targetLabel}`}
          aria-label={`Progress toward ${targetLabel} goal`}
        >
          <div className="goal-hero__progress-bar" style={{ width: `${result.progressPercent}%` }} />
        </div>

        <div className="goal-hero__range">
          <span>{formatCurrency(result.currentPosition)}</span>
          <span>{formatCurrency(result.targetAmount)}</span>
        </div>

        <div className="goal-hero__stats">
          <StatCard label="Current position" value={formatCurrency(result.currentPosition)} tone="money" />
          <StatCard label="Gap to goal" value={formatCurrency(result.remainingAmount)} />
          <StatCard
            label="Monthly contributions"
            value={formatCurrency(result.effectiveMonthlyContributions, true)}
          />
          <StatCard
            label="Investment rate"
            value={formatPercent(result.investmentInterestRate)}
            tone="accent"
          />
        </div>
      </section>

      {result.monthlySeries && result.monthlySeries.length > 1 && (
        <GoalPanel
          title="Growth over time"
          description="Projected balance month by month until you reach your goal."
          className="goal-panel--wide"
        >
          <GoalTimelineChart
            monthlySeries={result.monthlySeries}
            targetAmount={result.targetAmount}
            currentPosition={result.currentPosition}
            estimatedMonthsToGoal={result.estimatedMonthsToGoal}
            isReachable={result.isReachable}
            baselineSeries={baselineSeries}
          />
        </GoalPanel>
      )}

      <div className="goal-panels">
        <GoalPanel title="Current position" description="How your total balance is split today.">
          <PositionSplit
            investments={breakdown.currentInvestments}
            savings={breakdown.currentCashSavings}
            investmentsShare={breakdown.investmentsSharePercent}
            savingsShare={breakdown.savingsSharePercent}
          />
        </GoalPanel>

        <GoalPanel
          title="Monthly assumptions"
          description="Rates and contributions used in this projection."
        >
          <div className="goal-tile-grid">
            <AssumptionTile
              label="Investment contributions"
              value={formatCurrency(result.effectiveMonthlyContributions, true)}
              hint={
                result.contributionsInferredFromSalary
                  ? 'Estimated as 20% of net monthly income (50/30/20 rule)'
                  : 'Added to investments each month'
              }
            />
            <AssumptionTile
              label="Investment rate"
              value={formatPercent(result.investmentInterestRate)}
              hint="Annual, compounded monthly"
            />
            <AssumptionTile
              label="Savings rate"
              value={formatPercent(result.savingsInterestRate)}
              hint="Annual, compounded monthly"
            />
            <AssumptionTile
              label="Est. investment growth"
              value={formatCurrency(breakdown.estimatedMonthlyInvestmentGrowth, true)}
              hint="First month interest + contributions"
            />
            <AssumptionTile
              label="Est. savings growth"
              value={formatCurrency(breakdown.estimatedMonthlySavingsGrowth, true)}
              hint="First month interest on savings"
            />
          </div>
        </GoalPanel>

        {projectionAvailable && (
          <>
            <GoalPanel
              title="At goal"
              description={`Projected split after ${formatMonths(result.estimatedMonthsToGoal!)}.`}
            >
              <PositionSplit
                investments={breakdown.projectedInvestments!}
                savings={breakdown.projectedCashSavings!}
                investmentsShare={projectedShare(breakdown.projectedInvestments!, projectedTotal)}
                savingsShare={projectedShare(breakdown.projectedCashSavings!, projectedTotal)}
              />
              <div className="goal-panel__footer-stat">
                <span>Projected total</span>
                <strong>{formatCurrency(projectedTotal)}</strong>
              </div>
            </GoalPanel>

            <GoalPanel
              title="How you get there"
              description={`Estimated growth over ${formatMonths(result.estimatedMonthsToGoal!)}.`}
              className="goal-panel--wide"
            >
              <GrowthComposition
                contributions={breakdown.totalContributionsAdded ?? 0}
                investmentInterest={breakdown.investmentInterestEarned ?? 0}
                savingsInterest={breakdown.savingsInterestEarned ?? 0}
              />
              <div className="goal-detail-grid">
                <StatCard
                  label="Contributions added"
                  value={formatCurrency(breakdown.totalContributionsAdded)}
                />
                <StatCard
                  label="Investment interest"
                  value={formatCurrency(breakdown.investmentInterestEarned)}
                />
                <StatCard
                  label="Savings interest"
                  value={formatCurrency(breakdown.savingsInterestEarned)}
                />
                <StatCard
                  label="Total interest"
                  value={formatCurrency(breakdown.totalInterestEarned)}
                  tone="money"
                />
              </div>
            </GoalPanel>
          </>
        )}
      </div>
    </div>
  )
}
