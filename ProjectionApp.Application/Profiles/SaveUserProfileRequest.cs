namespace ProjectionApp.Application.Profiles;

public sealed record SaveUserProfileRequest(
    decimal? AnnualSalary,
    decimal? CurrentInvestments,
    decimal? CurrentCashSavings,
    decimal? InvestmentInterestRate = null,
    decimal? SavingsInterestRate = null,
    decimal? MonthlyInvestmentContributions = null);
