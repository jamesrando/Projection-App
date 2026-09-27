namespace ProjectionApp.Application.Projections;

public sealed class ProjectionService(IProjectionRepository repository) : IProjectionService
{
    public async Task<IReadOnlyList<ProjectionSummaryDto>> GetSummariesAsync(
        CancellationToken cancellationToken = default)
    {
        var projections = await repository.GetAllAsync(cancellationToken);
        return projections.Select(ToSummary).ToList();
    }

    public async Task<ProjectionSummaryDto?> GetSummaryByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var projection = await repository.GetByIdAsync(id, cancellationToken);
        return projection is null ? null : ToSummary(projection);
    }

    private static ProjectionSummaryDto ToSummary(Domain.Entities.Projection projection) =>
        new(
            projection.Id,
            projection.Name,
            projection.StartDate,
            projection.EndDate,
            projection.TotalIncome,
            projection.TotalExpenses,
            projection.Net);
}
