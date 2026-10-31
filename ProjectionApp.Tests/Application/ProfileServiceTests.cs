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
