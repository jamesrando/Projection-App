namespace ProjectionApp.Domain.Goals;

public static class SavingsGoalSimulator
{
    public static SavingsGoalSimulationResult? SimulateToGoal(
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
        var monthlySeries = new List<GoalTimelinePoint>
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
                return new SavingsGoalSimulationResult(
                    month,
                    investments,
                    savings,
                    totalContributionsAdded,
                    investmentInterestEarned,
                    savingsInterestEarned,
                    monthlySeries);
            }
        }

        return new SavingsGoalSimulationResult(
            null,
            investments,
            savings,
            totalContributionsAdded,
            investmentInterestEarned,
            savingsInterestEarned,
            monthlySeries);
    }

    private static GoalTimelinePoint CreateMonthlyPoint(
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
}
