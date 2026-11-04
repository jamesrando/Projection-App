using ProjectionApp.Domain.Entities;
using ProjectionApp.Domain.Profiles;

namespace ProjectionApp.Tests.Domain;

public class InvestmentHoldingsRollupTests
{
    [Fact]
    public void Rollup_SumsBalancesAndContributions()
    {
        var holdings = new[]
        {
            new InvestmentHolding { Balance = 10_000m, AnnualReturnRate = 5m, MonthlyContribution = 100m },
            new InvestmentHolding { Balance = 30_000m, AnnualReturnRate = 7m, MonthlyContribution = 200m },
        };

        var result = InvestmentHoldingsRollup.Rollup(holdings);

        Assert.Equal(40_000m, result.TotalBalance);
        Assert.Equal(300m, result.TotalMonthlyContributions);
        Assert.Equal(6.5m, result.WeightedAnnualReturnRate);
    }

    [Fact]
    public void Rollup_ReturnsNullTotalsWhenNoInputs()
    {
        var holdings = new[] { new InvestmentHolding() };

        var result = InvestmentHoldingsRollup.Rollup(holdings);

        Assert.Null(result.TotalBalance);
        Assert.Null(result.WeightedAnnualReturnRate);
        Assert.Null(result.TotalMonthlyContributions);
    }
}
