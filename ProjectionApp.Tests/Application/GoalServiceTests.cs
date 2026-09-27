using ProjectionApp.Application.Goals;
using ProjectionApp.Application.Profiles;
using ProjectionApp.Domain.Entities;

namespace ProjectionApp.Tests.Application;

public class GoalServiceTests
{
    [Fact]
    public async Task AnalyzeReach100kAsync_IgnoresSalaryWhenEstimatingTimeline()
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
        Assert.Null(result.EstimatedMonthsToGoal);
        Assert.Null(result.EstimatedYearsToGoal);
        Assert.Null(result.InvestmentInterestRate);
        Assert.Null(result.SavingsInterestRate);
        Assert.False(result.IsGoalMet);
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
    }

    private sealed class FakeUserProfileRepository(UserProfile? profile) : IUserProfileRepository
    {
        public Task<UserProfile?> GetAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult(profile);

        public Task<UserProfile> SaveAsync(UserProfile updatedProfile, CancellationToken cancellationToken = default) =>
            Task.FromResult(updatedProfile);
    }
}
