namespace ProjectionApp.Domain.Entities;

public sealed class Projection
{
    public Guid Id { get; init; } = Guid.NewGuid();

    public required string Name { get; init; }

    public required DateOnly StartDate { get; init; }

    public required DateOnly EndDate { get; init; }

    public IReadOnlyList<LineItem> LineItems { get; init; } = [];

    public decimal TotalIncome =>
        LineItems.Where(item => item.Type == Enums.LineItemType.Income).Sum(item => item.Amount);

    public decimal TotalExpenses =>
        LineItems.Where(item => item.Type == Enums.LineItemType.Expense).Sum(item => item.Amount);

    public decimal Net => TotalIncome - TotalExpenses;
}
