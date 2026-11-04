using ProjectionApp.Domain.Profiles;

namespace ProjectionApp.Tests.Domain;

public class UserProfileValidationTests
{
    [Fact]
    public void HasMinimumGoalInputs_AcceptsSalaryAlone()
    {
        Assert.True(UserProfileValidation.HasMinimumGoalInputs(50_000m, null, null));
    }

    [Fact]
    public void HasMinimumGoalInputs_AcceptsInvestmentsOrSavings()
    {
        Assert.True(UserProfileValidation.HasMinimumGoalInputs(null, 10_000m, null));
        Assert.True(UserProfileValidation.HasMinimumGoalInputs(null, null, 5_000m));
    }

    [Fact]
    public void HasMinimumGoalInputs_RejectsEmptyProfile()
    {
        Assert.False(UserProfileValidation.HasMinimumGoalInputs(null, null, null));
    }

    [Fact]
    public void Validate_RejectsNegativeSalary()
    {
        var errors = UserProfileValidation.Validate(-1m, null, null, null, null, null);
        Assert.Contains(UserProfileValidation.NegativeAnnualSalaryMessage, errors);
    }

    [Fact]
    public void Validate_RejectsInterestRateAboveMax()
    {
        var errors = UserProfileValidation.Validate(null, null, null, 101m, null, null);
        Assert.Contains(UserProfileValidation.InvalidInvestmentInterestRateMessage, errors);
    }

    [Fact]
    public void Validate_AcceptsEmptyProfile()
    {
        var errors = UserProfileValidation.Validate(null, null, null, null, null, null);
        Assert.Empty(errors);
    }
}
