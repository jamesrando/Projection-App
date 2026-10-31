namespace ProjectionApp.Domain.Finance;

public sealed record BudgetSplit(
    BudgetCategory Needs,
    BudgetCategory Wants,
    BudgetCategory Savings);
