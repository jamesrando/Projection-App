namespace ProjectionApp.Application.Goals;

public interface IGoalService
{
    Task<Reach100kGoalResultDto> AnalyzeReach100kAsync(CancellationToken cancellationToken = default);
}
