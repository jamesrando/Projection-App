namespace ProjectionApp.Application.Goals;

public sealed record GoalBreakdownDto(
    decimal CurrentInvestments,
    decimal CurrentCashSavings,
    decimal InvestmentsSharePercent,
    decimal SavingsSharePercent,
    decimal EstimatedMonthlyInvestmentGrowth,
    decimal EstimatedMonthlySavingsGrowth,
    decimal? ProjectedInvestments,
    decimal? ProjectedCashSavings,
    decimal? TotalContributionsAdded,
    decimal? InvestmentInterestEarned,
    decimal? SavingsInterestEarned,
    decimal? TotalInterestEarned);
