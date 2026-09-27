using ProjectionApp.Application.Goals;
using ProjectionApp.Application.Profiles;
using ProjectionApp.Domain.Entities;

namespace ProjectionApp.Tests.Application;

public class GoalServiceTests
{
    [Fact]
    public async Task AnalyzeReach100kAsync_InfersMonthlyContributionsFromSalary()
    {
        var repository = new FakeUserProfileRepository(new UserProfile
        {
            AnnualSalary = 100_000m,
            CurrentInvestments = 50_000m,
            CurrentCashSavings = 25_000m,
        });

        var service = new GoalService(repository);

        var result = await service.AnalyzeReach100kAsync();

        Assert.Equal(100_000m, result.TargetAmount);
        Assert.Equal(75_000m, result.CurrentPosition);
        Assert.Equal(25_000m, result.RemainingAmount);
        Assert.Equal(75m, result.ProgressPercent);
        Assert.Equal(100_000m / 12m, result.MonthlyCashFlow);
        Assert.Null(result.MonthlyInvestmentContributions);
        Assert.True(result.ContributionsInferredFromSalary);
        Assert.Equal(1_142.62m, result.EffectiveMonthlyContributions);
        Assert.Equal(22, result.EstimatedMonthsToGoal);
        Assert.Equal(1.83m, result.EstimatedYearsToGoal);
        Assert.False(result.IsGoalMet);
        Assert.True(result.IsReachable);
    }

    [Fact]
    public async Task AnalyzeReach100kAsync_UsesExplicitContributionsOverSalaryInference()
    {
        var repository = new FakeUserProfileRepository(new UserProfile
        {
            AnnualSalary = 100_000m,
            CurrentInvestments = 50_000m,
            MonthlyInvestmentContributions = 500m,
        });

        var service = new GoalService(repository);

        var result = await service.AnalyzeReach100kAsync();

        Assert.Equal(500m, result.EffectiveMonthlyContributions);
        Assert.False(result.ContributionsInferredFromSalary);
        Assert.Equal(100, result.EstimatedMonthsToGoal);
    }

    [Fact]
    public async Task AnalyzeReach100kAsync_ReturnsGoalMetWhenAlreadyAtTarget()
    {
        var repository = new FakeUserProfileRepository(new UserProfile
        {
            AnnualSalary = 120_000m,
            CurrentInvestments = 80_000m,
            CurrentCashSavings = 30_000m,
        });

        var service = new GoalService(repository);

        var result = await service.AnalyzeReach100kAsync();

        Assert.True(result.IsGoalMet);
        Assert.Equal(0, result.EstimatedMonthsToGoal);
        Assert.Equal(0m, result.EstimatedYearsToGoal);
        Assert.Equal(0m, result.RemainingAmount);
        Assert.Equal(100m, result.ProgressPercent);
        Assert.True(result.IsReachable);
    }

    [Fact]
    public async Task AnalyzeReach100kAsync_ReturnsMonthlySeriesWithStartingPointAndGoalMonth()
    {
        var repository = new FakeUserProfileRepository(new UserProfile
        {
            AnnualSalary = 100_000m,
            CurrentInvestments = 50_000m,
            CurrentCashSavings = 25_000m,
        });

        var service = new GoalService(repository);

        var result = await service.AnalyzeReach100kAsync();

        Assert.NotNull(result.MonthlySeries);
        Assert.Equal(23, result.MonthlySeries.Count);
        Assert.Equal(0, result.MonthlySeries[0].Month);
        Assert.Equal(75_000m, result.MonthlySeries[0].TotalPosition);
        Assert.Equal(0m, result.MonthlySeries[0].CumulativeContributions);
        Assert.Equal(22, result.MonthlySeries[^1].Month);
        Assert.True(result.MonthlySeries[^1].TotalPosition >= result.TargetAmount);
    }

    [Fact]
    public async Task AnalyzeReach100kAsync_ReturnsSinglePointSeriesWhenGoalAlreadyMet()
    {
        var repository = new FakeUserProfileRepository(new UserProfile
        {
            CurrentInvestments = 80_000m,
            CurrentCashSavings = 30_000m,
        });

        var service = new GoalService(repository);

        var result = await service.AnalyzeReach100kAsync();

        Assert.NotNull(result.MonthlySeries);
        Assert.Single(result.MonthlySeries);
        Assert.Equal(110_000m, result.MonthlySeries[0].TotalPosition);
    }

