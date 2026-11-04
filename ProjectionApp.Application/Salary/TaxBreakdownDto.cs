namespace ProjectionApp.Application.Salary;

public sealed record TaxBreakdownDto(
    decimal IncomeTaxAnnual,
    decimal NationalInsuranceAnnual,
    decimal TotalDeductionsAnnual,
    decimal IncomeTaxMonthly,
    decimal NationalInsuranceMonthly,
    decimal TotalDeductionsMonthly);
