using FluentResults;
using ProjectionApp.Application.Common;
using ProjectionApp.Domain.Entities;

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
        var validation = ValidateRequest(request);
        if (validation.IsFailed)
        {
            return Result.Fail<UserProfileDto>(validation.Errors);
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

    private static Result ValidateRequest(SaveUserProfileRequest request)
    {
        if (request.AnnualSalary is < 0)
        {
            return Result.Fail(new ValidationError("Annual salary cannot be negative."));
        }

        if (request.CurrentInvestments is < 0)
        {
            return Result.Fail(new ValidationError("Current investments cannot be negative."));
        }

        if (request.CurrentCashSavings is < 0)
        {
            return Result.Fail(new ValidationError("Current cash savings cannot be negative."));
        }

        if (request.InvestmentInterestRate is < 0 or > 100)
        {
            return Result.Fail(new ValidationError("Investment interest rate must be between 0 and 100."));
        }

        if (request.SavingsInterestRate is < 0 or > 100)
        {
            return Result.Fail(new ValidationError("Savings interest rate must be between 0 and 100."));
        }

        if (request.MonthlyInvestmentContributions is < 0)
        {
            return Result.Fail(new ValidationError("Monthly investment contributions cannot be negative."));
        }

        return Result.Ok();
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
