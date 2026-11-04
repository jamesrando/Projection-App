using ProjectionApp.Domain.Entities;

namespace ProjectionApp.Domain.Profiles;

public static class InvestmentHoldingsRollup
{
    public sealed record Result(
        decimal? TotalBalance,
        decimal? WeightedAnnualReturnRate,
        decimal? TotalMonthlyContributions);

    public static Result Rollup(IReadOnlyList<InvestmentHolding> holdings)
    {
        if (holdings.Count == 0)
        {
            return new Result(null, null, null);
        }

        var totalBalance = 0m;
        var anyBalanceInput = false;
        var weightedRateNumerator = 0m;
        var weightedRateDenominator = 0m;
        var totalContributions = 0m;
        var anyContributionInput = false;

        foreach (var holding in holdings)
        {
            if (holding.Balance is decimal balance)
            {
                anyBalanceInput = true;
                totalBalance += balance;

                if (balance > 0m)
                {
                    var rate = holding.AnnualReturnRate ?? 0m;
                    weightedRateNumerator += balance * rate;
                    weightedRateDenominator += balance;
                }
            }

            if (holding.MonthlyContribution is decimal contribution)
            {
                anyContributionInput = true;
                totalContributions += contribution;
            }
        }

        decimal? weightedRate = weightedRateDenominator <= 0m
            ? null
            : Math.Round(
                weightedRateNumerator / weightedRateDenominator,
                2,
                MidpointRounding.AwayFromZero);

        return new Result(
            anyBalanceInput ? totalBalance : null,
            weightedRate,
            anyContributionInput ? totalContributions : null);
    }
}
