using FluentResults;
using ProjectionApp.Application.Common;
using ProjectionApp.Application.Profiles;

namespace ProjectionApp.Application.Salary;

public sealed class SalaryService(IUserProfileRepository repository) : ISalaryService
{
    public async Task<Result<TakeHomeResultDto>> CalculateTakeHomeAsync(
        CalculateTakeHomeRequest? request = null,
        CancellationToken cancellationToken = default)
    {
        var salaryResult = await ResolveAnnualGrossSalaryAsync(request?.AnnualGrossSalary, cancellationToken);
        if (salaryResult.IsFailed)
        {
            return Result.Fail<TakeHomeResultDto>(salaryResult.Errors);
        }

        var annualGrossSalary = salaryResult.Value;
        if (annualGrossSalary <= 0m)
        {
            return Result.Fail<TakeHomeResultDto>(
                new ValidationError("Annual gross salary must be greater than zero."));
        }

        var taxBreakdown = UkTaxCalculator.Calculate(annualGrossSalary);
        var netAnnual = annualGrossSalary - taxBreakdown.TotalDeductionsAnnual;
        var netMonthly = Math.Round(netAnnual / 12m, 2, MidpointRounding.AwayFromZero);
        var budgetSplit = BudgetSplitter.Split(netAnnual);

        return Result.Ok(new TakeHomeResultDto(
            AnnualGrossSalary: annualGrossSalary,
            TaxBreakdown: taxBreakdown,
            NetAnnual: netAnnual,
            NetMonthly: netMonthly,
            BudgetSplit: budgetSplit,
            TaxYear: UkTaxCalculator.TaxYear));
    }

    private async Task<Result<decimal>> ResolveAnnualGrossSalaryAsync(
        decimal? requestSalary,
        CancellationToken cancellationToken)
    {
        if (requestSalary.HasValue)
        {
            return Result.Ok(requestSalary.Value);
        }

        var profile = await repository.GetAsync(cancellationToken);
        if (profile?.AnnualSalary is decimal profileSalary && profileSalary > 0m)
        {
            return Result.Ok(profileSalary);
        }

        return Result.Fail<decimal>(
            new ValidationError(
                "Annual gross salary is required. Enter a salary or save one in your profile."));
    }
}
