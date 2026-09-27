using ProjectionApp.Application.Projections;
using ProjectionApp.Domain.Entities;
using ProjectionApp.Domain.Enums;

namespace ProjectionApp.Infrastructure.Persistence;

public sealed class InMemoryProjectionRepository : IProjectionRepository
{
    private static readonly IReadOnlyList<Projection> SeedData =
    [
        new Projection
        {
            Name = "Q1 Operating Forecast",
            StartDate = new DateOnly(2026, 1, 1),
            EndDate = new DateOnly(2026, 3, 31),
            LineItems =
            [
                new LineItem { Name = "Subscription Revenue", Type = LineItemType.Income, Amount = 120_000m, Category = "Revenue" },
                new LineItem { Name = "Professional Services", Type = LineItemType.Income, Amount = 45_000m, Category = "Revenue" },
                new LineItem { Name = "Payroll", Type = LineItemType.Expense, Amount = 72_000m, Category = "Operations" },
                new LineItem { Name = "Cloud Infrastructure", Type = LineItemType.Expense, Amount = 8_500m, Category = "Operations" }
            ]
        },
        new Projection
        {
            Name = "Annual Growth Scenario",
            StartDate = new DateOnly(2026, 1, 1),
            EndDate = new DateOnly(2026, 12, 31),
            LineItems =
            [
                new LineItem { Name = "Subscription Revenue", Type = LineItemType.Income, Amount = 540_000m, Category = "Revenue" },
                new LineItem { Name = "Marketing", Type = LineItemType.Expense, Amount = 96_000m, Category = "Growth" },
                new LineItem { Name = "Payroll", Type = LineItemType.Expense, Amount = 310_000m, Category = "Operations" }
            ]
        }
    ];

    public Task<IReadOnlyList<Projection>> GetAllAsync(CancellationToken cancellationToken = default) =>
        Task.FromResult(SeedData);

    public Task<Projection?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var projection = SeedData.FirstOrDefault(item => item.Id == id);
        return Task.FromResult(projection);
    }
}
