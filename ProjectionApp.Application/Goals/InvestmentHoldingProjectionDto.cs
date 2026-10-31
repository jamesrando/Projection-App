namespace ProjectionApp.Application.Goals;

public sealed record InvestmentHoldingProjectionDto(
    Guid Id,
    string Category,
    string? CustomLabel,
    decimal CurrentBalance,
    decimal ProjectedBalance,
    decimal ProjectedSharePercent);
