using ProjectionApp.Application.Profiles;
using ProjectionApp.Domain.Entities;

namespace ProjectionApp.Application.Goals;

public sealed class GoalService(IUserProfileRepository repository) : IGoalService
{
    public const decimal DefaultTargetAmount = 100_000m;

    public async Task<Reach100kGoalResultDto> AnalyzeReach100kAsync(
        decimal? targetAmount = null,
        CancellationToken cancellationToken = default)
    {
        var profile = await repository.GetAsync(cancellationToken)
            ?? throw new InvalidOperationException("Profile has not been saved yet.");

        if (!profile.HasAnyBalance)
        {
            throw new InvalidOperationException(
                "Profile is incomplete. Provide at least a balance.");
        }

        var resolvedTarget = targetAmount ?? DefaultTargetAmount;
        if (resolvedTarget <= 0m)
        {
            throw new InvalidOperationException("Target amount must be greater than zero.");
        }

        return Analyze(profile, resolvedTarget);
    }

    internal static Reach100kGoalResultDto Analyze(UserProfile profile, decimal targetAmount)
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
        var monthlyContribution = profile.MonthlyInvestmentContributions ?? 0m;
        var investmentMonthlyRate = (profile.InvestmentInterestRate ?? 0m) / 100m / 12m;
        var savingsMonthlyRate = (profile.SavingsInterestRate ?? 0m) / 100m / 12m;

        var projection = isGoalMet
            ? null
            : SimulateToGoal(
                currentInvestments,
                currentCashSavings,
                monthlyContribution,
                investmentMonthlyRate,
                savingsMonthlyRate,
                targetAmount);

        var estimatedMonths = isGoalMet ? 0 : projection?.MonthsToGoal;
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

        var breakdown = new GoalBreakdownDto(
            currentInvestments,
            currentCashSavings,
            investmentsSharePercent,
            savingsSharePercent,
            currentInvestments * investmentMonthlyRate + monthlyContribution,
            currentCashSavings * savingsMonthlyRate,
            projection?.ProjectedInvestments,
            projection?.ProjectedCashSavings,
            projection?.TotalContributionsAdded,
            projection?.InvestmentInterestEarned,
            projection?.SavingsInterestEarned,
            projection?.TotalInterestEarned);

        return new Reach100kGoalResultDto(
            targetAmount,
            currentPosition,
            remainingAmount,
            progressPercent,
            monthlyCashFlow,
            estimatedMonths,
            estimatedYears,
            profile.InvestmentInterestRate,
            profile.SavingsInterestRate,
            profile.MonthlyInvestmentContributions,
            isGoalMet,
            isReachable,
            breakdown);
    }

    private sealed record ProjectionSnapshot(
        int MonthsToGoal,
        decimal ProjectedInvestments,
        decimal ProjectedCashSavings,
        decimal TotalContributionsAdded,
        decimal InvestmentInterestEarned,
        decimal SavingsInterestEarned)
    {
        public decimal TotalInterestEarned => InvestmentInterestEarned + SavingsInterestEarned;
    }

    private static ProjectionSnapshot? SimulateToGoal(
        decimal investments,
        decimal savings,
        decimal monthlyContribution,
        decimal investmentMonthlyRate,
        decimal savingsMonthlyRate,
        decimal targetAmount)
    {
        if (investmentMonthlyRate == 0m && savingsMonthlyRate == 0m && monthlyContribution == 0m)
        {
            return null;
        }

        if (investments <= 0m && savings <= 0m && monthlyContribution <= 0m)
        {
            return null;
        }

        var totalContributionsAdded = 0m;
        var investmentInterestEarned = 0m;
        var savingsInterestEarned = 0m;

        const int maxMonths = 100 * 12;
        for (var month = 1; month <= maxMonths; month++)
        {
            var investmentInterest = investments * investmentMonthlyRate;
            var savingsInterest = savings * savingsMonthlyRate;
            investments += investmentInterest + monthlyContribution;
            savings += savingsInterest;
            totalContributionsAdded += monthlyContribution;
            investmentInterestEarned += investmentInterest;
            savingsInterestEarned += savingsInterest;

            if (investments + savings >= targetAmount)
            {
                return new ProjectionSnapshot(
                    month,
                    investments,
                    savings,
                    totalContributionsAdded,
                    investmentInterestEarned,
                    savingsInterestEarned);
            }
        }

        return null;
    }
}
