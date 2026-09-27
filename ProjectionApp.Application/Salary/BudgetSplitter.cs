namespace ProjectionApp.Application.Salary;

public static class BudgetSplitter
{
    private const decimal NeedsShare = 0.50m;
    private const decimal WantsShare = 0.30m;
    private const decimal SavingsShare = 0.20m;

    public static BudgetSplitDto Split(decimal netAnnual)
    {
        var needsAnnual = RoundPence(netAnnual * NeedsShare);
        var wantsAnnual = RoundPence(netAnnual * WantsShare);
        var savingsAnnual = RoundPence(netAnnual - needsAnnual - wantsAnnual);

        return new BudgetSplitDto(
            Needs: CreateCategory(50m, needsAnnual),
            Wants: CreateCategory(30m, wantsAnnual),
            Savings: CreateCategory(20m, savingsAnnual));
    }

    private static BudgetCategoryDto CreateCategory(decimal percent, decimal annual) =>
        new(
            Percent: percent,
            Annual: annual,
            Monthly: RoundPence(annual / 12m));

    private static decimal RoundPence(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
