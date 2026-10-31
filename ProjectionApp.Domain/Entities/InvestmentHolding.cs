namespace ProjectionApp.Domain.Entities;

public sealed class InvestmentHolding
{
    public Guid Id { get; init; } = Guid.NewGuid();

    public string Category { get; init; } = "other";

    public string? CustomLabel { get; init; }

    public decimal? Balance { get; init; }

    public decimal? AnnualReturnRate { get; init; }

    public decimal? MonthlyContribution { get; init; }
}
