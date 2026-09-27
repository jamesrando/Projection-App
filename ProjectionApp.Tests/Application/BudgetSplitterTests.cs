using ProjectionApp.Application.Salary;

namespace ProjectionApp.Tests.Application;

public class BudgetSplitterTests
{
    [Fact]
    public void Split_Applies503020Rule()
    {
        var result = BudgetSplitter.Split(39_520m);

        Assert.Equal(50m, result.Needs.Percent);
        Assert.Equal(19_760m, result.Needs.Annual);
        Assert.Equal(1_646.67m, result.Needs.Monthly);

        Assert.Equal(30m, result.Wants.Percent);
        Assert.Equal(11_856m, result.Wants.Annual);
        Assert.Equal(988m, result.Wants.Monthly);

        Assert.Equal(20m, result.Savings.Percent);
        Assert.Equal(7_904m, result.Savings.Annual);
        Assert.Equal(658.67m, result.Savings.Monthly);
    }

    [Fact]
    public void Split_CategoriesSumToNetAnnual()
    {
        const decimal netAnnual = 39_520m;

        var result = BudgetSplitter.Split(netAnnual);

        var total = result.Needs.Annual + result.Wants.Annual + result.Savings.Annual;
        Assert.Equal(netAnnual, total);
    }
}
