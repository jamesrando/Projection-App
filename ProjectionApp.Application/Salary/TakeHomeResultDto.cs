namespace ProjectionApp.Application.Salary;

public sealed record TakeHomeResultDto(
    decimal AnnualGrossSalary,
    TaxBreakdownDto TaxBreakdown,
    decimal NetAnnual,
    decimal NetMonthly,
    BudgetSplitDto BudgetSplit,
    string TaxYear);
