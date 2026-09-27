namespace ProjectionApp.Application.Goals;

public sealed record AnalyzeReachGoalRequest(
    decimal? TargetAmount = null,
    GoalScenarioOverrides? Overrides = null);
