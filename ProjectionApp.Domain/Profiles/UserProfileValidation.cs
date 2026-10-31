namespace ProjectionApp.Domain.Profiles;

public static class UserProfileValidation
{
    public const decimal MinInterestRatePercent = 0m;
    public const decimal MaxInterestRatePercent = 100m;

    public const string IncompleteForGoalsMessage =
        "Profile is incomplete. Enter annual salary, investments, or cash savings.";

    public const string NegativeAnnualSalaryMessage = "Annual salary cannot be negative.";
    public const string NegativeCurrentInvestmentsMessage = "Current investments cannot be negative.";
    public const string NegativeCurrentCashSavingsMessage = "Current cash savings cannot be negative.";
    public const string InvalidInvestmentInterestRateMessage =
        "Investment interest rate must be between 0 and 100.";
    public const string InvalidSavingsInterestRateMessage =
        "Savings interest rate must be between 0 and 100.";
    public const string NegativeMonthlyContributionsMessage =
        "Monthly investment contributions cannot be negative.";

    public static bool HasMinimumGoalInputs(
        decimal? annualSalary,
        decimal? currentInvestments,
        decimal? currentCashSavings) =>
        annualSalary is not null ||
        currentInvestments is not null ||
        currentCashSavings is not null;

    public static IReadOnlyList<string> Validate(
        decimal? annualSalary,
        decimal? currentInvestments,
        decimal? currentCashSavings,
        decimal? investmentInterestRate,
        decimal? savingsInterestRate,
        decimal? monthlyInvestmentContributions)
    {
        var errors = new List<string>();

        if (annualSalary is < 0)
        {
            errors.Add(NegativeAnnualSalaryMessage);
        }

        if (currentInvestments is < 0)
        {
            errors.Add(NegativeCurrentInvestmentsMessage);
        }

        if (currentCashSavings is < 0)
        {
            errors.Add(NegativeCurrentCashSavingsMessage);
        }

        if (investmentInterestRate is < MinInterestRatePercent or > MaxInterestRatePercent)
        {
            errors.Add(InvalidInvestmentInterestRateMessage);
        }

        if (savingsInterestRate is < MinInterestRatePercent or > MaxInterestRatePercent)
        {
            errors.Add(InvalidSavingsInterestRateMessage);
        }

        if (monthlyInvestmentContributions is < 0)
        {
            errors.Add(NegativeMonthlyContributionsMessage);
        }

        return errors;
    }
}
