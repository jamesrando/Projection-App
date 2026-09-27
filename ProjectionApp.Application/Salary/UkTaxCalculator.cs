namespace ProjectionApp.Application.Salary;

public static class UkTaxCalculator
{
    public const string TaxYear = "2025/26";

    private const decimal PersonalAllowance = 12_570m;
    private const decimal PersonalAllowanceTaperStart = 100_000m;
    private const decimal BasicRateUpperLimit = 50_270m;
    private const decimal HigherRateUpperLimit = 125_140m;
    private const decimal BasicRateBandWidth = BasicRateUpperLimit - PersonalAllowance;
    private const decimal HigherRateBandWidth = HigherRateUpperLimit - BasicRateUpperLimit;

    private const decimal NiPrimaryThreshold = 12_570m;
    private const decimal NiUpperEarningsLimit = 50_270m;
    private const decimal NiMainRate = 0.08m;
    private const decimal NiAdditionalRate = 0.02m;

    public static TaxBreakdownDto Calculate(decimal annualGrossSalary)
    {
        var incomeTax = CalculateIncomeTax(annualGrossSalary);
        var nationalInsurance = CalculateNationalInsurance(annualGrossSalary);
        var totalDeductions = incomeTax + nationalInsurance;

        return new TaxBreakdownDto(
            IncomeTaxAnnual: RoundPence(incomeTax),
            NationalInsuranceAnnual: RoundPence(nationalInsurance),
            TotalDeductionsAnnual: RoundPence(totalDeductions),
            IncomeTaxMonthly: RoundPence(incomeTax / 12m),
            NationalInsuranceMonthly: RoundPence(nationalInsurance / 12m),
            TotalDeductionsMonthly: RoundPence(totalDeductions / 12m));
    }

    public static decimal CalculateNetAnnual(decimal annualGrossSalary)
    {
        var breakdown = Calculate(annualGrossSalary);
        return RoundPence(annualGrossSalary - breakdown.TotalDeductionsAnnual);
    }

    private static decimal CalculatePersonalAllowance(decimal annualGrossSalary)
    {
        if (annualGrossSalary <= PersonalAllowanceTaperStart)
        {
            return PersonalAllowance;
        }

        var reduction = (annualGrossSalary - PersonalAllowanceTaperStart) / 2m;
        return Math.Max(0m, PersonalAllowance - reduction);
    }

    private static decimal CalculateIncomeTax(decimal annualGrossSalary)
    {
        var allowance = CalculatePersonalAllowance(annualGrossSalary);
        var taxableIncome = Math.Max(0m, annualGrossSalary - allowance);

        var basicRateTax = Math.Min(taxableIncome, BasicRateBandWidth) * 0.20m;
        var higherRateTax = Math.Min(Math.Max(0m, taxableIncome - BasicRateBandWidth), HigherRateBandWidth) * 0.40m;
        var additionalRateTax = Math.Max(0m, taxableIncome - BasicRateBandWidth - HigherRateBandWidth) * 0.45m;

        return basicRateTax + higherRateTax + additionalRateTax;
    }

    private static decimal CalculateNationalInsurance(decimal annualGrossSalary)
    {
        if (annualGrossSalary <= NiPrimaryThreshold)
        {
            return 0m;
        }

        var mainBandEarnings = Math.Min(annualGrossSalary, NiUpperEarningsLimit) - NiPrimaryThreshold;
        var additionalBandEarnings = Math.Max(0m, annualGrossSalary - NiUpperEarningsLimit);

        return (mainBandEarnings * NiMainRate) + (additionalBandEarnings * NiAdditionalRate);
    }

    private static decimal RoundPence(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
