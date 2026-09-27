namespace ProjectionApp.Domain.Entities;

public sealed class UserProfile
{
    public Guid Id { get; init; } = Guid.NewGuid();

    public decimal? AnnualSalary { get; init; }

    public decimal? CurrentInvestments { get; init; }

    public decimal? CurrentCashSavings { get; init; }

    public decimal? InvestmentInterestRate { get; init; }

    public decimal? SavingsInterestRate { get; init; }

    public decimal? MonthlyInvestmentContributions { get; init; }

    public decimal? MonthlyCashFlow => AnnualSalary is null ? null : AnnualSalary / 12m;

    public decimal TotalPosition => (CurrentInvestments ?? 0m) + (CurrentCashSavings ?? 0m);

    public bool HasAnyBalance =>
        AnnualSalary is not null ||
        CurrentInvestments is not null ||
        CurrentCashSavings is not null;
}
