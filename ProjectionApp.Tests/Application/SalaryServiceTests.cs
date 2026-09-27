using ProjectionApp.Application.Profiles;
using ProjectionApp.Application.Salary;
using ProjectionApp.Domain.Entities;

namespace ProjectionApp.Tests.Application;

public class SalaryServiceTests
{
    [Fact]
    public async Task CalculateTakeHomeAsync_UsesRequestSalaryWhenProvided()
    {
        var repository = new FakeUserProfileRepository(new UserProfile { AnnualSalary = 30_000m });
        var service = new SalaryService(repository);

        var result = await service.CalculateTakeHomeAsync(new CalculateTakeHomeRequest(50_000m));

        Assert.Equal(50_000m, result.AnnualGrossSalary);
        Assert.Equal(39_519.60m, result.NetAnnual);
        Assert.Equal("2025/26", result.TaxYear);
    }

    [Fact]
    public async Task CalculateTakeHomeAsync_FallsBackToProfileSalary()
    {
        var repository = new FakeUserProfileRepository(new UserProfile { AnnualSalary = 50_000m });
        var service = new SalaryService(repository);

        var result = await service.CalculateTakeHomeAsync();

        Assert.Equal(50_000m, result.AnnualGrossSalary);
        Assert.Equal(39_519.60m, result.NetAnnual);
    }

    [Fact]
    public async Task CalculateTakeHomeAsync_IncludesBudgetSplit()
    {
        var repository = new FakeUserProfileRepository(new UserProfile { AnnualSalary = 50_000m });
        var service = new SalaryService(repository);

        var result = await service.CalculateTakeHomeAsync();

        Assert.Equal(19_759.80m, result.BudgetSplit.Needs.Annual);
        Assert.Equal(11_855.88m, result.BudgetSplit.Wants.Annual);
        Assert.Equal(7_903.92m, result.BudgetSplit.Savings.Annual);
    }

    [Fact]
    public async Task CalculateTakeHomeAsync_ThrowsWhenNoSalaryAvailable()
    {
        var repository = new FakeUserProfileRepository(null);
        var service = new SalaryService(repository);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CalculateTakeHomeAsync());
    }

    [Fact]
    public async Task CalculateTakeHomeAsync_ThrowsWhenSalaryInvalid()
    {
        var repository = new FakeUserProfileRepository(new UserProfile { AnnualSalary = 50_000m });
        var service = new SalaryService(repository);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CalculateTakeHomeAsync(new CalculateTakeHomeRequest(0m)));
    }

    private sealed class FakeUserProfileRepository(UserProfile? profile) : IUserProfileRepository
    {
        public Task<UserProfile?> GetAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult(profile);

        public Task<UserProfile> SaveAsync(UserProfile updatedProfile, CancellationToken cancellationToken = default) =>
            Task.FromResult(updatedProfile);
    }
}
