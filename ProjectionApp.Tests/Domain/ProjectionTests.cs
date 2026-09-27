using ProjectionApp.Domain.Entities;
using ProjectionApp.Domain.Enums;

namespace ProjectionApp.Tests.Domain;

public class ProjectionTests
{
    [Fact]
    public void Net_CalculatesIncomeMinusExpenses()
    {
        var projection = new Projection
        {
            Name = "Test",
            StartDate = new DateOnly(2026, 1, 1),
            EndDate = new DateOnly(2026, 12, 31),
            LineItems =
            [
                new LineItem { Name = "Revenue", Type = LineItemType.Income, Amount = 1_000m },
                new LineItem { Name = "Costs", Type = LineItemType.Expense, Amount = 400m }
            ]
        };

        Assert.Equal(600m, projection.Net);
        Assert.Equal(1_000m, projection.TotalIncome);
        Assert.Equal(400m, projection.TotalExpenses);
    }
}
