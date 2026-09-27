namespace ProjectionApp.Application.Profiles;

public sealed record UserProfileDto(
    Guid Id,
    decimal? AnnualSalary,
    decimal? CurrentInvestments,
    decimal? CurrentCashSavings,
    decimal? InvestmentInterestRate,
    decimal? SavingsInterestRate,
    decimal? MonthlyInvestmentContributions,
    decimal? MonthlyCashFlow,
    decimal TotalPosition);
