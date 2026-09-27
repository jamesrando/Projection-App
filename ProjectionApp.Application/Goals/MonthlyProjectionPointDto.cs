namespace ProjectionApp.Application.Goals;

public sealed record MonthlyProjectionPointDto(
    int Month,
    decimal Investments,
    decimal Savings,
    decimal TotalPosition,
    decimal CumulativeContributions,
    decimal CumulativeInterest);
