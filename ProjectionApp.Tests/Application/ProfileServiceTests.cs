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

        var saved = await service.SaveAsync(new SaveUserProfileRequest(
            100_000m,
            50_000m,
            25_000m,
            7.5m,
            4.25m,
            500m));

        Assert.Equal(100_000m, saved.AnnualSalary);
        Assert.Equal(50_000m, saved.CurrentInvestments);
        Assert.Equal(25_000m, saved.CurrentCashSavings);
        Assert.Equal(7.5m, saved.InvestmentInterestRate);
        Assert.Equal(4.25m, saved.SavingsInterestRate);
        Assert.Equal(500m, saved.MonthlyInvestmentContributions);
        Assert.Equal(100_000m / 12m, saved.MonthlyCashFlow);
        Assert.Equal(75_000m, saved.TotalPosition);

        var loaded = await service.GetAsync();
        Assert.NotNull(loaded);
        Assert.Equal(saved.Id, loaded.Id);
        Assert.Equal(75_000m, loaded.TotalPosition);
        Assert.Equal(7.5m, loaded.InvestmentInterestRate);
        Assert.Equal(4.25m, loaded.SavingsInterestRate);
    }

    [Fact]
    public async Task SaveAsync_RejectsNegativeValues()
    {
        var service = new ProfileService(new FakeUserProfileRepository());

        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() =>
            service.SaveAsync(new SaveUserProfileRequest(-1m, null, null)));

        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() =>
            service.SaveAsync(new SaveUserProfileRequest(null, null, null, 101m)));

        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() =>
            service.SaveAsync(new SaveUserProfileRequest(null, null, null, null, -1m)));

        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() =>
            service.SaveAsync(new SaveUserProfileRequest(null, null, null, null, null, -1m)));
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
