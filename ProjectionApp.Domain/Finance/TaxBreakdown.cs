namespace ProjectionApp.Domain.Finance;

public sealed record TaxBreakdown(
    decimal IncomeTaxAnnual,
    decimal NationalInsuranceAnnual,
    decimal TotalDeductionsAnnual,
    decimal IncomeTaxMonthly,
    decimal NationalInsuranceMonthly,
    decimal TotalDeductionsMonthly);
