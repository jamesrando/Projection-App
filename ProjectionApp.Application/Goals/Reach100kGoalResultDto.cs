namespace ProjectionApp.Application.Goals;

public sealed record Reach100kGoalResultDto(
    decimal TargetAmount,
    decimal CurrentPosition,
    decimal RemainingAmount,
    decimal ProgressPercent,
    decimal? MonthlyCashFlow,
    int? EstimatedMonthsToGoal,
    decimal? EstimatedYearsToGoal,
    decimal? InvestmentInterestRate,
    decimal? SavingsInterestRate,
    decimal? MonthlyInvestmentContributions,
    decimal EffectiveMonthlyContributions,
    bool ContributionsInferredFromSalary,
    bool IsGoalMet,
    bool IsReachable,
    GoalBreakdownDto Breakdown,
    IReadOnlyList<MonthlyProjectionPointDto>? MonthlySeries);
