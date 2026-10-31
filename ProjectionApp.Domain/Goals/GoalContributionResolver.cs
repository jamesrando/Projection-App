using ProjectionApp.Domain.Entities;
using ProjectionApp.Domain.Finance;

namespace ProjectionApp.Domain.Goals;

public static class GoalContributionResolver
{
    public static (decimal EffectiveMonthlyContribution, bool InferredFromSalary) Resolve(UserProfile profile)
    {
        if (profile.MonthlyInvestmentContributions is decimal explicitContribution)
        {
            return (explicitContribution, false);
        }

        if (profile.AnnualSalary is > 0m)
        {
            var netAnnual = UkTaxCalculator.CalculateNetAnnual(profile.AnnualSalary.Value);
            var savingsMonthly = BudgetSplitter.Split(netAnnual).Savings.Monthly;
            return (savingsMonthly, true);
        }

        return (0m, false);
    }
}
