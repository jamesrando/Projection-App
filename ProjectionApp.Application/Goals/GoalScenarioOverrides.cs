namespace ProjectionApp.Application.Goals;

public sealed record GoalScenarioOverrides(
    decimal? MonthlyContribution = null,
    decimal? InvestmentInterestRate = null,
    decimal? SavingsInterestRate = null);
