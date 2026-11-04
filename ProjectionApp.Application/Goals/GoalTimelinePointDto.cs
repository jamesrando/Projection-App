namespace ProjectionApp.Application.Goals;

public sealed record GoalTimelinePointDto(
    int Month,
    decimal Investments,
    decimal Savings,
    decimal TotalPosition,
    decimal CumulativeContributions,
    decimal CumulativeInterest);
