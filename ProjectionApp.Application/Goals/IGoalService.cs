using FluentResults;

namespace ProjectionApp.Application.Goals;

public interface IGoalService
{
    Task<Result<SavingsGoalResultDto>> AnalyzeSavingsGoalAsync(
        decimal? targetAmount = null,
        GoalScenarioOverrides? overrides = null,
        CancellationToken cancellationToken = default);
}
