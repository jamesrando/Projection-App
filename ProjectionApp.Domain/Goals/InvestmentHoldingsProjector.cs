using ProjectionApp.Domain.Entities;

namespace ProjectionApp.Domain.Goals;

public sealed record InvestmentHoldingProjection(
    Guid Id,
    string Category,
    string? CustomLabel,
    decimal CurrentBalance,
    decimal ProjectedBalance);

public static class InvestmentHoldingsProjector
{
    public static IReadOnlyList<InvestmentHoldingProjection> ProjectToMonth(
        IReadOnlyList<InvestmentHolding> holdings,
        int months,
        decimal investmentRateScale = 1m,
        decimal? totalMonthlyContribution = null)
    {
        if (holdings.Count == 0)
        {
            return [];
        }

        var states = holdings
            .Select(holding => new HoldingState(
                holding.Id,
                holding.Category,
                holding.CustomLabel,
                holding.Balance ?? 0m,
                holding.Balance ?? 0m,
                ((holding.AnnualReturnRate ?? 0m) / 100m / 12m) * investmentRateScale,
                holding.MonthlyContribution ?? 0m))
            .ToArray();

        ApplyContributionScaling(states, totalMonthlyContribution);

        for (var month = 0; month < months; month++)
        {
            for (var index = 0; index < states.Length; index++)
            {
                var state = states[index];
                var interest = state.Balance * state.MonthlyRate;
                states[index] = state with
                {
                    Balance = state.Balance + interest + state.MonthlyContribution,
                };
            }
        }

        return states
            .Select(state => new InvestmentHoldingProjection(
                state.Id,
                state.Category,
                state.CustomLabel,
                state.StartingBalance,
                state.Balance))
            .ToList();
    }

    private static void ApplyContributionScaling(
        HoldingState[] states,
        decimal? totalMonthlyContribution)
    {
        if (totalMonthlyContribution is not decimal targetContribution || targetContribution <= 0m)
        {
            return;
        }

        var rowTotal = states.Sum(state => state.MonthlyContribution);
        if (rowTotal > 0m)
        {
            var scale = targetContribution / rowTotal;
            for (var index = 0; index < states.Length; index++)
            {
                states[index] = states[index] with
                {
                    MonthlyContribution = states[index].MonthlyContribution * scale,
                };
            }

            return;
        }

        var balanceTotal = states.Sum(state => state.StartingBalance);
        if (balanceTotal <= 0m)
        {
            if (states.Length > 0)
            {
                states[0] = states[0] with { MonthlyContribution = targetContribution };
            }

            return;
        }

        for (var index = 0; index < states.Length; index++)
        {
            var share = states[index].StartingBalance / balanceTotal;
            states[index] = states[index] with
            {
                MonthlyContribution = Math.Round(targetContribution * share, 2, MidpointRounding.AwayFromZero),
            };
        }
    }

    private sealed record HoldingState(
        Guid Id,
        string Category,
        string? CustomLabel,
        decimal StartingBalance,
        decimal Balance,
        decimal MonthlyRate,
        decimal MonthlyContribution);
}
