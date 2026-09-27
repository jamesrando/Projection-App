using ProjectionApp.Application.Profiles;
using ProjectionApp.Domain.Entities;

namespace ProjectionApp.Application.Goals;

public sealed class GoalService(IUserProfileRepository repository) : IGoalService
{
    public const decimal DefaultTargetAmount = 100_000m;

    public async Task<Reach100kGoalResultDto> AnalyzeReach100kAsync(
        decimal? targetAmount = null,
        GoalScenarioOverrides? overrides = null,
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

        return Analyze(profile, resolvedTarget, overrides);
    }

    internal static Reach100kGoalResultDto Analyze(
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

        var projection = isGoalMet
            ? null
            : SimulateToGoal(
                currentInvestments,
                currentCashSavings,
                monthlyContribution,
                investmentMonthlyRate,
                savingsMonthlyRate,
                targetAmount);

        var monthlySeries = isGoalMet
            ? [CreateMonthlyPoint(0, currentInvestments, currentCashSavings, 0m, 0m)]
            : projection?.MonthlySeries;

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

        var goalReached = projection?.MonthsToGoal is not null;

        var breakdown = new GoalBreakdownDto(
            currentInvestments,
            currentCashSavings,
            investmentsSharePercent,
            savingsSharePercent,
            currentInvestments * investmentMonthlyRate + monthlyContribution,
            currentCashSavings * savingsMonthlyRate,
            goalReached ? projection!.ProjectedInvestments : null,
            goalReached ? projection!.ProjectedCashSavings : null,
            goalReached ? projection!.TotalContributionsAdded : null,
            goalReached ? projection!.InvestmentInterestEarned : null,
            goalReached ? projection!.SavingsInterestEarned : null,
            goalReached ? projection!.TotalInterestEarned : null);

        return new Reach100kGoalResultDto(
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

        return GoalContributionCalculator.Resolve(profile);
    }

    private sealed record ProjectionSnapshot(
        int? MonthsToGoal,
        decimal ProjectedInvestments,
        decimal ProjectedCashSavings,
        decimal TotalContributionsAdded,
        decimal InvestmentInterestEarned,
        decimal SavingsInterestEarned,
        IReadOnlyList<MonthlyProjectionPointDto> MonthlySeries)
    {
        public decimal TotalInterestEarned => InvestmentInterestEarned + SavingsInterestEarned;
    }

    private static MonthlyProjectionPointDto CreateMonthlyPoint(
        int month,
        decimal investments,
        decimal savings,
        decimal cumulativeContributions,
        decimal cumulativeInterest) =>
        new(
            month,
            investments,
            savings,
            investments + savings,
            cumulativeContributions,
            cumulativeInterest);

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
        var monthlySeries = new List<MonthlyProjectionPointDto>
        {
            CreateMonthlyPoint(0, investments, savings, 0m, 0m),
        };

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

            monthlySeries.Add(CreateMonthlyPoint(
                month,
                investments,
                savings,
                totalContributionsAdded,
                investmentInterestEarned + savingsInterestEarned));

            if (investments + savings >= targetAmount)
            {
                return new ProjectionSnapshot(
                    month,
                    investments,
                    savings,
                    totalContributionsAdded,
                    investmentInterestEarned,
                    savingsInterestEarned,
                    monthlySeries);
            }
        }

        return new ProjectionSnapshot(
            null,
            investments,
            savings,
            totalContributionsAdded,
            investmentInterestEarned,
            savingsInterestEarned,
            monthlySeries);
    }
}
