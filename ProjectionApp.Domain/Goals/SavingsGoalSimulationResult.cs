namespace ProjectionApp.Domain.Goals;

public sealed record SavingsGoalSimulationResult(
    int? MonthsToGoal,
    decimal ProjectedInvestments,
    decimal ProjectedCashSavings,
    decimal TotalContributionsAdded,
    decimal InvestmentInterestEarned,
    decimal SavingsInterestEarned,
    IReadOnlyList<GoalTimelinePoint> MonthlySeries)
{
    public decimal TotalInterestEarned => InvestmentInterestEarned + SavingsInterestEarned;
}
