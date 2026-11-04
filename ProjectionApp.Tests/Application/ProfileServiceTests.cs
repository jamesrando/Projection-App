using ProjectionApp.Application.Profiles;
using ProjectionApp.Domain.Entities;

namespace ProjectionApp.Tests.Application;

public class ProfileServiceTests
{
    [Fact]
    public async Task SaveAsync_PersistsProfileAndReturnsDerivedValues()
    {
        var repository = new FakeUserProfileRepository();
        var service = new ProfileService(repository);

        var savedResult = await service.SaveAsync(new SaveUserProfileRequest(
            100_000m,
            50_000m,
            25_000m,
            7.5m,
            4.25m,
            500m));

        Assert.True(savedResult.IsSuccess);
        var saved = savedResult.Value;
        Assert.Equal(100_000m, saved.AnnualSalary);
        Assert.Equal(50_000m, saved.CurrentInvestments);
        Assert.Equal(25_000m, saved.CurrentCashSavings);
        Assert.Equal(7.5m, saved.InvestmentInterestRate);
        Assert.Equal(4.25m, saved.SavingsInterestRate);
        Assert.Equal(500m, saved.MonthlyInvestmentContributions);
        Assert.Equal(75_000m, saved.TotalPosition);
        Assert.True(saved.HasMinimumGoalInputs);

        var loadedResult = await service.GetAsync();
        Assert.True(loadedResult.IsSuccess);
        var loaded = loadedResult.Value;
        Assert.Equal(saved.Id, loaded.Id);
        Assert.Equal(75_000m, loaded.TotalPosition);
        Assert.Equal(7.5m, loaded.InvestmentInterestRate);
        Assert.Equal(4.25m, loaded.SavingsInterestRate);
    }

    [Fact]
    public async Task SaveAsync_RollsUpInvestmentHoldingsWhenBreakdownIsProvided()
    {
        var service = new ProfileService(new FakeUserProfileRepository());

        var savedResult = await service.SaveAsync(new SaveUserProfileRequest(
            null,
            null,
            null,
            null,
            null,
            null,
            [
                new InvestmentHoldingDto(
                    Guid.NewGuid(),
                    "stocksIsa",
                    null,
                    10_000m,
                    5m,
                    100m),
                new InvestmentHoldingDto(
                    Guid.NewGuid(),
                    "pension",
                    null,
                    30_000m,
                    7m,
                    200m),
            ],
            UseInvestmentBreakdown: true));

        Assert.True(savedResult.IsSuccess);
        var saved = savedResult.Value;
        Assert.Equal(40_000m, saved.CurrentInvestments);
        Assert.Equal(6.5m, saved.InvestmentInterestRate);
        Assert.Equal(300m, saved.MonthlyInvestmentContributions);
        Assert.NotNull(saved.InvestmentHoldings);
        Assert.Equal(2, saved.InvestmentHoldings!.Count);
        Assert.True(saved.UseInvestmentBreakdown);
    }

    [Fact]
    public async Task SaveAsync_PreservesInvestmentHoldingsWhenSimpleModeSaveOmitsThem()
    {
        var repository = new FakeUserProfileRepository();
        var service = new ProfileService(repository);

        await service.SaveAsync(new SaveUserProfileRequest(
            null,
            40_000m,
            null,
            6m,
            null,
            300m,
            [
                new InvestmentHoldingDto(
                    Guid.NewGuid(),
                    "stocksIsa",
                    null,
                    10_000m,
                    5m,
                    100m),
                new InvestmentHoldingDto(
                    Guid.NewGuid(),
                    "pension",
                    null,
                    30_000m,
                    7m,
                    200m),
            ],
            UseInvestmentBreakdown: true));

        var simplified = await service.SaveAsync(new SaveUserProfileRequest(
            50_000m,
            40_000m,
            null,
            6m,
            null,
            300m,
            null,
            UseInvestmentBreakdown: false));

        Assert.True(simplified.IsSuccess);
        Assert.False(simplified.Value.UseInvestmentBreakdown);
        Assert.Equal(2, simplified.Value.InvestmentHoldings!.Count);
        Assert.Equal("stocksIsa", simplified.Value.InvestmentHoldings![0].Category);
        Assert.Equal("pension", simplified.Value.InvestmentHoldings![1].Category);
    }

    [Fact]
    public async Task SaveAsync_EmptyHoldingsPayloadPreservesExistingBreakdown()
    {
        var repository = new FakeUserProfileRepository();
        var service = new ProfileService(repository);

        await service.SaveAsync(new SaveUserProfileRequest(
            null,
            40_000m,
            null,
            6.5m,
            null,
            300m,
            [
                new InvestmentHoldingDto(
                    Guid.NewGuid(),
                    "stocksIsa",
                    null,
                    10_000m,
                    5m,
                    100m),
                new InvestmentHoldingDto(
                    Guid.NewGuid(),
                    "pension",
                    null,
                    30_000m,
                    8m,
                    200m),
            ],
            UseInvestmentBreakdown: true));

        var resync = await service.SaveAsync(new SaveUserProfileRequest(
            null,
            40_000m,
            null,
            6.5m,
            null,
            300m,
            [],
            UseInvestmentBreakdown: true));

        Assert.True(resync.IsSuccess);
        Assert.Equal(2, resync.Value.InvestmentHoldings!.Count);
        Assert.Equal("stocksIsa", resync.Value.InvestmentHoldings![0].Category);
        Assert.Equal("pension", resync.Value.InvestmentHoldings![1].Category);
    }

    [Fact]
    public async Task SaveAsync_ReportsIncompleteWhenNoGoalInputs()
    {
        var service = new ProfileService(new FakeUserProfileRepository());

        var savedResult = await service.SaveAsync(new SaveUserProfileRequest(null, null, null));

        Assert.True(savedResult.IsSuccess);
        Assert.False(savedResult.Value.HasMinimumGoalInputs);
    }

    [Fact]
    public async Task SaveAsync_RejectsNegativeValues()
    {
        var service = new ProfileService(new FakeUserProfileRepository());

        var negativeSalary = await service.SaveAsync(new SaveUserProfileRequest(-1m, null, null));
        Assert.True(negativeSalary.IsFailed);

        var invalidInvestmentRate = await service.SaveAsync(new SaveUserProfileRequest(null, null, null, 101m));
        Assert.True(invalidInvestmentRate.IsFailed);

        var negativeSavingsRate = await service.SaveAsync(new SaveUserProfileRequest(null, null, null, null, -1m));
        Assert.True(negativeSavingsRate.IsFailed);

        var negativeContributions = await service.SaveAsync(new SaveUserProfileRequest(null, null, null, null, null, -1m));
        Assert.True(negativeContributions.IsFailed);
    }

    private sealed class FakeUserProfileRepository : IUserProfileRepository
    {
        private UserProfile? _profile;

        public Task<UserProfile?> GetAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult(_profile);

        public Task<UserProfile> SaveAsync(UserProfile profile, CancellationToken cancellationToken = default)
        {
            _profile = profile;
            return Task.FromResult(_profile);
        }
    }
}