    [Fact]
    public async Task AnalyzeReach100kAsync_ThrowsWhenProfileMissing()
    {
        var service = new GoalService(new FakeUserProfileRepository(null));

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.AnalyzeReach100kAsync());
    }

    [Fact]
    public async Task AnalyzeReach100kAsync_ThrowsWhenProfileIncomplete()
    {
        var repository = new FakeUserProfileRepository(new UserProfile());
        var service = new GoalService(repository);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.AnalyzeReach100kAsync());
    }

    [Fact]
    public async Task AnalyzeReach100kAsync_CompoundsEachBalanceAtItsOwnRate()
    {
        var repository = new FakeUserProfileRepository(new UserProfile
        {
            AnnualSalary = 12_000m,
            CurrentInvestments = 40_000m,
            CurrentCashSavings = 20_000m,
            InvestmentInterestRate = 7m,
            SavingsInterestRate = 2m,
            MonthlyInvestmentContributions = 0m,
        });

        var service = new GoalService(repository);

        var result = await service.AnalyzeReach100kAsync();

        Assert.Equal(111, result.EstimatedMonthsToGoal);
        Assert.Equal(9.25m, result.EstimatedYearsToGoal);
        Assert.Equal(7m, result.InvestmentInterestRate);
        Assert.Equal(2m, result.SavingsInterestRate);
        Assert.False(result.IsGoalMet);
        Assert.Equal(40_000m, result.Breakdown.CurrentInvestments);
        Assert.Equal(20_000m, result.Breakdown.CurrentCashSavings);
        Assert.Equal(66.7m, result.Breakdown.InvestmentsSharePercent);
        Assert.Equal(33.3m, result.Breakdown.SavingsSharePercent);
        Assert.NotNull(result.Breakdown.ProjectedInvestments);
        Assert.NotNull(result.Breakdown.TotalContributionsAdded);
        Assert.Equal(0m, result.Breakdown.TotalContributionsAdded);
        Assert.True(result.Breakdown.TotalInterestEarned > 0m);
        Assert.True(result.IsReachable);
    }

    [Fact]
    public async Task AnalyzeReach100kAsync_AcceptsCustomTargetAmount()
    {
        var repository = new FakeUserProfileRepository(new UserProfile
        {
            CurrentInvestments = 50_000m,
            MonthlyInvestmentContributions = 1_000m,
        });

        var service = new GoalService(repository);

        var result = await service.AnalyzeReach100kAsync(200_000m);

        Assert.Equal(200_000m, result.TargetAmount);
        Assert.Equal(50_000m, result.CurrentPosition);
        Assert.Equal(25m, result.ProgressPercent);
        Assert.Equal(150, result.EstimatedMonthsToGoal);
        Assert.True(result.IsReachable);
    }

    [Fact]
    public async Task AnalyzeReach100kAsync_EstimatesTimelineFromMonthlyContributionsAlone()
    {
        var repository = new FakeUserProfileRepository(new UserProfile
        {
            CurrentInvestments = 50_000m,
            MonthlyInvestmentContributions = 1_000m,
        });

        var service = new GoalService(repository);

        var result = await service.AnalyzeReach100kAsync();

        Assert.Equal(1_000m, result.MonthlyInvestmentContributions);
        Assert.Equal(50, result.EstimatedMonthsToGoal);
        Assert.Equal(4.17m, result.EstimatedYearsToGoal);
        Assert.Equal(50_000m, result.Breakdown.TotalContributionsAdded);
        Assert.Equal(0m, result.Breakdown.TotalInterestEarned);
        Assert.True(result.IsReachable);
    }

    [Fact]
    public async Task AnalyzeReach100kAsync_GrowsInvestmentsWhenOnlyTheInvestmentRateIsProvided()
    {
        var repository = new FakeUserProfileRepository(new UserProfile
        {
            CurrentInvestments = 50_000m,
            InvestmentInterestRate = 5m,
        });

        var service = new GoalService(repository);

        var result = await service.AnalyzeReach100kAsync();

        Assert.Null(result.MonthlyCashFlow);
        Assert.Equal(167, result.EstimatedMonthsToGoal);
        Assert.Equal(13.92m, result.EstimatedYearsToGoal);
        Assert.True(result.IsReachable);
    }

    [Fact]
    public async Task AnalyzeReach100kAsync_ThrowsWhenTargetAmountInvalid()
    {
        var repository = new FakeUserProfileRepository(new UserProfile
        {
            CurrentInvestments = 50_000m,
        });

        var service = new GoalService(repository);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.AnalyzeReach100kAsync(0m));
    }

    private sealed class FakeUserProfileRepository(UserProfile? profile) : IUserProfileRepository
    {
        public Task<UserProfile?> GetAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult(profile);

        public Task<UserProfile> SaveAsync(UserProfile updatedProfile, CancellationToken cancellationToken = default) =>
            Task.FromResult(updatedProfile);
    }
}
