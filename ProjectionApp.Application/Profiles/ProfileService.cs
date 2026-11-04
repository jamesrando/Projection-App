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
        var existing = await repository.GetAsync(cancellationToken);
        var usingBreakdown = request.UseInvestmentBreakdown;
        var holdings = ResolveHoldings(request.InvestmentHoldings, existing?.InvestmentHoldings);

        var currentInvestments = request.CurrentInvestments;
        var investmentInterestRate = request.InvestmentInterestRate;
        var monthlyInvestmentContributions = request.MonthlyInvestmentContributions;

        if (usingBreakdown)
        {
            var rollup = InvestmentHoldingsRollup.Rollup(holdings);
            currentInvestments = rollup.TotalBalance;
            investmentInterestRate = rollup.WeightedAnnualReturnRate;
            monthlyInvestmentContributions = rollup.TotalMonthlyContributions;
        }

        var validationErrors = UserProfileValidation.Validate(
            request.AnnualSalary,
            currentInvestments,
            request.CurrentCashSavings,
            investmentInterestRate,
            request.SavingsInterestRate,
            monthlyInvestmentContributions);

        validationErrors = validationErrors
            .Concat(UserProfileValidation.ValidateHoldings(holdings))
            .Distinct()
            .ToList();

        if (validationErrors.Count > 0)
        {
            return Result.Fail<UserProfileDto>(
                validationErrors.Select(message => new ValidationError(message)).ToArray());
        }

        var profile = new UserProfile
        {
            Id = existing?.Id ?? Guid.NewGuid(),
            AnnualSalary = request.AnnualSalary,
            CurrentInvestments = currentInvestments,
            CurrentCashSavings = request.CurrentCashSavings,
            InvestmentInterestRate = investmentInterestRate,
            SavingsInterestRate = request.SavingsInterestRate,
            MonthlyInvestmentContributions = monthlyInvestmentContributions,
            InvestmentHoldings = holdings.Count > 0 ? holdings : null,
            UseInvestmentBreakdown = usingBreakdown,
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
            MapHoldingsToDto(profile.InvestmentHoldings),
            profile.UseInvestmentBreakdown,
            profile.TotalPosition,
            profile.HasMinimumGoalInputs);

    private static IReadOnlyList<InvestmentHolding> ResolveHoldings(
        IReadOnlyList<InvestmentHoldingDto>? requestedHoldings,
        IReadOnlyList<InvestmentHolding>? existingHoldings)
    {
        if (requestedHoldings is not null)
        {
            if (requestedHoldings.Count == 0 && existingHoldings is { Count: > 0 })
            {
                return existingHoldings.ToList();
            }

            return MapHoldings(requestedHoldings);
        }

        return existingHoldings?.ToList() ?? [];
    }

    private static IReadOnlyList<InvestmentHolding> MapHoldings(
        IReadOnlyList<InvestmentHoldingDto> holdings) =>
        holdings.Select(holding => new InvestmentHolding
        {
            Id = holding.Id == Guid.Empty ? Guid.NewGuid() : holding.Id,
            Category = holding.Category,
            CustomLabel = holding.CustomLabel,
            Balance = holding.Balance,
            AnnualReturnRate = holding.AnnualReturnRate,
            MonthlyContribution = holding.MonthlyContribution,
        }).ToList();

    private static IReadOnlyList<InvestmentHoldingDto>? MapHoldingsToDto(
        IReadOnlyList<InvestmentHolding>? holdings) =>
        holdings?.Select(holding => new InvestmentHoldingDto(
            holding.Id,
            holding.Category,
            holding.CustomLabel,
            holding.Balance,
            holding.AnnualReturnRate,
            holding.MonthlyContribution)).ToList();
}
