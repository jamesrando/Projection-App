using ProjectionApp.Domain.Entities;

namespace ProjectionApp.Application.Profiles;

public sealed class ProfileService(IUserProfileRepository repository) : IProfileService
{
    public async Task<UserProfileDto?> GetAsync(CancellationToken cancellationToken = default)
    {
        var profile = await repository.GetAsync(cancellationToken);
        return profile is null ? null : ToDto(profile);
    }

    public async Task<UserProfileDto> SaveAsync(
        SaveUserProfileRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateRequest(request);

        var existing = await repository.GetAsync(cancellationToken);
        var profile = new UserProfile
        {
            Id = existing?.Id ?? Guid.NewGuid(),
            AnnualSalary = request.AnnualSalary,
            CurrentInvestments = request.CurrentInvestments,
            CurrentCashSavings = request.CurrentCashSavings,
            InvestmentInterestRate = request.InvestmentInterestRate,
            SavingsInterestRate = request.SavingsInterestRate,
            MonthlyInvestmentContributions = request.MonthlyInvestmentContributions,
        };

        var saved = await repository.SaveAsync(profile, cancellationToken);
        return ToDto(saved);
    }

    private static void ValidateRequest(SaveUserProfileRequest request)
    {
        if (request.AnnualSalary is < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(request), "Annual salary cannot be negative.");
        }

        if (request.CurrentInvestments is < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(request), "Current investments cannot be negative.");
        }

        if (request.CurrentCashSavings is < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(request), "Current cash savings cannot be negative.");
        }

        if (request.InvestmentInterestRate is < 0 or > 100)
        {
            throw new ArgumentOutOfRangeException(
                nameof(request),
                "Investment interest rate must be between 0 and 100.");
        }

        if (request.SavingsInterestRate is < 0 or > 100)
        {
            throw new ArgumentOutOfRangeException(
                nameof(request),
                "Savings interest rate must be between 0 and 100.");
        }

        if (request.MonthlyInvestmentContributions is < 0)
        {
            throw new ArgumentOutOfRangeException(
                nameof(request),
                "Monthly investment contributions cannot be negative.");
        }
    }

    internal static UserProfileDto ToDto(UserProfile profile) =>
        new(
            profile.Id,
            profile.AnnualSalary,
            profile.CurrentInvestments,
            profile.CurrentCashSavings,
            profile.InvestmentInterestRate,
            profile.SavingsInterestRate,
            profile.MonthlyInvestmentContributions,
            profile.MonthlyCashFlow,
            profile.TotalPosition);
}
