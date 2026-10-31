using ProjectionApp.Domain.Goals;

namespace ProjectionApp.Tests.Domain;

public class SavingsGoalSimulatorTests
{
    [Fact]
    public void SimulateToGoal_ReturnsNullWhenNoGrowthInputs()
    {
        var result = SavingsGoalSimulator.SimulateToGoal(
            investments: 10_000m,
            savings: 5_000m,
            monthlyContribution: 0m,
            investmentMonthlyRate: 0m,
            savingsMonthlyRate: 0m,
            targetAmount: 100_000m);

        Assert.Null(result);
    }

    [Fact]
    public void SimulateToGoal_ReachesTargetWithinHorizon()
    {
        var result = SavingsGoalSimulator.SimulateToGoal(
            investments: 10_000m,
            savings: 0m,
            monthlyContribution: 500m,
            investmentMonthlyRate: 0m,
            savingsMonthlyRate: 0m,
            targetAmount: 20_000m);

        Assert.NotNull(result);
        Assert.NotNull(result!.MonthsToGoal);
        Assert.True(result.MonthsToGoal > 0);
        Assert.True(result.MonthlySeries.Count >= 2);
        Assert.Equal(0, result.MonthlySeries[0].Month);
        Assert.Equal(result.MonthsToGoal.Value, result.MonthlySeries[^1].Month);
        Assert.True(result.ProjectedInvestments + result.ProjectedCashSavings >= 20_000m);
    }

    [Fact]
    public void SimulateToGoal_CompoundsEachBalanceAtItsOwnRate()
    {
        var investmentRate = 0.05m / 12m;
        var savingsRate = 0.02m / 12m;

        var result = SavingsGoalSimulator.SimulateToGoal(
            investments: 50_000m,
            savings: 20_000m,
            monthlyContribution: 200m,
            investmentMonthlyRate: investmentRate,
            savingsMonthlyRate: savingsRate,
            targetAmount: 100_000m);

        Assert.NotNull(result);
        Assert.NotNull(result!.MonthsToGoal);
        Assert.True(result.InvestmentInterestEarned > 0m);
        Assert.True(result.SavingsInterestEarned > 0m);
        Assert.True(result.TotalContributionsAdded > 0m);
    }
}
