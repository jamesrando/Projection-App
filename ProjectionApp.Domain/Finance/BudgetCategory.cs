namespace ProjectionApp.Domain.Finance;

public sealed record BudgetCategory(
    decimal Percent,
    decimal Annual,
    decimal Monthly);
