using ProjectionApp.Domain.Goals;

namespace ProjectionApp.Application.Goals;

internal static class GoalDtoMapping
{
    public static GoalTimelinePointDto ToDto(this GoalTimelinePoint point) =>
        new(
            point.Month,
            point.Investments,
            point.Savings,
            point.TotalPosition,
            point.CumulativeContributions,
            point.CumulativeInterest);

    public static IReadOnlyList<GoalTimelinePointDto>? ToDto(this IReadOnlyList<GoalTimelinePoint>? series) =>
        series?.Select(p => p.ToDto()).ToList();
}
