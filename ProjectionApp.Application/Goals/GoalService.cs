using FluentResults;
using ProjectionApp.Application.Common;
using ProjectionApp.Application.Profiles;
using ProjectionApp.Domain.Entities;
using ProjectionApp.Domain.Goals;

namespace ProjectionApp.Application.Goals;

public sealed class GoalService(IUserProfileRepository repository) : IGoalService
{
    public const decimal DefaultTargetAmount = 100_000m;

    public async Task<Result<SavingsGoalResultDto>> AnalyzeSavingsGoalAsync(
        decimal? targetAmount = null,
        GoalScenarioOverrides? overrides = null,
        CancellationToken cancellationToken = default)
    {
        var profile = await repository.GetAsync(cancellationToken);
        if (profile is null)
        {
            return Result.Fail<SavingsGoalResultDto>(
                new ValidationError("Profile has not been saved yet."));
        }

        if (!profile.HasAnyBalance)
        {
            return Result.Fail<SavingsGoalResultDto>(
                new ValidationError("Profile is incomplete. Provide at least a balance."));
        }

        var resolvedTarget = targetAmount ?? DefaultTargetAmount;
        if (resolvedTarget <= 0m)
        {
            return Result.Fail<SavingsGoalResultDto>(
                new ValidationError("Target amount must be greater than zero."));
        }

        return Result.Ok(Analyze(profile, resolvedTarget, overrides));
    }

    internal static SavingsGoalResultDto Analyze(
        UserProfile profile,
        decimal targetAmount,
        GoalScenarioOverrides? overrides = null)
    {
        var currentInvestments = profile.CurrentInvestments ?? 0m;
        var currentCashSavings = profile.CurrentCashSavings ?? 0m;
        var currentPosition = currentInvestments + currentCashSavings;
        var remainingAmount = Math.Max(0m, targetAmount - currentPosition);
        var progressPercent = currentPosition <= 0m
            ? 0m
            : Math.Min(100m, currentPosition / targetAmount * 100m);
        var monthlyCashFlow = profile.MonthlyCashFlow;
        var isGoalMet = currentPosition >= targetAmount;
        var (monthlyContribution, contributionsInferredFromSalary) = ResolveContribution(profile, overrides);
        var investmentInterestRate = overrides?.InvestmentInterestRate ?? profile.InvestmentInterestRate;
        var savingsInterestRate = overrides?.SavingsInterestRate ?? profile.SavingsInterestRate;
        var investmentMonthlyRate = (investmentInterestRate ?? 0m) / 100m / 12m;
        var savingsMonthlyRate = (savingsInterestRate ?? 0m) / 100m / 12m;

        var simulation = isGoalMet
            ? null
            : SavingsGoalSimulator.SimulateToGoal(
                currentInvestments,
                currentCashSavings,
                monthlyContribution,
                investmentMonthlyRate,
                savingsMonthlyRate,
                targetAmount);

        var monthlySeries = isGoalMet
            ? new List<GoalTimelinePointDto>
            {
                new(0, currentInvestments, currentCashSavings, currentPosition, 0m, 0m),
            }
            : simulation?.MonthlySeries.ToDto();

        var estimatedMonths = isGoalMet ? 0 : simulation?.MonthsToGoal;
        decimal? estimatedYears = estimatedMonths is null
            ? null
            : Math.Round(estimatedMonths.Value / 12m, 2, MidpointRounding.AwayFromZero);

        var isReachable = isGoalMet || estimatedMonths is not null;

        var investmentsSharePercent = currentPosition <= 0m
            ? 0m
            : Math.Round(currentInvestments / currentPosition * 100m, 1, MidpointRounding.AwayFromZero);
        var savingsSharePercent = currentPosition <= 0m
            ? 0m
            : Math.Round(currentCashSavings / currentPosition * 100m, 1, MidpointRounding.AwayFromZero);

        var goalReached = simulation?.MonthsToGoal is not null;

        var breakdown = new GoalBreakdownDto(
            currentInvestments,
            currentCashSavings,
            investmentsSharePercent,
            savingsSharePercent,
            currentInvestments * investmentMonthlyRate + monthlyContribution,
            currentCashSavings * savingsMonthlyRate,
            goalReached ? simulation!.ProjectedInvestments : null,
            goalReached ? simulation!.ProjectedCashSavings : null,
            goalReached ? simulation!.TotalContributionsAdded : null,
            goalReached ? simulation!.InvestmentInterestEarned : null,
            goalReached ? simulation!.SavingsInterestEarned : null,
            goalReached ? simulation!.TotalInterestEarned : null);

        return new SavingsGoalResultDto(
            targetAmount,
            currentPosition,
            remainingAmount,
            progressPercent,
            monthlyCashFlow,
            estimatedMonths,
            estimatedYears,
            investmentInterestRate,
            savingsInterestRate,
            profile.MonthlyInvestmentContributions,
            monthlyContribution,
            contributionsInferredFromSalary,
            isGoalMet,
            isReachable,
            breakdown,
            monthlySeries);
    }

    private static (decimal EffectiveMonthlyContribution, bool InferredFromSalary) ResolveContribution(
        UserProfile profile,
        GoalScenarioOverrides? overrides)
    {
        if (overrides?.MonthlyContribution is decimal overrideContribution)
        {
            return (overrideContribution, false);
        }

        return GoalContributionResolver.Resolve(profile);
    }
}
