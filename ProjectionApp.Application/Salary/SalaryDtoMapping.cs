using ProjectionApp.Domain.Finance;

namespace ProjectionApp.Application.Salary;

internal static class SalaryDtoMapping
{
    public static TaxBreakdownDto ToDto(this TaxBreakdown breakdown) =>
        new(
            breakdown.IncomeTaxAnnual,
            breakdown.NationalInsuranceAnnual,
            breakdown.TotalDeductionsAnnual,
            breakdown.IncomeTaxMonthly,
            breakdown.NationalInsuranceMonthly,
            breakdown.TotalDeductionsMonthly);

    public static BudgetSplitDto ToDto(this BudgetSplit split) =>
        new(
            split.Needs.ToDto(),
            split.Wants.ToDto(),
            split.Savings.ToDto());

    private static BudgetCategoryDto ToDto(this BudgetCategory category) =>
        new(category.Percent, category.Annual, category.Monthly);
}
