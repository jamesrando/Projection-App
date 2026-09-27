using ProjectionApp.Domain.Entities;

namespace ProjectionApp.Application.Projections;

public interface IProjectionRepository
{
    Task<IReadOnlyList<Projection>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<Projection?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
