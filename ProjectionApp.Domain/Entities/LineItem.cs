using ProjectionApp.Domain.Enums;

namespace ProjectionApp.Domain.Entities;

public sealed class LineItem
{
    public Guid Id { get; init; } = Guid.NewGuid();

    public required string Name { get; init; }

    public LineItemType Type { get; init; }

    public decimal Amount { get; init; }

    public string? Category { get; init; }
}
