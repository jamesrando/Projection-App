using ProjectionApp.Application.Projections;
using ProjectionApp.Domain.Entities;
using ProjectionApp.Domain.Enums;

namespace ProjectionApp.Tests.Application;

public class ProjectionServiceTests
{
    [Fact]
    public async Task GetSummariesAsync_ReturnsMappedSummaries()
    {
        var repository = new FakeProjectionRepository(
        [
            new Projection
            {
                Name = "Sample",
                StartDate = new DateOnly(2026, 1, 1),
                EndDate = new DateOnly(2026, 3, 31),
                LineItems =
                [
                    new LineItem { Name = "Revenue", Type = LineItemType.Income, Amount = 100m },
                    new LineItem { Name = "Expense", Type = LineItemType.Expense, Amount = 25m }
                ]
            }
        ]);

        var service = new ProjectionService(repository);

        var summaries = await service.GetSummariesAsync();

        Assert.Single(summaries);
        Assert.Equal("Sample", summaries[0].Name);
        Assert.Equal(75m, summaries[0].Net);
    }

    private sealed class FakeProjectionRepository(IReadOnlyList<Projection> projections) : IProjectionRepository
    {
        public Task<IReadOnlyList<Projection>> GetAllAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult(projections);

        public Task<Projection?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
            Task.FromResult(projections.FirstOrDefault(item => item.Id == id));
    }
}
