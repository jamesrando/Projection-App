namespace ProjectionApp.Domain.Goals;

public sealed record GoalTimelinePoint(
    int Month,
    decimal Investments,
    decimal Savings,
    decimal TotalPosition,
    decimal CumulativeContributions,
    decimal CumulativeInterest);
