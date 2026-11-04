namespace ProjectionApp.Application.Salary;

public sealed record BudgetCategoryDto(
    decimal Percent,
    decimal Annual,
    decimal Monthly);

public sealed record BudgetSplitDto(
    BudgetCategoryDto Needs,
    BudgetCategoryDto Wants,
    BudgetCategoryDto Savings);
