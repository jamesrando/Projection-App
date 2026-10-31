using FluentResults;
using ProjectionApp.Application.Common;
using ProjectionApp.Domain.Entities;
using ProjectionApp.Domain.Profiles;

namespace ProjectionApp.Application.Profiles;

public sealed class ProfileService(IUserProfileRepository repository) : IProfileService
{
    public async Task<Result<UserProfileDto>> GetAsync(CancellationToken cancellationToken = default)
    {
        var profile = await repository.GetAsync(cancellationToken);
        return profile is null
            ? Result.Fail<UserProfileDto>(new NotFoundError("Profile not found."))
            : Result.Ok(ToDto(profile));
    }

    public async Task<Result<UserProfileDto>> SaveAsync(
        SaveUserProfileRequest request,
        CancellationToken cancellationToken = default)
    {
        var validationErrors = UserProfileValidation.Validate(
            request.AnnualSalary,
            request.CurrentInvestments,
            request.CurrentCashSavings,
            request.InvestmentInterestRate,
            request.SavingsInterestRate,
            request.MonthlyInvestmentContributions);

        if (validationErrors.Count > 0)
        {
            return Result.Fail<UserProfileDto>(
                validationErrors.Select(message => new ValidationError(message)).ToArray());
        }

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
        return Result.Ok(ToDto(saved));
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
            profile.TotalPosition,
            profile.HasMinimumGoalInputs);
}
