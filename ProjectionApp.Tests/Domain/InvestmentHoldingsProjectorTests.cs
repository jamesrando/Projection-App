using ProjectionApp.Domain.Entities;
using ProjectionApp.Domain.Goals;

namespace ProjectionApp.Tests.Domain;

public class InvestmentHoldingsProjectorTests
{
    [Fact]
    public void ProjectToMonth_GrowsEachHoldingWithItsOwnRate()
    {
        var holdings = new[]
        {
            new InvestmentHolding
            {
                Balance = 10_000m,
                AnnualReturnRate = 6m,
                MonthlyContribution = 100m,
            },
            new InvestmentHolding
            {
                Balance = 20_000m,
                AnnualReturnRate = 8m,
                MonthlyContribution = 200m,
            },
        };

        var projections = InvestmentHoldingsProjector.ProjectToMonth(holdings, months: 12);

        Assert.Equal(2, projections.Count);
        Assert.True(projections[0].ProjectedBalance > 10_000m);
        Assert.True(projections[1].ProjectedBalance > projections[0].ProjectedBalance);
    }
}
