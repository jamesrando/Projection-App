namespace ProjectionApp.Application.Projections;

public interface IProjectionService
{
    Task<IReadOnlyList<ProjectionSummaryDto>> GetSummariesAsync(CancellationToken cancellationToken = default);

    Task<ProjectionSummaryDto?> GetSummaryByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
