using ProjectionApp.Application.Salary;

namespace ProjectionApp.Tests.Application;

public class UkTaxCalculatorTests
{
    [Fact]
    public void Calculate_At25k_BasicRateOnly()
    {
        var result = UkTaxCalculator.Calculate(25_000m);

        Assert.Equal(2_486m, result.IncomeTaxAnnual);
        Assert.Equal(994.40m, result.NationalInsuranceAnnual);
        Assert.Equal(3_480.40m, result.TotalDeductionsAnnual);
        Assert.Equal(21_519.60m, UkTaxCalculator.CalculateNetAnnual(25_000m));
    }

    [Fact]
    public void Calculate_At50k_BasicAndHigherBoundary()
    {
        var result = UkTaxCalculator.Calculate(50_000m);

        Assert.Equal(7_486m, result.IncomeTaxAnnual);
        Assert.Equal(2_994.40m, result.NationalInsuranceAnnual);
        Assert.Equal(10_480.40m, result.TotalDeductionsAnnual);
        Assert.Equal(39_519.60m, UkTaxCalculator.CalculateNetAnnual(50_000m));
    }

    [Fact]
    public void Calculate_At100k_PersonalAllowanceTaperStarts()
    {
        var result = UkTaxCalculator.Calculate(100_000m);

        Assert.Equal(27_432m, result.IncomeTaxAnnual);
        Assert.Equal(4_010.60m, result.NationalInsuranceAnnual);
        Assert.Equal(31_442.60m, result.TotalDeductionsAnnual);
        Assert.Equal(68_557.40m, UkTaxCalculator.CalculateNetAnnual(100_000m));
    }

    [Fact]
    public void Calculate_At150k_AdditionalRate()
    {
        var result = UkTaxCalculator.Calculate(150_000m);

        Assert.Equal(53_703.00m, result.IncomeTaxAnnual);
        Assert.Equal(5_010.60m, result.NationalInsuranceAnnual);
        Assert.Equal(58_713.60m, result.TotalDeductionsAnnual);
        Assert.Equal(91_286.40m, UkTaxCalculator.CalculateNetAnnual(150_000m));
    }

    [Fact]
    public void Calculate_AtZero_NoDeductions()
    {
        var result = UkTaxCalculator.Calculate(0m);

        Assert.Equal(0m, result.IncomeTaxAnnual);
        Assert.Equal(0m, result.NationalInsuranceAnnual);
        Assert.Equal(0m, result.TotalDeductionsAnnual);
    }
}
