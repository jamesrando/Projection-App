namespace ProjectionApp.Application.Goals;

public sealed record AnalyzeSavingsGoalRequest(
    decimal? TargetAmount = null,
    GoalScenarioOverrides? Overrides = null);
