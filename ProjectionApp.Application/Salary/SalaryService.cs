using ProjectionApp.Application.Profiles;

namespace ProjectionApp.Application.Salary;

public sealed class SalaryService(IUserProfileRepository repository) : ISalaryService
{
    public async Task<TakeHomeResultDto> CalculateTakeHomeAsync(
        CalculateTakeHomeRequest? request = null,
        CancellationToken cancellationToken = default)
    {
        var annualGrossSalary = await ResolveAnnualGrossSalaryAsync(request?.AnnualGrossSalary, cancellationToken);

        if (annualGrossSalary <= 0m)
        {
            throw new InvalidOperationException("Annual gross salary must be greater than zero.");
        }

        var taxBreakdown = UkTaxCalculator.Calculate(annualGrossSalary);
        var netAnnual = annualGrossSalary - taxBreakdown.TotalDeductionsAnnual;
        var netMonthly = Math.Round(netAnnual / 12m, 2, MidpointRounding.AwayFromZero);
        var budgetSplit = BudgetSplitter.Split(netAnnual);

        return new TakeHomeResultDto(
            AnnualGrossSalary: annualGrossSalary,
            TaxBreakdown: taxBreakdown,
            NetAnnual: netAnnual,
            NetMonthly: netMonthly,
            BudgetSplit: budgetSplit,
            TaxYear: UkTaxCalculator.TaxYear);
    }

    private async Task<decimal> ResolveAnnualGrossSalaryAsync(
        decimal? requestSalary,
        CancellationToken cancellationToken)
    {
        if (requestSalary.HasValue)
        {
            return requestSalary.Value;
        }

        var profile = await repository.GetAsync(cancellationToken);
        if (profile?.AnnualSalary is decimal profileSalary && profileSalary > 0m)
        {
            return profileSalary;
        }

        throw new InvalidOperationException(
            "Annual gross salary is required. Enter a salary or save one in your profile.");
    }
}
