namespace ProjectionApp.Application.Profiles;

public sealed record InvestmentHoldingDto(
    Guid Id,
    string Category,
    string? CustomLabel,
    decimal? Balance,
    decimal? AnnualReturnRate,
    decimal? MonthlyContribution);
