namespace ProjectionApp.Application.Goals;

public interface IGoalService
{
    Task<Reach100kGoalResultDto> AnalyzeReach100kAsync(
        decimal? targetAmount = null,
        GoalScenarioOverrides? overrides = null,
        CancellationToken cancellationToken = default);
}
